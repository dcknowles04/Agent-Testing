@echo off
REM One-command start (Windows): double-click or run start.bat
cd /d "%~dp0"
if not exist .venv (
  echo Creating virtual environment...
  python -m venv .venv
)
.venv\Scripts\python -m pip install -q --disable-pip-version-check -r requirements.txt
if not exist .env copy .env.example .env >nul
.venv\Scripts\python run.py
