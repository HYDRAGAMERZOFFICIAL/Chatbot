# Collegewala Dependency Installation Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Collegewala - Dependency Installation" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path "package.json")) {
    Write-Host "Error: package.json not found" -ForegroundColor Red
    Write-Host "Please run from project root directory" -ForegroundColor Red
    exit 1
}

Write-Host "Checking for Node.js and npm..."
try {
    $nodeVersion = & node --version
    $npmVersion = & npm --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
    Write-Host "npm version: $npmVersion" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "Error: Node.js or npm not found" -ForegroundColor Red
    exit 1
}

Write-Host "Installing dependencies..."
& npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Successfully installed all dependencies!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  - Development: npm run dev"
    Write-Host "  - Build: npm run build"
    Write-Host "  - Tests: npm test"
    Write-Host "  - Linting: npm run lint"
    Write-Host ""
} else {
    Write-Host "Error: npm install failed" -ForegroundColor Red
    exit 1
}
