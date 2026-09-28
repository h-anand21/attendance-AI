@echo off
title AttendEase - UniFace AI Service
echo ========================================================
echo   Starting AttendEase UniFace Biometric Engine...
echo   Local:   http://127.0.0.1:8000
echo   Tunnel:  https://attendease-uniface-ai.loca.lt
echo ========================================================
start "AttendEase UniFace Public Tunnel" cmd /c "echo Connecting public tunnel for Netlify and Mobile... && npx -y localtunnel --port 8000 --subdomain attendease-uniface-ai"
python -m uvicorn server:app --host 0.0.0.0 --port 8000
pause
