// Updates the app from GitHub when it was installed with git clone: looks for new commits,
// fast-forwards to them, reinstalls npm packages when they changed, and says when the
// setup script has to run again. Settings and history live in data/, which git ignores.
const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');
const { t } = require('../shared/i18n');

const IS_WIN = process.platform === 'win32';
const GIT_CANDIDATES = IS_WIN
  ? ['git', 'C:\\Program Files\\Git\\cmd\\git.exe', path.join(process.env.LOCALAPPDATA ?? '', 'Programs', 'Git', 'cmd', 'git.exe')]
  : ['git', '/usr/bin/git', '/opt/homebrew/bin/git', '/usr/local/bin/git'];
const FETCH_TIMEOUT = 60000;
const NPM_TIMEOUT = 10 * 60000;

// Files whose change means `npm install`; its postinstall also re-patches the renderer.
const NPM_FILES = ['package.json', 'package-lock.json', 'scripts/fetch-cubism-core.js', 'scripts/patch-live2d.js'];
// Files the setup script acts on: the Python voice engines and the setup itself.
const SETUP_FILE = /^(scripts\/python\/|setup-windows\.(ps1|bat)$|setup-mac\.command$)/;

function run(file, args, options = {}) {
  return new Promise((resolve, reject) => {
    execFile(file, args, { windowsHide: true, maxBuffer: 1 << 22, ...options }, (err, stdout, stderr) => {
      if (err) reject(Object.assign(err, { output: `${stderr}${stdout}`.trim() }));
      else resolve(String(stdout).trim());
    });
  });
}

function updater(root) {
  let git = null;

  async function findGit() {
    if (git) return git;
    for (const candidate of GIT_CANDIDATES) {
      try {
        await run(candidate, ['--version']);
        git = candidate;
        return git;
      } catch { /* try the next */ }
    }
    throw new Error(t('err.gitMissing'));
  }

  // A background check must never wait on a login window; one the user starts may.
  const gitIn = async (args, { interactive = false, timeout } = {}) => run(await findGit(), args, {
    cwd: root,
    timeout,
    env: { ...process.env, GIT_TERMINAL_PROMPT: '0', ...(interactive ? {} : { GCM_INTERACTIVE: 'never' }) },
  });

  const electronVersion = () => {
    try {
      return JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).devDependencies?.electron ?? null;
    } catch {
      return null;
    }
  };

  // The package version plus, in a git clone, the commit it runs and that commit's date.
  async function version() {
    let pkg = null;
    try {
      pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version;
    } catch { /* shown without */ }
    if (!fs.existsSync(path.join(root, '.git'))) return { version: pkg, commit: null, date: null };
    try {
      const [commit, date] = (await gitIn(['log', '-1', '--format=%h%x09%cs'])).split('\t');
      return { version: pkg, commit, date };
    } catch {
      return { version: pkg, commit: null, date: null };
    }
  }

  // { installed: false } outside a git clone; otherwise the commits waiting upstream.
  async function check({ interactive = false } = {}) {
    if (!fs.existsSync(path.join(root, '.git'))) return { installed: false };
    await gitIn(['fetch', '--quiet'], { interactive, timeout: FETCH_TIMEOUT });
    const log = await gitIn(['log', '--format=%h%x09%s', 'HEAD..@{u}']);
    const ahead = Number(await gitIn(['rev-list', '--count', '@{u}..HEAD']));
    const commits = log ? log.split('\n').map((line) => {
      const [hash, ...subject] = line.split('\t');
      return { hash, subject: subject.join('\t') };
    }) : [];
    return { installed: true, commits, ahead, head: commits[0]?.hash ?? null };
  }

  // Moves to the fetched commits. Refuses when this copy has its own changes, so nothing
  // made on this machine is overwritten.
  async function apply() {
    const edited = await gitIn(['status', '--porcelain', '--untracked-files=no']);
    if (edited) throw new Error(t('err.updateEdited', { files: edited }));
    const changed = (await gitIn(['diff', '--name-only', 'HEAD', '@{u}'])).split('\n').filter(Boolean);
    const electronBefore = electronVersion();
    try {
      await gitIn(['merge', '--ff-only', '@{u}']);
    } catch (err) {
      throw new Error(t('err.updateDiverged', { output: err.output ?? err.message }));
    }
    const plan = planAfter(changed, electronBefore, electronVersion());
    // npm would replace the running Electron's folder; setup does that install instead.
    if (plan.npm && !plan.electron) await npmInstall();
    return { changed, ...plan };
  }

  // The app's own Node from setup, so nothing on the system PATH is needed.
  async function npmInstall() {
    const nodeDir = path.join(root, 'runtime', 'node');
    const node = IS_WIN ? path.join(nodeDir, 'node.exe') : path.join(nodeDir, 'bin', 'node');
    const cli = IS_WIN ? path.join(nodeDir, 'node_modules', 'npm', 'bin', 'npm-cli.js') : path.join(nodeDir, 'lib', 'node_modules', 'npm', 'bin', 'npm-cli.js');
    if (!fs.existsSync(node) || !fs.existsSync(cli)) throw new Error(t('err.noNode'));
    const env = {
      ...process.env,
      PATH: [path.dirname(node), process.env.PATH].join(path.delimiter),
      npm_config_cache: path.join(root, 'runtime', 'cache', 'npm'),
    };
    try {
      await run(node, [cli, 'install', '--no-audit', '--no-fund'], { cwd: root, env, timeout: NPM_TIMEOUT });
    } catch (err) {
      throw new Error(t('err.npmFailed', { output: (err.output ?? err.message).slice(-600) }));
    }
  }

  return { version, check, apply };
}

// What has to happen after moving to `changed` files. Electron's own binary is fetched by
// setup, not npm, and cannot be replaced while it runs, so a new Electron needs setup too.
function planAfter(changed, electronBefore, electronAfter) {
  const electron = electronBefore !== electronAfter;
  return {
    npm: changed.some((file) => NPM_FILES.includes(file)),
    electron,
    setup: electron || changed.some((file) => SETUP_FILE.test(file)),
  };
}

module.exports = { updater, planAfter };
