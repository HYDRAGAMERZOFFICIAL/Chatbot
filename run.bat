@echo off
REM Windows batch file to run SFGC Chatbot: scraping → training → backend → UI
REM This script automates the entire chatbot startup process

echo ======================================
echo SFGC AI College Chatbot - Startup
echo ======================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    echo Please install Python 3.9+ from https://www.python.org/
    pause
    exit /b 1
)

REM Check if pip is available
pip --version >nul 2>&1
if errorlevel 1 (
    echo Error: pip is not available
    pause
    exit /b 1
)

REM Install dependencies if needed
echo [1/4] Checking and installing dependencies...
pip install -q -r requirements.txt
if errorlevel 1 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)
echo Dependencies installed successfully!
echo.

REM Scrape SFGC website
echo [2/4] Scraping SFGC website...
python data/scraper/scrape_sfgc.py
if errorlevel 1 (
    echo Warning: Web scraping failed (may be network issue, continuing with existing data)
    echo.
)

REM Train ML model
echo [3/4] Training ML model...
python backend/pipeline/data_loader.py
python backend/ml/train.py
if errorlevel 1 (
    echo Error: Model training failed
    echo Please check your training data file
    pause
    exit /b 1
)
echo ML model trained successfully!
echo.

REM Start backend and frontend in parallel
echo [4/4] Starting backend API and frontend UI...
echo.
echo ======================================
echo Services Starting:
echo ======================================
echo Backend API: http://localhost:8000
echo API Docs:    http://localhost:8000/docs
echo Frontend UI: http://localhost:8501
echo ======================================
echo.
echo Press Ctrl+C to stop all services
echo.

REM Start backend in background
echo Starting Backend API (port 8000)...
start "SFGC Chatbot - Backend" cmd /k "cd backend && python main.py"

REM Wait a bit for backend to start
timeout /t 3 /nobreak

REM Start frontend
echo Starting Frontend UI (port 8501)...
start "SFGC Chatbot - Frontend" cmd /k "cd frontend && streamlit run app.py"

echo.
echo All services started! Check the opened windows for logs.
echo.
pause
