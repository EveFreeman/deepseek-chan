// Live2D character driven by parameters rather than the model's exp3 files:
// the library holds only one expression at a time, and we need to combine
// them (blush + heart eyes + glasses) and fade each part independently.
PIXI.live2d.Live2DModel.registerTicker?.(PIXI.Ticker);

// A 2D arm swung through a large angle shows the mesh rotating, however fast it
// goes. So the arm is never animated between poses: it fades out, changes pose
// while invisible, and fades back in.
const BLINK_CLOSE = 0.07;
const BLINK_HOLD = 0.03;
const BLINK_OPEN = 0.13;
const SLEEP_FACE = { ParamEyeLOpen: 0, ParamEyeROpen: 0, EyeSmile: -1, ParamMouthForm: 0.2 };
const SLEEP_POSE = { ParamAngleY: -11, ParamAngleZ: 7, LeanInput: -7, LControl: -0.6, RControl: -0.6 };
const SNOOZE_SECONDS = 5.5;
const ARM_FADE = 0.14;
const MIN_GESTURE_SECONDS = 1.6;
const ARM_MESH_MOVE = 0.02;
const LISTEN_POSE = { LeanInput: -15, ParamAngleY: -3, ParamAngleZ: 3 };
// The SD body is mostly head, so a full-size lean pushes her face at the viewer.
const SD_LEAN = 0.3;
const EYELIDS = ['ParamEyeLOpen', 'ParamEyeROpen'];
const HEAD_INPUTS = { ParamAngleX: 'AngleX', ParamAngleY: 'AngleY', ParamAngleZ: 'AngleZ' };

// Screen area each body type occupies, as fractions of the model's canvas.
const FRAMES = {
  full: { x: 0, y: 0, w: 1, h: 1 },
  // Head to waist; the window's bottom edge cuts her off below that.
  bust: { x: 0.15, y: 0.06, w: 0.7, h: 0.39 },
  sd: { x: 0.32, y: 0.08, w: 0.36, h: 0.27 },
};

class Character {
  constructor(canvas, { mode = 'full', top = 0, bottom = 0, fps = 30, fitParent = false } = {}) {
    this.canvas = canvas;
    this.fitParent = fitParent;
    const box = fitParent ? canvas.parentElement.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight };
    this.mode = mode;
    this.top = top;
    this.bottom = bottom;
    this.app = new PIXI.Application({
      view: canvas,
      width: box.width,
      height: box.height,
      backgroundAlpha: 0,
      antialias: true,
      autoDensity: true,
      resolution: window.devicePixelRatio || 1,
      preserveDrawingBuffer: true, // needed for the click-through alpha test
    });
    this.app.ticker.maxFPS = fps;
    this.current = {};
    this.target = { Clothes2: mode === 'sd' ? 1 : 0 };
    this.current.Clothes2 = this.target.Clothes2;
    this.face = {};
    this.pose = {};
    this.poseNow = {};
    this.props = {};
    this.beats = [];
    this.adds = {};
    this.slots = { left: null, right: null };
    this.hands = Object.fromEntries(Motions.HAND_MESHES.map((id) => [id, 0]));
    this.shown = { left: null, right: null };
    this.fades = { left: null, right: null };
    this.armMeshes = { left: [], right: [] };
    this.listening = false;
    this.blink = { next: 1 + Math.random() * 3, start: null, again: false };
    this.eyelid = 1;
    this.asleep = false;
    this.nextSnooze = 0;
    this.emotionName = 'neutral';
    this.clock = 0;
    this.talk = 0;
    this.shift = { x: 0, y: 0 };
    this.mouth = 0;
    this.placement = null;
    this.snap = false; // true while the user resizes her, so she follows the frame without easing
  }

  async load(url) {
    const base = url.slice(0, url.lastIndexOf('/') + 1);
    const settings = await (await fetch(url)).json();
    settings.url = url;
    settings.FileReferences.Motions = {
      Idle: [{ File: 'Animation/IDLE.motion3.json', FadeInTime: 0.5, FadeOutTime: 0.5 }],
    };
    this.model = await PIXI.live2d.Live2DModel.from(settings, { autoInteract: false, idleMotionGroup: 'Idle' });
    this.app.stage.addChild(this.model);
    this.internal = this.model.internalModel;
    this.core = this.internal.coreModel;
    this.measureArmMeshes();
    const updateCore = this.core.update.bind(this.core);
    this.core.update = () => {
      updateCore();
      this.applyArmFade();
    };
    this.designWidth = this.internal.originalWidth;
    this.designHeight = this.internal.originalHeight;
    this.base = base;
    const physics = await (await fetch(new URL(settings.FileReferences.Physics, url).href)).json();
    this.physicsInputs = new Set(physics.PhysicsSettings.flatMap((set) => set.Input.map((i) => i.Source.Id)));
    // Physics inputs go in after saveParameters, or additions would pile up
    // frame after frame. updateFocus is the only step between that and physics,
    // and replacing it also removes the library's cursor tracking. The rest goes
    // in last, so that blinking and physics outputs do not overwrite it.
    this.internal.updateFocus = () => this.writeParameters(true);
    // The library skips its own blink while any motion plays, and idle always does.
    this.internal.eyeBlink = undefined;
    this.internal.on('beforeModelUpdate', () => this.writeParameters(false));
    this.app.ticker.add(() => this.tick(this.app.ticker.deltaMS / 1000));
    this.layout(true);
    window.addEventListener('resize', () => {
      const box = this.fitParent ? this.canvas.parentElement.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight };
      this.app.renderer.resize(box.width, box.height);
      this.layout(this.snap);
    });
  }

  setMode(mode) {
    this.mode = mode;
    this.target.Clothes2 = mode === 'sd' ? 1 : 0;
    this.layout(false);
  }

  // Fits the current body type into the canvas, feet on the bottom edge.
  computePlacement() {
    const frame = FRAMES[this.mode];
    const availableW = this.app.screen.width;
    const availableH = this.app.screen.height - this.top - this.bottom;
    const fw = frame.w * this.designWidth;
    const fh = frame.h * this.designHeight;
    const scale = Math.min(availableW / fw, availableH / fh);
    return {
      scale,
      x: availableW / 2 - (frame.x * this.designWidth + fw / 2) * scale,
      y: this.top + availableH - (frame.y * this.designHeight + fh) * scale,
    };
  }

  layout(instant) {
    this.goal = this.computePlacement();
    if (instant || !this.placement) this.placement = { ...this.goal };
  }

  setProp(name) {
    if (name === 'noprops') {
      this.props = {};
      this.releaseArms();
    } else if (Motions.HELD.has(name)) this.gesture(name, Infinity);
    else if (Motions.PROPS[name]) this.props = Motions.addProp(this.props, Motions.PROPS[name]);
  }

  gesture(name, seconds) {
    const gesture = Motions.GESTURES[name];
    if (this.slots[gesture.side]?.name !== name) this.startFade(gesture.side);
    this.slots[gesture.side] = { ...gesture, name, until: this.clock + Math.max(seconds, MIN_GESTURE_SECONDS) };
  }

  releaseArm(side) {
    if (this.slots[side]) this.startFade(side);
    this.slots[side] = null;
  }

  // A fade already on its way out picks up the newest pose by itself.
  startFade(side) {
    const fade = this.fades[side];
    if (!fade || fade.swapped) this.fades[side] = { start: this.clock, swapped: false };
  }

  // Finds the meshes each arm's gestures move or swap, by trying the poses once.
  measureArmMeshes() {
    const model = this.core._model;
    const { parameters: params, drawables: meshes } = model;
    const saved = Float32Array.from(params.values);
    const snapshot = () => ({
      opacity: Float32Array.from(meshes.opacities),
      vertices: Array.from({ length: meshes.count }, (_, i) => Float32Array.from(meshes.vertexPositions[i])),
    });
    const pose = (values) => {
      params.values.set(saved);
      for (const [id, value] of Object.entries(values)) params.values[params.ids.indexOf(id)] = value;
      model.update();
      return snapshot();
    };
    const rest = pose({});
    for (const gesture of Object.values(Motions.GESTURES)) {
      const after = pose({ ...gesture.arm, ...(gesture.hand ? { [gesture.hand]: 1 } : {}) });
      const found = new Set(this.armMeshes[gesture.side]);
      for (let i = 0; i < meshes.count; i++) {
        const swapped = Math.abs(after.opacity[i] - rest.opacity[i]) > 0.3;
        const moved = after.vertices[i].some((v, j) => Math.abs(v - rest.vertices[i][j]) > ARM_MESH_MOVE);
        if (swapped || moved) found.add(i);
      }
      this.armMeshes[gesture.side] = [...found];
    }
    params.values.set(saved);
    model.update();
  }

  updateArms() {
    for (const side of ['left', 'right']) {
      const fade = this.fades[side];
      if (!fade) continue;
      const elapsed = this.clock - fade.start;
      if (!fade.swapped && elapsed >= ARM_FADE) {
        const old = this.shown[side];
        const next = this.slots[side];
        if (old?.hand) this.hands[old.hand] = 0;
        if (next?.hand) this.hands[next.hand] = 1;
        this.shown[side] = next;
        fade.swapped = true;
      }
      fade.alpha = elapsed < ARM_FADE ? 1 - elapsed / ARM_FADE : (elapsed - ARM_FADE) / ARM_FADE;
      if (elapsed >= ARM_FADE * 2) this.fades[side] = null;
    }
  }

  // Opacities are recalculated by every model update, so this runs right after it.
  applyArmFade() {
    const { opacities } = this.core._model.drawables;
    for (const side of ['left', 'right']) {
      const alpha = this.fades[side]?.alpha;
      if (alpha === undefined) continue;
      for (const mesh of this.armMeshes[side]) opacities[mesh] *= alpha;
    }
  }

  releaseArms() {
    this.releaseArm('left');
    this.releaseArm('right');
  }

  // Does something small on her own. The caller decides when it ends via relax().
  actIdle(act) {
    this.face = act.face ?? {};
    this.pose = {};
    for (const [at, clip, strength] of act.beats) this.play(clip, at * act.seconds, strength);
    if (act.hand) this.gesture(act.hand, act.seconds);
  }

  sleep() {
    this.asleep = true;
    this.face = SLEEP_FACE;
    this.pose = SLEEP_POSE;
    this.nextSnooze = this.clock + 2;
  }

  wake() {
    this.asleep = false;
    this.relax();
    this.play('recoil', 0, 0.5);
    this.play('blink2', 0.5);
    this.blink.next = this.clock + 1.2;
  }

  // Irregular blinks, with the odd quick double blink. Asleep, the eyes are shut anyway.
  updateBlink() {
    const b = this.blink;
    if (b.start === null) {
      if (this.clock < b.next || this.asleep) {
        this.eyelid = 1;
        return;
      }
      b.start = this.clock;
      b.again = Math.random() < 0.18;
    }
    const t = this.clock - b.start;
    if (t < BLINK_CLOSE) this.eyelid = 1 - t / BLINK_CLOSE;
    else if (t < BLINK_CLOSE + BLINK_HOLD) this.eyelid = 0;
    else if (t < BLINK_CLOSE + BLINK_HOLD + BLINK_OPEN) this.eyelid = (t - BLINK_CLOSE - BLINK_HOLD) / BLINK_OPEN;
    else {
      this.eyelid = 1;
      b.start = null;
      b.next = this.clock + (b.again ? 0.12 : 2 + Math.random() * 4.5);
    }
  }

  // Leans in while the user is typing.
  listen(on) {
    this.listening = on;
  }

  play(clip, delay = 0, strength = 1) {
    this.beats.push({ clip: Motions.CLIPS[clip], start: this.clock + delay, strength });
  }

  // Acts out one sentence: `cue` from Motions.resolveCue, stretched over `seconds`.
  perform(cue, seconds) {
    const preset = Motions.pickPreset(cue.emotion);
    this.emotionName = cue.emotion;
    this.face = preset.face ?? {};
    this.pose = preset.pose ?? {};
    const hand = cue.gestures[0] ?? preset.hand;
    // A held object keeps its arm, so a gesture for that arm gives way.
    if (hand && !this.holdsWith(Motions.GESTURES[hand].side)) this.gesture(hand, seconds);
    if (preset.hold) this.gesture(preset.hold, Infinity);
    if (preset.prop) this.props = Motions.addProp(this.props, preset.prop);
    cue.props.forEach((name) => this.setProp(name));
    for (const [at, clip, strength] of preset.beats ?? []) this.play(clip, at * seconds, strength * cue.level);
    cue.clips.forEach((clip, i) => this.play(clip, (0.08 + i * 0.25) * seconds, cue.level));
  }

  holdsWith(side) {
    return this.slots[side]?.until === Infinity;
  }

  // While waiting for the model's first words.
  thinking() {
    this.face = { key8: 1 };
    this.pose = {};
    this.play('lookUp', 0, 0.8);
    this.play('tiltL', 0.6, 0.5);
  }

  // Back to rest once a reply is over; props only last for the reply.
  relax() {
    this.emotionName = 'neutral';
    this.face = {};
    this.pose = {};
    this.props = {};
    this.releaseArms();
  }

  // Anything the right-click menu offers.
  preview(name) {
    if (Motions.PRESETS[name]) this.perform({ emotion: name, level: 1, clips: [], gestures: [], props: [] }, 3.5);
    else if (Motions.CLIPS[name]) this.play(name);
    else if (Motions.HELD.has(name) && this.slots[Motions.GESTURES[name].side]?.name === name) this.releaseArm(Motions.GESTURES[name].side);
    else if (Motions.GESTURES[name] && !Motions.HELD.has(name)) this.gesture(name, 4);
    else this.setProp(name);
  }

  tick(dt) {
    if (!this.model) return;
    this.clock += dt;
    this.updateBlink();
    if (this.asleep && this.clock >= this.nextSnooze) {
      this.play('snooze');
      this.nextSnooze = this.clock + SNOOZE_SECONDS;
    }
    for (const side of ['left', 'right']) if (this.clock >= (this.slots[side]?.until ?? Infinity)) this.releaseArm(side);
    this.updateArms();
    const next = { ...Motions.withProps(this.face, this.props), Clothes2: this.target.Clothes2 };
    this.target = next;

    const rate = 1 - Math.exp(-dt * 9);
    for (const id of new Set([...Object.keys(this.current), ...Object.keys(next)])) {
      const to = next[id] ?? 0;
      const value = (this.current[id] ?? 0) + (to - (this.current[id] ?? 0)) * rate;
      if (Math.abs(value) < 0.001 && !(id in next)) delete this.current[id];
      else this.current[id] = value;
    }
    // Hand meshes are switches: a fade would show both hands at once.
    Object.assign(this.current, this.hands);

    const pose = this.listening ? { ...LISTEN_POSE, ...this.pose } : this.pose;
    this.ease(this.poseNow, pose, 1 - Math.exp(-dt * 5));
    this.adds = this.collectMotion(dt);

    const place = this.placement;
    const move = 1 - Math.exp(-dt * 8);
    for (const key of ['scale', 'x', 'y']) place[key] += (this.goal[key] - place[key]) * move;
    const height = this.app.screen.height;
    this.model.scale.set(place.scale);
    this.model.position.set(place.x + (this.adds._x ?? 0) * height, place.y + (this.adds._y ?? 0) * height);
  }

  ease(values, targets, rate) {
    for (const id of new Set([...Object.keys(values), ...Object.keys(targets)])) {
      const value = (values[id] ?? 0) + ((targets[id] ?? 0) - (values[id] ?? 0)) * rate;
      if (Math.abs(value) < 0.002 && !(id in targets)) delete values[id];
      else values[id] = value;
    }
  }

  // Sums the running clips, the held pose and the speaking movement for this frame.
  collectMotion(dt) {
    const adds = { ...this.poseNow, ...this.shown.left?.arm, ...this.shown.right?.arm };
    const add = (id, value) => { adds[id] = (adds[id] ?? 0) + value; };
    this.beats = this.beats.filter((beat) => {
      const p = (this.clock - beat.start) / beat.clip[0];
      if (p >= 1) return false;
      if (p >= 0) for (const [id, value] of Object.entries(beat.clip[1](p, beat.strength))) add(id, value);
      return true;
    });

    // Speaking should never look frozen, even in the gaps between clips.
    this.talk += ((this.mouth > 0.02 ? 1 : 0) - this.talk) * (1 - Math.exp(-dt * 4));
    if (this.talk > 0.01) {
      const t = this.clock;
      add('ParamAngleX', this.talk * (3.5 * Math.sin(t * 1.7) + 2 * Math.sin(t * 2.9)));
      add('ParamAngleZ', this.talk * 2.5 * Math.sin(t * 1.3));
      add('ParamAngleY', this.talk * (-5 * this.mouth + 1.5 * Math.sin(t * 2.3)));
      add('ParamBodyAngleZ', this.talk * 2.5 * Math.sin(t * 1.1));
      add('ParamBodyAngleY', this.talk * 2.5 * this.mouth);
    }
    if (this.mode === 'sd' && adds.LeanInput) adds.LeanInput *= SD_LEAN;
    for (const [id, input] of Object.entries(HEAD_INPUTS)) if (adds[id]) adds[input] = adds[id];
    return adds;
  }

  writeParameters(physicsStage) {
    const core = this.core;
    const mine = (id) => this.physicsInputs.has(id) === physicsStage;
    for (const [id, value] of Object.entries(this.current)) if (mine(id)) core.setParameterValueById(id, value);
    for (const [id, value] of Object.entries(this.adds)) if (id[0] !== '_' && mine(id)) core.addParameterValueById(id, value);
    if (this.eyelid < 1) {
      for (const id of EYELIDS) if (mine(id)) core.setParameterValueById(id, core.getParameterValueById(id) * this.eyelid);
    }
    if (!physicsStage && this.mouth > 0.01) {
      core.setParameterValueById('ParamMouthOpenY', this.mouth);
      core.setParameterValueById('JawOpen', this.mouth * 0.6);
    }
  }

  // The box around everything drawn this frame, in CSS px, or null when nothing is.
  bounds() {
    const gl = this.app.renderer.gl;
    const ratio = this.app.renderer.resolution;
    const w = gl.drawingBufferWidth;
    const h = gl.drawingBufferHeight;
    const pixels = new Uint8Array(w * h * 4);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    let left = w, right = -1, top = h, bottom = -1;
    for (let y = 0; y < h; y += 2) {
      const row = y * w * 4;
      for (let x = 0; x < w; x += 2) {
        if (pixels[row + x * 4 + 3] <= 24) continue;
        if (x < left) left = x;
        if (x > right) right = x;
        if (y < top) top = y;
        if (y > bottom) bottom = y;
      }
    }
    if (right < 0) return null;
    // GL rows run bottom to top.
    return { x: left / ratio, y: (h - bottom - 1) / ratio, w: (right - left + 2) / ratio, h: (bottom - top + 2) / ratio };
  }

  // True when the pixel under (x, y) in CSS px belongs to the character.
  hit(x, y) {
    const gl = this.app.renderer.gl;
    const ratio = this.app.renderer.resolution;
    const pixel = new Uint8Array(4);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.readPixels(Math.round(x * ratio), gl.drawingBufferHeight - Math.round(y * ratio), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
    return pixel[3] > 24;
  }
}

window.Character = Character;
