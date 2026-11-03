// Motion library. Parameters were picked by measuring each one's real mesh
// effect; ids such as Angry or Param136 exist in the model but move nothing.
//
// A clip is a short additive move: [seconds, (p, a) => offsets], where p runs
// 0..1 and a is the strength. `_x`, `_y` and `_rot` move the whole model.
// A preset is one way to act out an emotion over a sentence:
//   face  held parameter values
//   pose  held additive offsets (leaning, head angle)
//   beats [position in the sentence 0..1, clip, strength]
//   hand  gesture held for the sentence
//   hold, prop  held object or worn item, kept until the reply ends

(() => {
// Scoped: classic browser scripts share one global namespace.
const PI = Math.PI;
const hump = (p) => Math.sin(p * PI);
const hold = (p) => Math.min(1, hump(p) * 2.2);
const wave = (p, n) => Math.sin(p * PI * 2 * n);

const CLIPS = {
  nod: [0.7, (p, a) => ({ ParamAngleY: -13 * a * Math.abs(wave(p, 1)) * hump(p), ParamBodyAngleY: -4 * a * hump(p) })],
  nod2: [0.9, (p, a) => ({ ParamAngleY: -11 * a * Math.abs(wave(p, 2)) * hump(p), PositionY: -6 * a * Math.abs(wave(p, 2)) })],
  bow: [1.4, (p, a) => ({ ParamAngleY: -20 * a * hold(p), ParamBodyAngleY: -10 * a * hold(p), LeanInput: -20 * a * hold(p), _y: 0.012 * a * hold(p) })],
  shake: [0.9, (p, a) => ({ ParamAngleX: 16 * a * wave(p, 2.5) * hump(p), ParamBodyAngleX: 4 * a * wave(p, 2.5) * hump(p) })],
  tiltL: [1.3, (p, a) => ({ ParamAngleZ: 13 * a * hold(p), ParamBodyAngleZ: 4 * a * hold(p), ParamAngleX: 5 * a * hold(p) })],
  tiltR: [1.3, (p, a) => ({ ParamAngleZ: -13 * a * hold(p), ParamBodyAngleZ: -4 * a * hold(p), ParamAngleX: -5 * a * hold(p) })],
  sway: [2, (p, a) => ({ ParamBodyAngleZ: 7 * a * wave(p, 1), ParamAngleZ: 4 * a * wave(p, 1), ParamAngleX: 5 * a * wave(p, 1), PositionX: 5 * a * wave(p, 1) })],
  bounce: [0.9, (p, a) => ({ _y: -0.018 * a * Math.abs(wave(p, 1.5)), PositionY: 8 * a * Math.abs(wave(p, 1.5)), ParamBodyAngleY: 4 * a * hump(p) })],
  hop: [0.55, (p, a) => ({ _y: -0.05 * a * hump(p), PositionY: 14 * a * hump(p), ParamBodyAngleY: 8 * a * hump(p) })],
  jumpy: [1.3, (p, a) => ({ _y: -0.03 * a * Math.abs(wave(p, 1.5)), PositionY: 12 * a * Math.abs(wave(p, 1.5)), ParamBodyAngleZ: 6 * a * wave(p, 1.5), ParamAngleZ: 5 * a * wave(p, 1.5) })],
  shiver: [1, (p, a) => ({ _x: 0.004 * a * wave(p, 9) * hump(p), ParamAngleX: 3 * a * wave(p, 7), ParamBodyAngleX: 3 * a * wave(p, 9) })],
  recoil: [0.8, (p, a) => ({ LeanInput: 18 * a * hump(p), ParamAngleY: 9 * a * hump(p), _y: -0.012 * a * hump(p) })],
  chinUp: [1.6, (p, a) => ({ LeanInput: 12 * a * hold(p), ParamAngleY: 11 * a * hold(p), ParamAngleZ: 4 * a * hold(p) })],
  lookAway: [1.5, (p, a) => ({ ParamAngleX: -18 * a * hold(p), ParamEyeBallX: -0.8 * hold(p), ParamBodyAngleX: -5 * a * hold(p) })],
  glance: [1, (p) => ({ ParamEyeBallX: 0.8 * wave(p, 1) * hump(p) })],
  lookUp: [1.5, (p, a) => ({ ParamAngleY: 11 * a * hold(p), ParamAngleX: 6 * a * hold(p), ParamEyeBallY: 0.9 * hold(p), ParamEyeBallX: 0.5 * hold(p) })],
  lookDown: [1.5, (p, a) => ({ ParamAngleY: -14 * a * hold(p), ParamEyeBallY: -0.9 * hold(p) })],
  earPerk: [0.8, (p, a) => ({ LControl: 0.9 * a * hump(p), RControl: 0.9 * a * hump(p) })],
  earDroop: [1.6, (p, a) => ({ LControl: -0.9 * a * hold(p), RControl: -0.9 * a * hold(p) })],
  earFlap: [0.9, (p, a) => ({ LControl: 0.8 * a * wave(p, 3), RControl: 0.8 * a * wave(p, 3) })],
  tailWag: [1.6, (p, a) => {
    const out = { ParamBodyAngleX: 3 * a * wave(p, 2) };
    for (let i = 0; i < 6; i++) out[`Param_Angle_Rotation${84 + i}`] = (6 + i * 3) * a * Math.sin(p * PI * 5 - i * 0.7) * hump(p);
    return out;
  }],
  wink: [0.55, (p) => ({ ParamEyeLOpen: -1 * hump(p), ParamMouthForm: 0.5 * hump(p) })],
  blink2: [0.5, (p) => ({ ParamEyeLOpen: -1 * Math.abs(wave(p, 1)), ParamEyeROpen: -1 * Math.abs(wave(p, 1)) })],
  eyesClosed: [1.2, (p) => ({ ParamEyeLOpen: -1 * hold(p), ParamEyeROpen: -1 * hold(p) })],
  // A slight swing that reads as body language, not a wave: the forearm moves far per unit.
  armSway: [3, (p) => ({ Param41: 0.025 * wave(p, 1) * hump(p), Param42: 0.04 * wave(p, 1) * hump(p) })],
  shrug: [1.5, (p, a) => ({ ShoulderY: 25 * a * hold(p), ParamAngleZ: 6 * a * hold(p), ParamBrowLY: 0.7 * hold(p), ParamBrowRY: 0.7 * hold(p), LArm: 0.25 * hold(p), RArm: 0.25 * hold(p), LForearm: 0.35 * hold(p), RForearm: 0.35 * hold(p) })],
  stretch: [2.6, (p, a) => ({ LeanInput: 14 * a * hold(p), ParamAngleY: 10 * a * hold(p), ParamBodyAngleY: 8 * a * hold(p), ShoulderY: 28 * a * hold(p), ParamEyeLOpen: -1 * hold(p), ParamEyeROpen: -1 * hold(p), LArm: 0.22 * hold(p), RArm: 0.22 * hold(p) })],
  yawn: [2.4, (p, a) => ({ ParamMouthOpenY: 0.9 * hump(p), ParamMouthForm: -0.8 * hump(p), JawOpen: 0.7 * hump(p), ParamEyeLOpen: -1 * hold(p), ParamEyeROpen: -1 * hold(p), ParamAngleY: 7 * a * hump(p), ParamAngleZ: 5 * a * hump(p) })],
  lookAround: [3.6, (p, a) => {
    const side = Math.sin(p * PI * 2) * hump(p) ** 0.5;
    return { ParamAngleX: 20 * a * side, ParamEyeBallX: 0.9 * side, ParamBodyAngleX: 5 * a * side };
  }],
  shiftWeight: [3, (p, a) => ({ HipAngleX: 8 * a * hold(p), ParamBodyAngleZ: -4 * a * hold(p), ParamAngleZ: 3 * a * hold(p), PositionX: 6 * a * hold(p) })],
  hum: [4, (p, a) => ({ ParamBodyAngleZ: 5 * a * wave(p, 2) * hump(p), ParamAngleZ: 5 * a * wave(p, 2) * hump(p), PositionX: 4 * a * wave(p, 2) * hump(p) })],
  snooze: [5, (p, a) => ({ ParamBodyAngleY: -3 * a * hump(p), ParamAngleY: -4 * a * hump(p), ParamBreath: 0.6 * hump(p) })],
  armsOpen: [1.8, (p, a) => ({ LArm: 0.28 * Math.min(a, 1) * hold(p), RArm: 0.28 * Math.min(a, 1) * hold(p) })],
  armsWide: [2, (p, a) => ({ LArm: 0.38 * Math.min(a, 1) * hold(p), RArm: 0.38 * Math.min(a, 1) * hold(p), LForearm: 0.15 * hold(p), RForearm: 0.15 * hold(p) })],
  leanIn: [2.2, (p, a) => ({ LeanInput: -22 * a * hold(p), ParamAngleY: -3 * a * hold(p), ParamAngleZ: 3 * a * hold(p), ParamBodyAngleY: -4 * a * hold(p) })],
  doze: [1.8, (p, a) => ({ ParamAngleY: -12 * a * hump(p) ** 3, ParamEyeLOpen: -0.8 * hump(p), ParamEyeROpen: -0.8 * hump(p) })],
  stomp: [0.8, (p, a) => ({ _y: 0.012 * a * Math.abs(wave(p, 2)), ParamAngleY: -6 * a * Math.abs(wave(p, 2)), PositionY: -8 * a * Math.abs(wave(p, 2)) })],
  sigh: [1.5, (p, a) => ({ ParamAngleY: -9 * a * hump(p), ParamBodyAngleY: -7 * a * hump(p), LeanInput: -8 * a * hump(p), ParamBreath: 0.8 * hump(p) })],
  gasp: [0.7, (p, a) => ({ ParamAngleY: 9 * a * hump(p), LeanInput: 12 * a * hump(p), ParamMouthOpenY: 0.7 * hump(p) })],
  puff: [1.5, (p) => ({ CheeckPuff: hold(p), Mouthpucker: 0.8 * hold(p) })],
  blep: [1.1, (p) => ({ TongueOut: hold(p) })],
  fidget: [1.8, (p, a) => ({ ParamBodyAngleX: 5 * a * wave(p, 2), ParamEyeBallY: -0.6 * hold(p), ParamEyeBallX: 0.5 * wave(p, 2), ParamAngleY: -6 * a * hold(p) })],
  explain: [1.6, (p, a) => ({ ParamAngleX: 7 * a * wave(p, 1), ParamBodyAngleZ: 3 * a * wave(p, 1), ParamAngleY: -3 * a * Math.abs(wave(p, 2)) })],
};

const EYE = {
  joy: { ParamEyeLOpen: 0, ParamEyeROpen: 0, EyeSmile: 1 },
  closed: { ParamEyeLOpen: 0, ParamEyeROpen: 0 },
  half: { ParamEyeLOpen: 0.55, ParamEyeROpen: 0.55 },
  sly: { ParamEyeLOpen: 0.65, ParamEyeROpen: 0.65, ParamBrowLY: -0.8, ParamBrowRY: -0.8 },
  wide: { ParamEyeLOpen: 1.4, ParamEyeROpen: 1.4, ParamBrowLY: 1, ParamBrowRY: 1 },
};

const FACE = {
  smile: { ParamMouthForm: 1 },
  softSmile: { ParamMouthForm: 0.5 },
  grin: { ParamMouthForm: 1, ParamMouthOpenY: 0.55 },
  frown: { ParamMouthForm: -1 },
  worried: { ParamMouthForm: -0.6, BrowInnerUp: 1, ParamBrowLY: 0.4, ParamBrowRY: 0.4 },
  browsUp: { ParamBrowLY: 0.8, ParamBrowRY: 0.8 },
  browsDown: { ParamBrowLY: -0.8, ParamBrowRY: -0.8 },
  oh: { ParamMouthForm: -1, ParamMouthOpenY: 0.6 },
};

// key1 dark face, key2 tears, key3 blank circle eyes, key4 heart eyes, key5 > <,
// key6 flat eyes with a small round mouth, key7 blush, key8 loading spinner,
// key9 fang, key10 steel bowl, key11 glasses, key12 monocle, key13 cold sweat.
const PRESETS = {
  neutral: [
    { beats: [[0.1, 'nod', 0.5]] },
    { face: FACE.softSmile, beats: [[0.2, 'explain', 0.6]] },
    { beats: [[0.1, 'glance', 1], [0.6, 'nod', 0.4]] },
  ],
  calm: [
    { face: { ...FACE.softSmile, ...EYE.half }, beats: [[0, 'sway', 0.5], [0.6, 'nod', 0.4]] },
    { face: { ...FACE.softSmile, ...EYE.joy }, pose: { ParamAngleZ: 3 }, beats: [[0.3, 'sigh', 0.4]] },
  ],
  happy: [
    { face: { ...FACE.grin, ...FACE.browsUp }, beats: [[0, 'bounce', 1], [0.1, 'earPerk', 1], [0.5, 'tailWag', 1]] },
    { face: { ...FACE.smile, ...EYE.joy, key9: 1 }, beats: [[0, 'tiltL', 0.8], [0.45, 'nod2', 0.8]] },
    { face: FACE.smile, pose: { ParamAngleZ: -4 }, beats: [[0, 'sway', 1], [0.3, 'tailWag', 1], [0.7, 'earFlap', 0.6]] },
  ],
  excited: [
    { face: { ...FACE.grin, ...FACE.browsUp, key9: 1 }, beats: [[0, 'hop', 1], [0.1, 'armsOpen', 0.8], [0.3, 'jumpy', 1], [0.75, 'earFlap', 1]] },
    { face: { ...FACE.grin, key7: 0.5, ...EYE.wide }, hand: 'raise', beats: [[0, 'jumpy', 1.2], [0.4, 'earFlap', 1], [0.7, 'hop', 0.8]] },
  ],
  laugh: [
    { face: { ...EYE.joy, ...FACE.grin }, beats: [[0, 'bounce', 1], [0.35, 'bounce', 1], [0.7, 'tailWag', 1]] },
    { face: { key5: 1, ...FACE.smile }, beats: [[0, 'shiver', 0.8], [0.3, 'tiltR', 0.7], [0.7, 'bounce', 0.7]] },
    { face: { ...EYE.joy, ...FACE.smile, key9: 1 }, hand: 'chest', beats: [[0, 'chinUp', 0.7], [0.5, 'bounce', 0.8]] },
  ],
  love: [
    { face: { key4: 1, key7: 1, ...FACE.smile }, pose: { ParamAngleZ: 5 }, hand: 'chest', beats: [[0, 'sway', 1], [0.5, 'tailWag', 1.2]] },
    { face: { key4: 1, key7: 0.7, ...FACE.smile }, beats: [[0, 'hop', 0.6], [0.3, 'earFlap', 0.8], [0.6, 'sway', 0.8]] },
    { face: { ...EYE.joy, key7: 1, ...FACE.smile }, pose: { ParamAngleZ: -5 }, beats: [[0, 'leanIn', 0.7], [0.6, 'tailWag', 1]] },
  ],
  shy: [
    { face: { key7: 1, ...FACE.softSmile }, beats: [[0, 'lookAway', 0.8], [0.5, 'fidget', 1]] },
    { face: { key7: 1, key13: 0.6, ...FACE.worried }, hand: 'chest', beats: [[0, 'lookDown', 0.8], [0.4, 'earDroop', 0.6]] },
    { face: { key5: 1, key7: 1 }, beats: [[0, 'shiver', 0.6], [0.3, 'lookAway', 1]] },
  ],
  embarrassed: [
    { face: { key5: 1, key7: 1, key13: 1 }, beats: [[0, 'shake', 0.8], [0.3, 'lookDown', 1], [0.6, 'fidget', 1]] },
    { face: { key7: 1, ...EYE.half, ...FACE.worried }, beats: [[0, 'lookAway', 1.1], [0.5, 'earDroop', 0.7]] },
  ],
  proud: [
    { face: { ...FACE.smile, ...FACE.browsUp }, hand: 'chest', beats: [[0, 'chinUp', 1], [0.3, 'earPerk', 1], [0.6, 'tailWag', 1]] },
    { face: { ...EYE.joy, key9: 1, ...FACE.smile }, beats: [[0, 'chinUp', 1.2], [0.5, 'nod', 0.7]] },
  ],
  smug: [
    { face: { ...EYE.sly, ...FACE.smile }, pose: { ParamAngleZ: 5 }, beats: [[0, 'chinUp', 0.7], [0.5, 'glance', 1]] },
    { face: { ...EYE.sly, key9: 1, ...FACE.softSmile }, beats: [[0, 'wink', 1], [0.3, 'tiltR', 0.7]] },
  ],
  teasing: [
    { face: { ...EYE.sly, ...FACE.smile }, beats: [[0, 'leanIn', 0.8], [0.3, 'blep', 1], [0.7, 'glance', 1]] },
    { face: { ...FACE.smile, key9: 1 }, hold: 'foxtail', beats: [[0, 'wink', 1], [0.2, 'tiltL', 0.7]] },
  ],
  playful: [
    { face: FACE.smile, beats: [[0, 'wink', 1], [0.15, 'blep', 1], [0.5, 'sway', 1]] },
    { face: { ...FACE.smile, key9: 1 }, hold: 'foxtail', beats: [[0, 'sway', 1.2], [0.4, 'tailWag', 1.2], [0.7, 'earFlap', 0.8]] },
    { face: { ...EYE.joy, ...FACE.grin }, beats: [[0, 'blep', 1], [0.4, 'bounce', 0.8]] },
  ],
  curious: [
    { face: FACE.browsUp, beats: [[0, 'leanIn', 1], [0.1, 'earPerk', 1], [0.6, 'glance', 1]] },
    { face: FACE.browsUp, beats: [[0, 'tiltR', 1], [0.5, 'leanIn', 0.7]] },
    { face: { key12: 1, ...FACE.browsUp }, beats: [[0, 'leanIn', 0.9], [0.5, 'tiltL', 0.7]] },
  ],
  attentive: [
    { face: { ...FACE.softSmile, ...FACE.browsUp }, beats: [[0, 'leanIn', 1], [0.4, 'nod', 0.6], [0.75, 'nod', 0.5]] },
    { face: FACE.softSmile, pose: { ParamAngleZ: 4 }, beats: [[0, 'leanIn', 1.2], [0.5, 'earPerk', 0.7]] },
    { face: { ...FACE.browsUp, ParamMouthForm: 0.2 }, beats: [[0, 'tiltL', 0.6], [0.15, 'leanIn', 1], [0.7, 'nod2', 0.5]] },
  ],
  question: [
    { face: FACE.browsUp, beats: [[0, 'tiltL', 1], [0.6, 'blink2', 1]] },
    { face: { ...FACE.browsUp, ...FACE.softSmile }, beats: [[0, 'leanIn', 0.7], [0.4, 'tiltR', 0.8]] },
    { face: FACE.browsUp, hand: 'point', beats: [[0, 'tiltR', 0.9]] },
  ],
  thinking: [
    { face: { key8: 1 }, beats: [[0, 'lookUp', 1], [0.5, 'tiltL', 0.6]] },
    { face: { ParamMouthForm: -0.3, ...FACE.browsDown }, hand: 'point', beats: [[0, 'lookUp', 1], [0.6, 'glance', 1]] },
    { face: { ParamMouthForm: -0.3, ...EYE.half }, beats: [[0, 'tiltR', 0.7], [0.3, 'lookDown', 0.7], [0.7, 'nod', 0.5]] },
  ],
  explain: [
    { face: FACE.softSmile, hand: 'point', beats: [[0, 'explain', 1], [0.5, 'nod', 0.6]] },
    { face: { key11: 1, ...FACE.softSmile }, hand: 'point', beats: [[0, 'leanIn', 0.5], [0.4, 'explain', 1]] },
    { face: { key12: 1 }, beats: [[0, 'chinUp', 0.5], [0.3, 'explain', 1], [0.8, 'nod', 0.6]] },
    { face: FACE.softSmile, beats: [[0, 'armsOpen', 0.5], [0.2, 'explain', 1]] },
  ],
  suggest: [
    { face: { ...FACE.softSmile, ...FACE.browsUp }, hand: 'point', beats: [[0, 'tiltL', 0.7], [0.5, 'nod', 0.6]] },
    { face: FACE.smile, beats: [[0, 'leanIn', 0.7], [0.3, 'armsOpen', 0.5], [0.7, 'tiltR', 0.5]] },
  ],
  warning: [
    { face: { ...FACE.browsDown, ...FACE.frown }, hand: 'point', beats: [[0, 'leanIn', 0.8], [0.4, 'shake', 0.5]] },
    { face: { ...FACE.worried, key13: 0.7 }, hand: 'point', beats: [[0, 'nod', 0.8], [0.5, 'leanIn', 0.7]] },
  ],
  agree: [
    { face: FACE.smile, beats: [[0, 'nod2', 1], [0.5, 'earPerk', 0.7]] },
    { face: FACE.softSmile, beats: [[0, 'nod', 1], [0.6, 'nod', 0.7]] },
    { face: { ...EYE.joy, ...FACE.smile }, beats: [[0, 'nod2', 0.8], [0.5, 'tailWag', 0.8]] },
  ],
  disagree: [
    { face: { ...FACE.frown, ...FACE.browsDown }, beats: [[0, 'shake', 1], [0.6, 'tiltR', 0.5]] },
    { face: FACE.worried, beats: [[0, 'shake', 0.7], [0.4, 'shrug', 0.8]] },
  ],
  trust: [
    { face: { ...FACE.softSmile, ...FACE.browsUp }, hand: 'chest', beats: [[0, 'leanIn', 0.8], [0.4, 'nod', 0.9]] },
    { face: { ...FACE.browsDown, ParamMouthForm: 0.3 }, hand: 'chest', beats: [[0, 'chinUp', 0.5], [0.3, 'nod2', 0.8]] },
    { face: { ...EYE.joy, ...FACE.smile }, hand: 'chest', beats: [[0, 'nod', 1], [0.5, 'earPerk', 0.7]] },
  ],
  determined: [
    { face: { ...FACE.browsDown, ParamMouthForm: 0.4 }, hand: 'chest', beats: [[0, 'nod', 1], [0.4, 'chinUp', 0.6]] },
    { face: { ...FACE.browsDown, key9: 1, ...FACE.smile }, hand: 'raise', beats: [[0, 'nod2', 1], [0.5, 'hop', 0.5]] },
  ],
  apology: [
    { face: { ...FACE.worried, key13: 1 }, beats: [[0, 'bow', 1], [0.5, 'earDroop', 1]] },
    { face: { key5: 1, key13: 1 }, beats: [[0, 'bow', 1.1], [0.45, 'shiver', 0.5]] },
    { face: FACE.worried, hand: 'chest', beats: [[0, 'lookDown', 1], [0.4, 'earDroop', 1], [0.7, 'nod', 0.6]] },
  ],
  thanks: [
    { face: { ...FACE.smile, key7: 0.5 }, hand: 'chest', beats: [[0, 'bow', 0.7], [0.55, 'tailWag', 1]] },
    { face: { ...EYE.joy, ...FACE.smile }, beats: [[0.1, 'nod2', 1]] },
  ],
  greeting: [
    { face: { ...FACE.grin, ...FACE.browsUp }, hand: 'raise', beats: [[0, 'armSway', 1], [0.1, 'bounce', 0.7], [0.5, 'earFlap', 0.7]] },
    { face: { ...EYE.joy, ...FACE.smile }, beats: [[0, 'bow', 0.7], [0.5, 'tailWag', 1]] },
    { face: FACE.smile, hand: 'raise', beats: [[0, 'tiltL', 0.6], [0.4, 'armSway', 1]] },
  ],
  goodbye: [
    { face: FACE.smile, hand: 'raise', beats: [[0, 'armSway', 1], [0.3, 'nod', 0.6]] },
    { face: { ...EYE.joy, ...FACE.softSmile }, beats: [[0, 'bow', 0.7], [0.6, 'tiltL', 0.5]] },
  ],
  welcome: [
    { face: { ...FACE.grin, ...FACE.browsUp }, beats: [[0, 'armsWide', 0.9], [0.2, 'bounce', 0.7], [0.5, 'tailWag', 1]] },
    { face: { ...EYE.joy, ...FACE.smile }, beats: [[0, 'armsOpen', 0.8], [0.3, 'bow', 0.5]] },
  ],
  tada: [
    { face: { ...FACE.grin, ...FACE.browsUp, key9: 1 }, beats: [[0, 'hop', 0.8], [0.05, 'armsWide', 1], [0.6, 'tailWag', 1.2]] },
    { face: { ...EYE.joy, ...FACE.grin }, hand: 'raise', beats: [[0, 'chinUp', 0.9], [0.4, 'earFlap', 1]] },
  ],
  cheer: [
    { face: { ...FACE.grin, ...FACE.browsUp, key9: 1 }, hand: 'raise', beats: [[0, 'hop', 1], [0.3, 'nod2', 1], [0.6, 'hop', 0.8]] },
    { face: FACE.smile, beats: [[0, 'nod2', 1.2], [0.3, 'earPerk', 1], [0.5, 'bounce', 1]] },
  ],
  praise: [
    { face: { ...EYE.joy, ...FACE.grin }, beats: [[0, 'nod2', 1], [0.3, 'armsOpen', 0.6], [0.7, 'tailWag', 1]] },
    { face: { ...FACE.smile, ...FACE.browsUp }, hand: 'raise', beats: [[0, 'nod', 1], [0.5, 'bounce', 0.6]] },
  ],
  comfort: [
    { face: { ...FACE.softSmile, BrowInnerUp: 1 }, hand: 'chest', pose: { ParamAngleZ: 6 }, beats: [[0, 'leanIn', 0.7], [0.4, 'nod', 0.6], [0.7, 'sway', 0.5]] },
    { face: { ...FACE.softSmile, BrowInnerUp: 0.7 }, beats: [[0, 'leanIn', 0.8], [0.2, 'tiltL', 0.6], [0.7, 'nod', 0.5]] },
    { face: { ...EYE.joy, ...FACE.softSmile }, beats: [[0, 'nod', 0.5], [0.4, 'sway', 0.6]] },
  ],
  relief: [
    { face: { ...EYE.closed, ...FACE.softSmile }, hand: 'chest', beats: [[0, 'sigh', 1.1], [0.6, 'nod', 0.5]] },
    { face: { ...FACE.softSmile, ...EYE.half }, beats: [[0, 'sigh', 1], [0.5, 'earPerk', 0.6]] },
  ],
  sad: [
    { face: FACE.worried, beats: [[0, 'earDroop', 1], [0.2, 'lookDown', 1], [0.6, 'sigh', 0.8]] },
    { face: { ...FACE.worried, ...EYE.half, key1: 0.3 }, pose: { ParamAngleY: -6 }, beats: [[0, 'sigh', 1], [0.5, 'earDroop', 0.8]] },
  ],
  cry: [
    { face: { key2: 1, ...FACE.worried }, beats: [[0, 'earDroop', 1], [0.1, 'shiver', 1], [0.6, 'lookDown', 1]] },
    { face: { key2: 1, key5: 1 }, beats: [[0, 'shiver', 1.3], [0.4, 'shake', 0.5]] },
    { face: { key2: 1, ...EYE.closed, ...FACE.frown }, hand: 'chest', beats: [[0, 'lookDown', 1], [0.5, 'shiver', 0.7]] },
  ],
  angry: [
    { face: { key1: 0.6, ...EYE.sly, ...FACE.frown }, beats: [[0, 'stomp', 1], [0.3, 'puff', 1], [0.6, 'stomp', 0.8]] },
    { face: { key1: 0.8, ...FACE.frown, ...FACE.browsDown }, pose: { ParamAngleY: -6 }, beats: [[0, 'leanIn', 0.8], [0.45, 'shiver', 0.8]] },
  ],
  pout: [
    { face: { key7: 0.5, ...FACE.frown }, beats: [[0, 'puff', 1], [0.1, 'lookAway', 1], [0.7, 'stomp', 0.5]] },
    { face: { ...EYE.half, ...FACE.frown }, beats: [[0, 'lookAway', 0.8], [0.3, 'puff', 1]] },
  ],
  annoyed: [
    { face: { ...EYE.half, ...FACE.frown, ...FACE.browsDown }, beats: [[0, 'sigh', 1], [0.5, 'lookAway', 0.6]] },
    { face: { key1: 0.4, ...EYE.half, ...FACE.frown }, pose: { ParamAngleY: -5 }, beats: [[0, 'shrug', 0.6], [0.5, 'shake', 0.4]] },
  ],
  deadpan: [
    { face: { key6: 1 }, beats: [[0.2, 'glance', 1], [0.6, 'blink2', 1]] },
    { face: { key6: 1, key13: 0.8 }, pose: { ParamAngleZ: -3 }, beats: [[0, 'lookAway', 0.5]] },
  ],
  disgust: [
    { face: { key1: 0.5, ...EYE.half, ...FACE.frown }, beats: [[0, 'recoil', 1], [0.2, 'lookAway', 1], [0.6, 'blep', 1]] },
    { face: { key6: 1, key1: 0.4 }, beats: [[0, 'recoil', 0.8], [0.4, 'shake', 0.6]] },
  ],
  gloomy: [
    { face: { key1: 1, ...FACE.frown }, pose: { ParamAngleY: -9 }, beats: [[0, 'earDroop', 1], [0.4, 'sigh', 1]] },
    { face: { key1: 1, key3: 1 }, beats: [[0, 'lookDown', 1.1], [0.3, 'earDroop', 1]] },
  ],
  surprised: [
    { face: { ...EYE.wide, ...FACE.oh }, beats: [[0, 'gasp', 1], [0, 'earPerk', 1.1], [0.5, 'blink2', 1]] },
    { face: { key3: 1, ...FACE.oh }, beats: [[0, 'recoil', 1], [0, 'armsOpen', 0.6], [0.1, 'earPerk', 1.1]] },
  ],
  shocked: [
    { face: { key3: 1, key13: 1 }, beats: [[0, 'recoil', 1.3], [0, 'armsWide', 0.8], [0.3, 'shiver', 1], [0.6, 'earDroop', 0.8]] },
    { face: { key3: 1, key1: 0.5 }, beats: [[0, 'hop', 0.8], [0.35, 'gasp', 1]] },
  ],
  scared: [
    { face: { ...EYE.wide, key13: 1, ...FACE.worried }, hand: 'chest', beats: [[0, 'recoil', 1], [0.2, 'shiver', 1.1], [0.6, 'earDroop', 1]] },
    { face: { key5: 1, key1: 0.4, key13: 1 }, beats: [[0, 'shiver', 1.3], [0.5, 'lookDown', 0.8]] },
  ],
  panic: [
    { face: { key5: 1, key7: 1, key13: 1 }, beats: [[0, 'shake', 1.2], [0.3, 'shiver', 1], [0.6, 'jumpy', 0.8]] },
    { face: { key3: 1, key13: 1 }, beats: [[0, 'shiver', 1.3], [0.2, 'armsOpen', 0.7], [0.4, 'shake', 1.1]] },
  ],
  confused: [
    { face: { key13: 0.7, ...FACE.browsUp }, beats: [[0, 'tiltL', 1], [0.45, 'tiltR', 1], [0.8, 'blink2', 1]] },
    { face: { key3: 1 }, beats: [[0, 'tiltR', 1.2], [0.5, 'shrug', 0.7]] },
  ],
  dunno: [
    { face: { ...FACE.browsUp, ParamMouthForm: -0.2 }, beats: [[0, 'shrug', 1], [0.6, 'tiltL', 0.5]] },
    { face: { key13: 0.6, ...FACE.softSmile }, beats: [[0, 'shake', 0.4], [0.2, 'shrug', 0.9]] },
  ],
  awkward: [
    { face: { key13: 1, ...FACE.softSmile }, beats: [[0, 'glance', 1], [0.3, 'lookAway', 0.7], [0.7, 'shrug', 0.5]] },
    { face: { key13: 1, ...EYE.half, ...FACE.softSmile }, beats: [[0, 'tiltL', 0.6], [0.4, 'fidget', 0.8]] },
  ],
  tired: [
    { face: { ...EYE.half, ...FACE.frown }, pose: { ParamAngleY: -7 }, beats: [[0, 'sigh', 1], [0.5, 'earDroop', 0.8]] },
    { face: { ...EYE.half }, beats: [[0, 'tiltR', 0.8], [0.3, 'eyesClosed', 1], [0.7, 'sigh', 0.7]] },
  ],
  sleepy: [
    { face: { ParamEyeLOpen: 0.3, ParamEyeROpen: 0.3 }, pose: { ParamAngleZ: 6 }, beats: [[0, 'doze', 1], [0.6, 'doze', 0.8]] },
    { face: { ...EYE.closed, ...FACE.oh }, beats: [[0, 'chinUp', 0.6], [0.5, 'doze', 1]] },
  ],
  hungry: [
    { face: { ...EYE.half, ...FACE.worried }, hand: 'chest', beats: [[0, 'sigh', 0.8], [0.4, 'earDroop', 0.8]] },
    { face: { key4: 0.8, ...FACE.smile }, beats: [[0, 'leanIn', 0.8], [0.3, 'blep', 1]] },
  ],
  serious: [
    { face: { ...FACE.browsDown, key11: 1 }, beats: [[0, 'nod', 0.6], [0.4, 'leanIn', 0.7]] },
    { face: { ...FACE.browsDown, key12: 1 }, pose: { LeanInput: -6 }, beats: [[0, 'chinUp', 0.4], [0.5, 'nod', 0.7]] },
  ],
  blunder: [
    { face: { key5: 1, key13: 1 }, prop: 'key10', beats: [[0, 'stomp', 1], [0.3, 'shiver', 0.8]] },
    { face: { key3: 1 }, prop: 'key10', beats: [[0, 'recoil', 0.8], [0.4, 'earDroop', 1]] },
  ],
};

const EMOTION_LABELS = {
  neutral: '기본', calm: '평온', happy: '기쁨', excited: '신남', laugh: '웃음', love: '애정', shy: '수줍음',
  embarrassed: '부끄러움', proud: '뿌듯함', smug: '으쓱', teasing: '놀리기', playful: '장난', curious: '호기심',
  attentive: '경청', question: '질문', thinking: '생각', explain: '설명', suggest: '제안', warning: '주의',
  agree: '동의', disagree: '반대', trust: '믿음', determined: '결의', apology: '사과', thanks: '감사',
  greeting: '인사', goodbye: '작별', welcome: '환영', tada: '짜잔', cheer: '응원', praise: '칭찬', comfort: '위로',
  relief: '안도', sad: '슬픔', cry: '울음', angry: '화남', pout: '삐침', annoyed: '짜증', deadpan: '정색',
  disgust: '질색', gloomy: '시무룩', surprised: '놀람', shocked: '충격', scared: '겁먹음', panic: '당황',
  confused: '혼란', dunno: '모르겠음', awkward: '머쓱', tired: '피곤', sleepy: '졸림', hungry: '배고픔',
  serious: '진지', blunder: '대실수',
};

const CLIP_LABELS = {
  stretch: '기지개', yawn: '하품', lookAround: '두리번',
  nod: '끄덕', shake: '도리도리', tiltL: '갸웃', bow: '꾸벅', leanIn: '앞으로 기울이기', chinUp: '턱 들기', hop: '폴짝',
  sway: '살랑', armsOpen: '팔 벌리기', armsWide: '활짝 벌리기', shrug: '으쓱', tailWag: '꼬리 흔들기', earFlap: '귀 파닥',
  wink: '윙크', blep: '메롱', puff: '볼 부풀리기', sigh: '한숨', doze: '꾸벅꾸벅',
};

// Rest poses from the model's own motion files. `hand` is the mesh switch for that
// pose; without one the ordinary hand is lifted. Each arm holds one gesture, so both can run together.
const GESTURES = {
  chest: { side: 'left', hand: 'Movement2', arm: { Param62: 0.034, Param59: 0.476, Param60: 0.86 } },
  point: { side: 'right', hand: 'Movement3', arm: { Param40: 1, Param39: 0.322, Param41: 0.702 } },
  raise: { side: 'right', arm: { Param39: 0.322, Param41: 0.702 } },
  foxtail: { side: 'right', hand: 'Movement1', arm: { Param36: 0.04, Param39: 0.2, Param41: -0.732 } },
};
const HAND_MESHES = ['Movement1', 'Movement2', 'Movement3'];
const HELD = new Set(['foxtail']);
const PROPS = { glasses: 'key11', monocle: 'key12', bowl: 'key10' };

// What the sentence itself suggests. `emotion` applies only when the model sent
// no tag; `clip` and `prop` are added on top either way.
const KEYWORDS = [
  { re: /안녕|반가워|반갑|こんにちは|\bhello\b|\bhi\b/i, emotion: 'greeting' },
  { re: /어서\s?와|환영/, emotion: 'welcome' },
  { re: /믿어|맡겨|약속|제가 책임/, emotion: 'trust' },
  { re: /짜잔|완성|완료했|다 됐/, emotion: 'tada' },
  { re: /잘했|훌륭|멋져|대단해/, emotion: 'praise' },
  { re: /다행|안심/, emotion: 'relief' },
  { re: /조심|주의|위험|경고/, emotion: 'warning' },
  { re: /어때요|추천|제안|해 보는 건/, emotion: 'suggest' },
  { re: /말씀해|들려주|듣고 있|듣고 싶/, emotion: 'attentive' },
  { re: /졸려|피곤해|잠이/, emotion: 'sleepy' },
  { re: /무서|겁나/, emotion: 'scared' },
  { re: /배고파|배고프/, emotion: 'hungry' },
  { re: /싸구려|싸다고|가성비/, emotion: 'pout' },
  { re: /천재|당연하죠|제가 누군데/, emotion: 'proud' },
  { re: /흰밥|쌀밥|밥 먹|밥 한 그릇|밀크티/, emotion: 'hungry' },
  { re: /땡땡이|퇴근|자고 싶/, emotion: 'sleepy' },
  { re: /잘못 올렸|가지 마세요|토큰이/, emotion: 'blunder' },
  { re: /별로 안 기쁘|착각하지 마|오해하지 마/, emotion: 'shy' },
  { re: /잘\s?가|다음에\s?봐|또\s?봐|안녕히|さようなら|\bbye\b/i, emotion: 'goodbye' },
  { re: /고마워|고맙|감사|ありがと|\bthanks?\b/i, emotion: 'thanks' },
  { re: /미안|죄송|ごめん|すみません|\bsorry\b/i, emotion: 'apology' },
  { re: /축하|대박|최고|해냈|성공|すごい|\bcongrat/i, emotion: 'excited' },
  { re: /힘내|화이팅|파이팅|할 수 있|頑張/, emotion: 'cheer' },
  { re: /괜찮아요|걱정\s?마|힘들었|토닥/, emotion: 'comfort' },
  { re: /ㅠ|ㅜ|슬퍼|슬프|속상|悲し/, emotion: 'sad' },
  { re: /ㅋㅋ|ㅎㅎ|하하|헤헤|草|lol/i, emotion: 'laugh' },
  { re: /사랑|좋아해|귀여|愛し|大好き/, emotion: 'love' },
  { re: /놀라|깜짝|헉|어머|뭐라고요|えっ/, emotion: 'surprised' },
  { re: /화나|짜증|그만\s?하|怒/, emotion: 'angry' },
  { re: /모르겠|글쎄요/, emotion: 'dunno' },
  { re: /음+[.…,]|흠+[.…,]|えーと/, emotion: 'thinking' },
  { re: /왜냐하면|예를 들어|정리하면|즉,|먼저|첫째|설명/, emotion: 'explain' },
  { re: /[!！]{1,}\s*$/, clip: 'bounce' },
  { re: /[?？]\s*$/, clip: 'tiltL' },
  { re: /^\s*(네|예|응|그럼요|맞아요|좋아요|알겠|はい)/, clip: 'nod' },
  { re: /^\s*(아니요|아뇨|아니에요|いいえ)/, clip: 'shake' },
  { re: /윙크|비밀|쉿/, clip: 'wink' },
  { re: /메롱|장난/, clip: 'blep' },
  { re: /꼬리|고래/, clip: 'tailWag' },
  { re: /코드|분석|데이터|계산|논문/, prop: 'glasses' },
  { re: /조사|추리|탐정/, prop: 'monocle' },
  { re: /강아지풀/, prop: 'foxtail' },
];

const EMOTIONS = Object.keys(PRESETS);
const ACTIONS = [...Object.keys(CLIPS), ...Object.keys(GESTURES), ...Object.keys(PROPS), 'noprops'];
const KNOWN_TAGS = new Set([...EMOTIONS, ...ACTIONS]);

const LEVELS = { 1: 0.65, 2: 1, 3: 1.35 };

// Small things she does when left alone. `after` is the idle seconds required,
// `weight` how often it comes up, `seconds` how long the face and hand are held.
const IDLE_ACTS = [
  { name: 'lookAround', after: 15, weight: 5, seconds: 3.8, beats: [[0, 'lookAround', 1]] },
  { name: 'shiftWeight', after: 15, weight: 4, seconds: 3.2, beats: [[0, 'shiftWeight', 1]] },
  { name: 'tail', after: 15, weight: 4, seconds: 2.6, face: FACE.softSmile, beats: [[0, 'tailWag', 1.2]] },
  { name: 'ears', after: 15, weight: 3, seconds: 2, beats: [[0, 'earFlap', 0.8], [0.5, 'blink2', 1]] },
  { name: 'tilt', after: 15, weight: 3, seconds: 2.4, face: FACE.browsUp, beats: [[0, 'tiltL', 0.8], [0.4, 'glance', 1]] },
  { name: 'hum', after: 25, weight: 4, seconds: 4.2, face: { ...EYE.joy, ...FACE.smile }, beats: [[0, 'hum', 1]] },
  { name: 'stretch', after: 30, weight: 3, seconds: 3, beats: [[0, 'stretch', 1], [0.75, 'sigh', 0.4]] },
  { name: 'yawn', after: 40, weight: 3, seconds: 3, beats: [[0, 'yawn', 1], [0.7, 'blink2', 1]] },
  { name: 'blep', after: 30, weight: 2, seconds: 2.4, face: FACE.softSmile, beats: [[0, 'glance', 1], [0.3, 'blep', 1]] },
  { name: 'peek', after: 30, weight: 3, seconds: 3, face: { ...FACE.softSmile, ...FACE.browsUp }, beats: [[0, 'leanIn', 0.7], [0.5, 'blink2', 1]] },
  { name: 'hungry', after: 45, weight: 2, seconds: 3.2, face: { ...EYE.half, ...FACE.worried }, beats: [[0, 'sigh', 0.8], [0.3, 'lookDown', 0.6]] },
  { name: 'pout', after: 60, weight: 2, seconds: 3, face: FACE.frown, beats: [[0, 'puff', 1], [0.2, 'lookAway', 0.6]] },
  { name: 'study', after: 45, weight: 2, seconds: 4, face: { key11: 1, ...FACE.softSmile }, beats: [[0, 'lookDown', 0.7], [0.5, 'nod', 0.5]] },
  { name: 'monocle', after: 60, weight: 1, seconds: 3.6, face: { key12: 1, ...FACE.browsUp }, beats: [[0, 'chinUp', 0.5], [0.5, 'glance', 1]] },
  { name: 'foxtail', after: 60, weight: 2, seconds: 5, face: { ...FACE.smile, key9: 1 }, hand: 'foxtail', beats: [[0, 'hum', 0.7], [0.4, 'tailWag', 1]] },
  { name: 'nodOff', after: 90, weight: 3, seconds: 4, face: EYE.half, beats: [[0, 'doze', 1], [0.55, 'doze', 1]] },
];

// Weighted random pick among what is allowed yet, never the same act twice running.
let lastIdleAct = null;
function pickIdleAct(idleSeconds) {
  const open = IDLE_ACTS.filter((act) => act.after <= idleSeconds && act !== lastIdleAct);
  let roll = Math.random() * open.reduce((sum, act) => sum + act.weight, 0);
  lastIdleAct = open.find((act) => (roll -= act.weight) < 0) ?? open[0];
  return lastIdleAct;
}

// Decides how a sentence is acted out from its tags and words. Emotion stays
// `previous` when nothing in the sentence changes it.
function resolveCue({ text, tags = [], level }, previous = 'neutral') {
  const cue = { emotion: tags.find((t) => PRESETS[t]) ?? null, level: LEVELS[level] ?? 1, clips: [], gestures: [], props: [] };
  for (const tag of tags) {
    if (CLIPS[tag]) cue.clips.push(tag);
    else if (HELD.has(tag) || PROPS[tag] || tag === 'noprops') cue.props.push(tag);
    else if (GESTURES[tag]) cue.gestures.push(tag);
  }
  for (const k of KEYWORDS) {
    if (!k.re.test(text)) continue;
    if (k.emotion) cue.emotion ??= k.emotion;
    if (k.clip && !cue.clips.includes(k.clip)) cue.clips.push(k.clip);
    if (k.prop && !cue.props.includes(k.prop)) cue.props.push(k.prop);
  }
  cue.emotion ??= previous;
  return cue;
}

// Reply text without acting tags, as a person should read it.
const stripTags = (text) => text
  .replace(/\[([a-z_A-Z]+)(?::\d)?\]\s*/g, (tag, name) => (KNOWN_TAGS.has(name.toLowerCase()) ? '' : tag))
  .trim();

// Picks a variant, avoiding the one used last for this emotion.
const lastVariant = {};
function pickPreset(emotion) {
  const list = PRESETS[emotion] ?? PRESETS.neutral;
  let index = Math.floor(Math.random() * list.length);
  if (list.length > 1 && index === lastVariant[emotion]) index = (index + 1) % list.length;
  lastVariant[emotion] = index;
  return list[index];
}

const MOTION_API = {
  CLIPS, PRESETS, GESTURES, HAND_MESHES, HELD, PROPS, EMOTIONS, ACTIONS, KNOWN_TAGS, EMOTION_LABELS, CLIP_LABELS, KEYWORDS,
  resolveCue, pickPreset, pickIdleAct, stripTags, IDLE_ACTS,
};
if (typeof module !== 'undefined') module.exports = MOTION_API;
else window.Motions = MOTION_API;
})();
