@echo off
REM ============================================================
REM  AVANA WEBSITE — LOCAL DEV SERVER
REM  Double-click this file to preview the site locally.
REM  Then open http://localhost:8000 in your browser.
REM  Press Ctrl+C in this window to stop the server.
REM ============================================================

cd /d "%~dp0"

echo.
echo  ===============================================
echo   AVANA SURGICAL - Local Preview Server
echo  ===============================================
echo.
echo   Server starting on: http://localhost:8000
echo.
echo   Try these URLs in your browser:
echo     http://localhost:8000/index.html
echo     http://localhost:8000/pain.html?area=knee
echo     http://localhost:8000/pain.html?area=spine
echo     http://localhost:8000/careers.html
echo.
echo   Press Ctrl+C to stop the server.
echo  ===============================================
echo.

REM Try Python 3 first
python -m http.server 8000 2>nul
if %errorlevel% neq 0 (
    REM Fallback: try py launcher
    py -3 -m http.server 8000 2>nul
    if %errorlevel% neq 0 (
        echo.
        echo  [ERROR] Python is not installed or not on PATH.
        echo.
        echo  Install Python from: https://python.org/downloads
        echo  During install, check the box: "Add Python to PATH"
        echo.
        echo  Alternatively, install the "Live Server" extension in VS Code
        echo  and right-click pain.html -^> "Open with Live Server".
        echo.
        pause
    )
)
