// Downloads Live2D Cubism Core into vendor/. It is Live2D Inc.'s software under the
// Live2D Proprietary Software License, so it is fetched from Live2D rather than kept here.
const fs = require('fs');
const path = require('path');

const URL = 'https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js';
const dst = path.join(__dirname, '..', 'vendor', 'live2dcubismcore.min.js');

(async () => {
  if (fs.existsSync(dst)) return;
  const res = await fetch(URL);
  if (!res.ok) throw new Error(`Cubism Core download failed: ${res.status}`);
  const code = await res.text();
  if (!code.includes('Live2DCubismCore')) throw new Error('Cubism Core download is not the expected file');
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.writeFileSync(dst, code);
  console.log('wrote', path.relative(path.join(__dirname, '..'), dst));
})().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
