@echo off
title SentinelShield Fraud Backend (FastAPI)
echo Starting FastAPI Backend on  ...
cd backend
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
pause
