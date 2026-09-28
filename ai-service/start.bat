@echo off
title AttendEase - UniFace AI Service
echo ========================================================
echo   Starting AttendEase UniFace Biometric Engine...
echo ========================================================
python -m uvicorn server:app --host 0.0.0.0 --port 8000
pause
