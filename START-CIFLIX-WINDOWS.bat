@echo off
setlocal
set "ROOT=%~dp0"
where python >nul 2>nul
if errorlevel 1 (
  echo Python was not found. Install Python 3.11+ and enable Add Python to PATH.
  pause
  exit /b 1
)
if not exist "%ROOT%backend\.venv\Scripts\python.exe" (
  echo Creating Python virtual environment...
  python -m venv "%ROOT%backend\.venv"
  if errorlevel 1 goto :error
)
echo Installing or checking backend requirements...
"%ROOT%backend\.venv\Scripts\python.exe" -m pip install -r "%ROOT%backend\requirements.txt"
if errorlevel 1 goto :error
start "CifliX Backend - keep open" cmd /k "cd /d ""%ROOT%backend"" && ""%ROOT%backend\.venv\Scripts\python.exe"" -m uvicorn main:app --host 127.0.0.1 --port 8000"
start "CifliX Frontend - keep open" cmd /k "cd /d ""%ROOT%"" && python -m http.server 5500 --bind 127.0.0.1"
timeout /t 3 >nul
start "" http://127.0.0.1:5500
exit /b 0
:error
echo Setup failed. Read the error above.
pause
exit /b 1
