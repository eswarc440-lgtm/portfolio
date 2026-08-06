# SIMRAS Project - Start Script
# This script helps you run both frontend and backend simultaneously

Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         SIMRAS Project - Complete Setup & Run Script          ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

$projectRoot = "c:\Users\eswar\OneDrive\Desktop\project"

# Function to check if command exists
function Test-CommandExists {
    param($command)
    try {
        if (Get-Command $command -ErrorAction Stop) {
            return $true
        }
    }
    catch {
        return $false
    }
}

# Verify prerequisites
Write-Host "`n📋 Checking prerequisites..." -ForegroundColor Yellow

$checks = @(
    @{ name = "Node.js"; command = "node"; required = $true },
    @{ name = "npm"; command = "npm"; required = $true },
    @{ name = "Python"; command = "python"; required = $true },
    @{ name = "pip"; command = "pip"; required = $true }
)

foreach ($check in $checks) {
    if (Test-CommandExists $check.command) {
        Write-Host "   ✓ $($check.name) is installed" -ForegroundColor Green
    }
    else {
        if ($check.required) {
            Write-Host "   ✗ $($check.name) is NOT installed (required)" -ForegroundColor Red
            exit 1
        }
    }
}

# Check ports
Write-Host "`n🔌 Checking ports..." -ForegroundColor Yellow
$ports = @(
    @{ port = 5000; name = "Backend"; process = $null },
    @{ port = 5173; name = "Frontend"; process = $null }
)

foreach ($portInfo in $ports) {
    try {
        $netstat = netstat -ano | Select-String ":$($portInfo.port)"
        if ($netstat) {
            Write-Host "   ⚠️  Port $($portInfo.port) ($($portInfo.name)) might be in use" -ForegroundColor Yellow
        }
        else {
            Write-Host "   ✓ Port $($portInfo.port) ($($portInfo.name)) is available" -ForegroundColor Green
        }
    }
    catch {
        Write-Host "   ✓ Port $($portInfo.port) ($($portInfo.name)) appears available" -ForegroundColor Green
    }
}

# Frontend setup
Write-Host "`n🎨 Frontend Setup" -ForegroundColor Yellow
Write-Host "   Checking frontend dependencies..."

$frontendPath = Join-Path $projectRoot "frontend"
$nodeModulesPath = Join-Path $frontendPath "node_modules"

if (-not (Test-Path $nodeModulesPath)) {
    Write-Host "   Installing frontend dependencies (this may take 5-10 minutes)..."
    Push-Location $frontendPath
    npm install --prefer-offline --no-audit
    Pop-Location
    Write-Host "   ✓ Frontend dependencies installed" -ForegroundColor Green
}
else {
    Write-Host "   ✓ Frontend dependencies already installed" -ForegroundColor Green
}

# Create env files if they don't exist
$frontendEnv = Join-Path $frontendPath ".env.local"
if (-not (Test-Path $frontendEnv)) {
    Write-Host "   Creating .env.local..."
    @"
VITE_API_BASE_URL=http://localhost:5000/api/v1
"@ | Out-File $frontendEnv -Encoding utf8
    Write-Host "   ✓ .env.local created" -ForegroundColor Green
}

# Backend setup (optional check)
Write-Host "`n🔧 Backend Setup" -ForegroundColor Yellow
$backendPath = Join-Path $projectRoot "backend"
$venvPath = Join-Path $backendPath "venv"
$backendEnv = Join-Path $backendPath ".env"

if (-not (Test-Path $venvPath)) {
    Write-Host "   ⚠️  Python virtual environment not found" -ForegroundColor Yellow
    Write-Host "   Create it with: python -m venv venv" -ForegroundColor Cyan
}
else {
    Write-Host "   ✓ Virtual environment found" -ForegroundColor Green
}

if (-not (Test-Path $backendEnv)) {
    Write-Host "   ⚠️  Backend .env file not found" -ForegroundColor Yellow
    Write-Host "   See SETUP_INSTRUCTIONS.md for configuration" -ForegroundColor Cyan
}
else {
    Write-Host "   ✓ Backend .env found" -ForegroundColor Green
}

# Start servers
Write-Host "`n🚀 Starting Servers" -ForegroundColor Cyan
Write-Host "   Choose an option:" -ForegroundColor Yellow
Write-Host "   1. Start Frontend only (npm run dev)" -ForegroundColor White
Write-Host "   2. Start Backend only (python -m uvicorn ...)" -ForegroundColor White
Write-Host "   3. Instructions for running both" -ForegroundColor White
Write-Host "   4. Exit" -ForegroundColor White

$choice = Read-Host "`n   Enter choice (1-4)"

switch ($choice) {
    "1" {
        Write-Host "`n   Starting frontend..." -ForegroundColor Green
        Push-Location $frontendPath
        npm run dev
        Pop-Location
    }
    "2" {
        Write-Host "`n   To start backend, run in a separate terminal:" -ForegroundColor Yellow
        Write-Host "   cd $backendPath" -ForegroundColor Cyan
        Write-Host "   venv\Scripts\activate" -ForegroundColor Cyan
        Write-Host "   python -m uvicorn app.main:app --reload --port 5000" -ForegroundColor Cyan
    }
    "3" {
        Write-Host "`n   📖 To run both frontend and backend:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "   Terminal 1 (Backend):" -ForegroundColor Cyan
        Write-Host "   ────────────────────" -ForegroundColor Cyan
        Write-Host "   cd $backendPath" -ForegroundColor White
        Write-Host "   venv\Scripts\activate" -ForegroundColor White
        Write-Host "   python -m uvicorn app.main:app --reload --port 5000" -ForegroundColor White
        Write-Host ""
        Write-Host "   Terminal 2 (Frontend):" -ForegroundColor Cyan
        Write-Host "   ─────────────────────" -ForegroundColor Cyan
        Write-Host "   cd $frontendPath" -ForegroundColor White
        Write-Host "   npm run dev" -ForegroundColor White
        Write-Host ""
        Write-Host "   Then visit:" -ForegroundColor Cyan
        Write-Host "   🌐 Frontend: http://localhost:5173" -ForegroundColor Green
        Write-Host "   🔗 Backend API: http://localhost:5000/docs" -ForegroundColor Green
        Write-Host "   📊 ReDoc: http://localhost:5000/redoc" -ForegroundColor Green
        Write-Host ""
        Write-Host "   Demo Login:" -ForegroundColor Yellow
        Write-Host "   Email: admin@simras.local" -ForegroundColor White
        Write-Host "   Password: password123" -ForegroundColor White
    }
    "4" {
        Write-Host "   Exiting..." -ForegroundColor Yellow
        exit 0
    }
    default {
        Write-Host "   Invalid choice" -ForegroundColor Red
        exit 1
    }
}
