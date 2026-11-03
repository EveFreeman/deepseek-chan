// Reads the text selected in whichever app is in front. There is no OS call for this,
// so it presses copy on the user's behalf and puts the clipboard back afterwards.
const { execFile } = require('child_process');
const { clipboard } = require('electron');

const KEY_RELEASE_MS = 350; // the shortcut's own keys must be up, or copy becomes another chord
const COPY_SETTLE_MS = 220;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function pressCopy() {
  return new Promise((resolve, reject) => {
    const done = (err) => (err ? reject(err) : resolve());
    if (process.platform === 'darwin') {
      execFile('osascript', ['-e', 'tell application "System Events" to keystroke "c" using command down'], done);
    } else if (process.platform === 'win32') {
      execFile('powershell', ['-NoProfile', '-Command', "(New-Object -ComObject WScript.Shell).SendKeys('^c')"], { windowsHide: true }, done);
    } else reject(new Error('unsupported platform'));
  });
}

// Resolves to { text, pressed }. pressed is false when the OS refused the keystroke,
// which on macOS means Accessibility permission is missing.
async function grabSelection() {
  await wait(KEY_RELEASE_MS);
  const before = await clipboard.readText();
  const marker = `dsc-${Date.now()}`;
  await clipboard.writeText(marker);
  let pressed = true;
  try {
    await pressCopy();
  } catch {
    pressed = false;
  }
  await wait(COPY_SETTLE_MS);
  const after = await clipboard.readText();
  await clipboard.writeText(before);
  return { text: after === marker ? '' : after.trim(), pressed, clipboard: before.trim() };
}

module.exports = { grabSelection };
