@echo off
setlocal enabledelayedexpansion

echo Starting the project...

REM Check frontend dependencies
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
)

REM Check backend dependencies
if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    cd backend
    call npm install
    cd ..
)

REM Start backend server
echo Starting backend server...
start cmd /k "cd backend && npm start"

REM Wait for backend to start
timeout /t 2 /nobreak > nul

REM Start frontend server
echo Starting frontend server...
start cmd /k "npm run dev"

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
REM Keep the window open
pause 