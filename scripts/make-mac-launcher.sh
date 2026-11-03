#!/bin/zsh
# Builds DeepSeek-chan.app, a double-clickable launcher for this project folder.
# It starts Electron directly, so no terminal or Node on PATH is needed.
set -e
cd "${0:a:h}/.."
APP="DeepSeek-chan.app"
rm -rf "$APP"
osacompile -o "$APP" -e '
set appPath to POSIX path of (path to me)
set projectDir to do shell script "dirname " & quoted form of appPath
do shell script "cd " & quoted form of projectDir & " && nohup node_modules/electron/dist/Electron.app/Contents/MacOS/Electron . >/dev/null 2>&1 &"
'
ICONSET="$(mktemp -d)/icon.iconset"
mkdir "$ICONSET"
for size in 16 32 128 256 512; do
  sips -z $size $size assets/icon.png --out "$ICONSET/icon_${size}x${size}.png" >/dev/null
  sips -z $((size * 2)) $((size * 2)) assets/icon.png --out "$ICONSET/icon_${size}x${size}@2x.png" >/dev/null
done
iconutil -c icns "$ICONSET" -o "$APP/Contents/Resources/applet.icns"
touch "$APP"
echo "Built $APP"
