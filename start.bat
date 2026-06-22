@echo off
echo ===================================================
echo     INDIAN SPICE SHOP - SERVER STARTUP
echo ===================================================
echo.
echo Please wait while we boot up both servers...

:: Start the Python backend in a new window
echo Starting Backend (FastAPI)...
start cmd /k "cd backend && title Backend Server && py -m uvicorn main:app --reload --port 8000"

:: Start the Next.js frontend in a new window
echo Starting Frontend (Next.js)...
start cmd /k "cd frontend && title Frontend Server && npx next dev"

echo.
echo ===================================================
echo servers are booting up!
echo 1. The Frontend will be available at http://localhost:3000
echo 2. The Backend API will be available at http://localhost:8000
echo.
echo NOTE: Since the database has been completely re-seeded and 
echo a massive UI upgrade was pushed, please refresh your browser!
echo ===================================================
pause
