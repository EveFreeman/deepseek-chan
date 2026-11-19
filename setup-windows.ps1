# One-time Windows setup. Everything goes into runtime\ inside this folder: no installers,
# no PATH or registry changes, nothing in the user profile. Only the desktop shortcut sits
# outside. Deleting this folder removes the app. Safe to run again after a failure.
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$root = $PSScriptRoot
$rt = Join-Path $root 'runtime'
$nodeVersion = 'v24.22.2'
$nodeDir = Join-Path $rt 'node'
$envDir = Join-Path $rt 'env'
$python = Join-Path $envDir 'python.exe'
$micromamba = Join-Path $rt 'micromamba.exe'

# Caches follow the install into the folder. Only this process sees these variables.
$env:MAMBA_ROOT_PREFIX = Join-Path $rt 'mamba'
$env:npm_config_cache = Join-Path $rt 'cache\npm'
$env:electron_config_cache = Join-Path $rt 'cache\electron'
$env:PIP_CACHE_DIR = Join-Path $rt 'cache\pip'
$env:HF_HOME = Join-Path $rt 'cache\huggingface'
$env:PIP_NO_WARN_SCRIPT_LOCATION = '1'
$env:PYTHONUTF8 = '1'

function Run {
  param([string]$File)
  # Tools write progress to stderr; only the exit code decides failure. Piping to the
  # host also puts their output into the transcript.
  $ErrorActionPreference = 'Continue'
  & $File @args 2>&1 | ForEach-Object { Write-Host "$_" }
  $code = $LASTEXITCODE
  $ErrorActionPreference = 'Stop'
  if ($code -ne 0) { throw "Failed ($code): $File $args" }
}

function Download($url, $file) {
  Write-Host "Downloading $url"
  Invoke-WebRequest -Uri $url -OutFile $file -UseBasicParsing
}

# Long or non-ASCII paths are what usually break Python packages on Windows.
if ($root.Length -gt 90) {
  Write-Host "WARNING: this folder's path is long ($($root.Length) characters). Move it closer to the drive root if installation fails." -ForegroundColor Yellow
}

New-Item -ItemType Directory -Force -Path $rt | Out-Null
Start-Transcript -Path (Join-Path $rt 'setup.log') -Force | Out-Null

Write-Host "`n[1/7] Node.js (private copy)" -ForegroundColor Cyan
if (-not (Test-Path (Join-Path $nodeDir 'node.exe'))) {
  $zip = Join-Path $rt 'node.zip'
  Download "https://nodejs.org/dist/$nodeVersion/node-$nodeVersion-win-x64.zip" $zip
  Expand-Archive -Path $zip -DestinationPath $rt -Force
  Remove-Item $zip -Force
  if (Test-Path $nodeDir) { Remove-Item $nodeDir -Recurse -Force }
  Rename-Item (Join-Path $rt "node-$nodeVersion-win-x64") 'node'
}
$env:PATH = "$nodeDir;$env:PATH"

Write-Host "`n[2/7] Language" -ForegroundColor Cyan
# Run directly, not through Run: it asks a question, and a pipe would hide the prompt.
& (Join-Path $nodeDir 'node.exe') (Join-Path $root 'scripts\choose-language.js')
if ($LASTEXITCODE -ne 0) { throw "Failed ($LASTEXITCODE): choose-language.js" }

Write-Host "`n[3/7] App files" -ForegroundColor Cyan
Set-Location $root
# In a git clone, refuse commits that would publish settings, keys or logs.
if ((Test-Path '.git') -and (Get-Command git -ErrorAction SilentlyContinue)) { git config core.hooksPath scripts/git-hooks }
if (Test-Path 'node_modules\electron\dist\Electron.app') { Remove-Item 'node_modules' -Recurse -Force } # copied from a Mac
Run (Join-Path $nodeDir 'npm.cmd') install
# Newer npm skips install scripts of dependencies, so Electron is fetched here.
Run (Join-Path $nodeDir 'node.exe') 'node_modules\electron\install.js'

Write-Host "`n[4/7] Python (private copy)" -ForegroundColor Cyan
if (-not (Test-Path $micromamba)) {
  Download 'https://github.com/mamba-org/micromamba-releases/releases/latest/download/micromamba-win-64.exe' $micromamba
}
if (-not (Test-Path $python)) {
  Run $micromamba create -y -p $envDir -c conda-forge --override-channels python=3.11 pip ffmpeg
}
$env:PATH = "$envDir;$envDir\Scripts;$envDir\Library\bin;$env:PATH"

Write-Host "`n[5/7] Voice engines" -ForegroundColor Cyan
Run $python (Join-Path $root 'scripts\python\setup_engines.py')

Write-Host "`n[6/7] Model and voice (from their official pages)" -ForegroundColor Cyan
# Run directly, not through Run: it asks questions, and a pipe would hide the prompts.
& (Join-Path $nodeDir 'node.exe') (Join-Path $root 'scripts\fetch-assets.js')
if ($LASTEXITCODE -ne 0) { throw "Failed ($LASTEXITCODE): fetch-assets.js" }

Write-Host "`n[7/7] Desktop shortcut" -ForegroundColor Cyan
$shell = New-Object -ComObject WScript.Shell
$link = $shell.CreateShortcut((Join-Path ([Environment]::GetFolderPath('Desktop')) 'DeepSeek-chan.lnk'))
$link.TargetPath = 'wscript.exe'
$link.Arguments = "`"$(Join-Path $root 'DeepSeek-chan.vbs')`""
$link.WorkingDirectory = $root
$link.IconLocation = Join-Path $root 'assets\icon.ico'
$link.Save()

Write-Host "`nDone. Start DeepSeek-chan from the desktop shortcut. If the model or the voice was skipped, see README.md." -ForegroundColor Green
