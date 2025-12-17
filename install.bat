@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Collegewala - Dependency Installation
echo ========================================
echo.

if not exist "package.json" (
    echo Error: package.json not found in current directory
    echo Please run this script from the project root directory
    pause
    exit /b 1
)

echo Checking for Node.js...
where /q node
if errorlevel 1 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo Found Node.js version: !NODE_VERSION!
echo.

echo Checking for npm...
where /q npm
if errorlevel 1 (
    echo Error: npm is not installed or not in PATH
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo Found npm version: !NPM_VERSION!
echo.

echo Installing dependencies...
call npm install
if errorlevel 1 (
    echo Error: npm install failed
    pause
    exit /b 1
)

echo.
echo ========================================
echo Successfully installed all dependencies!
echo ========================================
echo.
echo Next steps:
echo   - Development: npm run dev
echo   - Build: npm run build
echo   - Tests: npm test
echo   - Linting: npm run lint
echo.
pause
