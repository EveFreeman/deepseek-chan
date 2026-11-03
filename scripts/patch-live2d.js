// Builds vendor/cubism4.patched.js from pixi-live2d-display.
// The stock renderer ignores per-drawable multiply/screen colors. This model
// relies on them (its nose is a black texture with a skin-tone screen color),
// so without this patch a black shape is drawn in the middle of the face.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const src = path.join(root, 'node_modules/pixi-live2d-display/dist/cubism4.js');
const dst = path.join(root, 'vendor/cubism4.patched.js');

let code = fs.readFileSync(src, 'utf8');

function replaceOnce(from, to) {
  if (!code.includes(from)) throw new Error(`patch target not found: ${from.slice(0, 60)}`);
  code = code.replace(from, to);
}

const helper =
  'uniform vec4 u_mul;uniform vec4 u_scr;' +
  'vec4 dscColor(vec4 t){t.rgb*=u_mul.rgb;t.rgb=t.rgb+u_scr.rgb*t.a-t.rgb*u_scr.rgb;return t;}';

// The three premultiplied fragment shaders (normal, masked, inverted mask).
code = code.replace(
  /const (fragmentShaderSrc(?:Mask|MaskInverted)?PremultipliedAlpha) = "(.*?)";/g,
  (_, name, body) => {
    const patched = body
      .replace('void main(){', `${helper}void main(){`)
      .replace(/texture2D\(s_texture0 ?, v_texCoord\) \* u_baseColor/, 'dscColor(texture2D(s_texture0, v_texCoord)) * u_baseColor');
    return `const ${name} = "${patched}";`;
  }
);
if ((code.match(/dscColor\(texture2D/g) || []).length !== 3) throw new Error('expected 3 patched shaders');

// Remember which drawable is being drawn.
replaceOnce(
  'this.drawMesh(this.getModel().getDrawableTextureIndices(drawableIndex)',
  'this._dscDrawable = drawableIndex;this.drawMesh(this.getModel().getDrawableTextureIndices(drawableIndex)'
);

// Upload its colors right after the draw program is selected.
replaceOnce(
  `        this.gl.useProgram(shaderSet.shaderProgram);
        if (bufferData.vertex == null) {
          bufferData.vertex = this.gl.createBuffer();
        }
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, bufferData.vertex);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, vertexArray, this.gl.DYNAMIC_DRAW);
        this.gl.enableVertexAttribArray(shaderSet.attributePositionLocation);
        this.gl.vertexAttribPointer(shaderSet.attributePositionLocation, 2, this.gl.FLOAT, false, 0, 0);
        if (bufferData.uv == null) {
          bufferData.uv = this.gl.createBuffer();
        }
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, bufferData.uv);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, uvArray, this.gl.DYNAMIC_DRAW);
        this.gl.enableVertexAttribArray(shaderSet.attributeTexCoordLocation);
        this.gl.vertexAttribPointer(shaderSet.attributeTexCoordLocation, 2, this.gl.FLOAT, false, 0, 0);
        if (clippingContextBufferForDraw != null) {`,
  `        this.gl.useProgram(shaderSet.shaderProgram);
        {
          const p = shaderSet.shaderProgram;
          if (!p.dscMul) {
            p.dscMul = this.gl.getUniformLocation(p, "u_mul");
            p.dscScr = this.gl.getUniformLocation(p, "u_scr");
          }
          const d = renderer.getModel()._model.drawables, i = renderer._dscDrawable * 4;
          this.gl.uniform4f(p.dscMul, d.multiplyColors[i], d.multiplyColors[i + 1], d.multiplyColors[i + 2], 1);
          this.gl.uniform4f(p.dscScr, d.screenColors[i], d.screenColors[i + 1], d.screenColors[i + 2], 0);
        }
        if (bufferData.vertex == null) {
          bufferData.vertex = this.gl.createBuffer();
        }
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, bufferData.vertex);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, vertexArray, this.gl.DYNAMIC_DRAW);
        this.gl.enableVertexAttribArray(shaderSet.attributePositionLocation);
        this.gl.vertexAttribPointer(shaderSet.attributePositionLocation, 2, this.gl.FLOAT, false, 0, 0);
        if (bufferData.uv == null) {
          bufferData.uv = this.gl.createBuffer();
        }
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, bufferData.uv);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, uvArray, this.gl.DYNAMIC_DRAW);
        this.gl.enableVertexAttribArray(shaderSet.attributeTexCoordLocation);
        this.gl.vertexAttribPointer(shaderSet.attributeTexCoordLocation, 2, this.gl.FLOAT, false, 0, 0);
        if (clippingContextBufferForDraw != null) {`
);

// The default 256px clip mask is far too coarse for a 715-mesh model.
replaceOnce('this._clippingMaskBufferSize = 256;', 'this._clippingMaskBufferSize = 4096;');

fs.mkdirSync(path.dirname(dst), { recursive: true });
fs.writeFileSync(dst, code);
console.log('wrote', path.relative(root, dst));
