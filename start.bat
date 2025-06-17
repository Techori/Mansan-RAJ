@echo off
setlocal enabledelayedexpansion
title Mansan-RAJ Project Starter

echo ===================================
echo    Mansan-RAJ Project Starter
echo ===================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check frontend dependencies
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo Error installing frontend dependencies!
        pause
        exit /b 1
    )
)

REM Check backend dependencies
if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    cd backend
    call npm install
    if %errorlevel% neq 0 (
        echo Error installing backend dependencies!
        pause
        exit /b 1
    )
    cd ..
)

REM Start backend server
echo Starting backend server...
start "Backend Server" cmd /k "cd backend && npm start"

REM Wait for backend to start
timeout /t 2 /nobreak > nul

REM Start frontend server
echo Starting frontend server...
start "Frontend Server" cmd /k "npm run dev"

REM Wait for frontend to be ready
echo Waiting for frontend server to start...
timeout /t 5 /nobreak > nul

REM Try common Vite ports
for %%p in (5173 8080 3000 4000 5000) do (
    netstat -an | find "%%p" | find "LISTENING" > nul
    if not errorlevel 1 (
        echo Frontend server is ready on port %%p! Opening Chrome...
        start chrome http://localhost:%%p
        goto :found_port
    )
)

:found_port
echo.
echo ===================================
echo    Project is running!
echo    Press any key to close this window
echo ===================================
pause > nul 