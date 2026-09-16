@echo off
title MediLens Fullstack Launcher
echo ========================================================
echo        Starting MediLens (Backend + Frontend)
echo ========================================================

echo [1/2] Starting Python FastAPI Backend on port 8000...
start "MediLens Backend (Port 8000)" cmd /k "cd backend && ..\..\.venv\Scripts\activate && uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"

timeout /t 3 >nul

echo [2/2] Starting React Vite Frontend on port 5173...
start "MediLens Frontend (Port 5173)" cmd /k "cd frontend && npm.cmd run dev"

echo.
echo ========================================================
echo  All services are running!
echo    - Frontend UI:  http://localhost:5173
echo    - Backend API:  http://127.0.0.1:8000
echo    - API Swagger:  http://127.0.0.1:8000/docs
echo ========================================================
pause
