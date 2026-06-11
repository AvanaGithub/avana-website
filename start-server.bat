@echo off
REM ============================================================
REM  AVANA WEBSITE - LOCAL DEV SERVER
REM  Double-click this file to preview the site locally.
REM  Open http://localhost:8000 in your browser.
REM  Press Ctrl+C in this window to stop the server.
REM
REM  This launches start-server.py, which handles the same
REM  clean-URL rewrites as the production nginx config so
REM  links like /solutions/knee-pain and /for-surgeons work
REM  locally just like in production.
REM ============================================================

cd /d "%~dp0"

REM Try Python 3 first
python start-server.py 2>nul
if %errorlevel% neq 0 (
    REM Fallback: try py launcher
    py -3 start-server.py 2>nul
    if %errorlevel% neq 0 (
        echo.
        echo  [ERROR] Python is not installed or not on PATH.
        echo.
        echo  Install Python from: https://python.org/downloads
        echo  During install, check the box: "Add Python to PATH"
        echo.
        pause
    )
)
