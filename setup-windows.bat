@echo off
rem Starts the folder-only setup. See setup-windows.ps1.
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0setup-windows.ps1"
if errorlevel 1 (
  echo.
  echo Setup failed. See the messages above, then run this file again.
)
pause
