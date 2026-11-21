@echo off
title PortfolioPro - Advanced Stock Trading and Portfolio Management Platform
echo =========================================================================
echo   Starting PortfolioPro Server on http://127.0.0.1:8000
echo =========================================================================
echo.
cd /d "%~dp0"
call "venv\Scripts\activate.bat"
start http://127.0.0.1:8000/
python manage.py runserver 127.0.0.1:8000
pause
