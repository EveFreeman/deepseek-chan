#!/bin/bash
# One-time macOS setup. Double-click in Finder, or run it in Terminal.
# Everything goes into runtime/ inside this folder: no Homebrew, no system Python,
# nothing in your home folder. Deleting this folder removes the app. Safe to run again.
set -euo pipefail
cd "$(dirname "$0")"
ROOT="$PWD"
RT="$ROOT/runtime"
NODE_VERSION=v24.22.2
mkdir -p "$RT"
exec > >(tee "$RT/setup.log") 2>&1

if [ "$(uname -m)" != arm64 ]; then
  echo "This setup supports Apple Silicon Macs only."
  exit 1
fi

# Caches follow the install into the folder.
export MAMBA_ROOT_PREFIX="$RT/mamba"
export npm_config_cache="$RT/cache/npm"
export electron_config_cache="$RT/cache/electron"
export PIP_CACHE_DIR="$RT/cache/pip"
export HF_HOME="$RT/cache/huggingface"
export PIP_NO_WARN_SCRIPT_LOCATION=1
export TERM="${TERM:-xterm}"

echo; echo "[1/4] Node.js (private copy)"
if [ ! -x "$RT/node/bin/node" ]; then
  curl -fL "https://nodejs.org/dist/$NODE_VERSION/node-$NODE_VERSION-darwin-arm64.tar.gz" | tar -xz -C "$RT"
  rm -rf "$RT/node"
  mv "$RT/node-$NODE_VERSION-darwin-arm64" "$RT/node"
fi
export PATH="$RT/node/bin:$PATH"

# In a git clone, refuse commits that would publish settings, keys or logs.
if [ -d .git ] && command -v git >/dev/null; then git config core.hooksPath scripts/git-hooks; fi

echo; echo "[2/4] App files"
npm install
# Newer npm skips install scripts of dependencies, so Electron is fetched here.
node node_modules/electron/install.js

echo; echo "[3/4] Python (private copy)"
if [ ! -x "$RT/micromamba" ]; then
  curl -fL -o "$RT/micromamba" https://github.com/mamba-org/micromamba-releases/releases/latest/download/micromamba-osx-arm64
  chmod +x "$RT/micromamba"
fi
if [ ! -x "$RT/env/bin/python" ]; then
  "$RT/micromamba" create -y -p "$RT/env" -c conda-forge --override-channels python=3.11 pip ffmpeg
fi
export PATH="$RT/env/bin:$PATH"

echo; echo "[4/4] Voice engines"
"$RT/env/bin/python" scripts/python/setup_engines.py

zsh scripts/make-mac-launcher.sh
echo
echo "Done. Put the model and the voice in live2d/ and voice/ (see README.md), then open DeepSeek-chan.app."
