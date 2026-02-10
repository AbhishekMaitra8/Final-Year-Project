
@echo off
cd /d "%~dp0..\backend"
if not exist "final_venv" (
    echo Creating virtual environment...
    python -m venv final_venv
)
call final_venv\Scripts\activate
echo Installing dependencies...
pip install -r requirements.txt
echo Starting Flask Server...
python app.py
