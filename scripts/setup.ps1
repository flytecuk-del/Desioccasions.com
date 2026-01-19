<# 
Desi Occasions v12 - Windows Quickstart
- Installs dependencies
- Creates .env.local from template if missing
- Starts the dev server

Usage:
  powershell -ExecutionPolicy Bypass -File .\scripts\setup.ps1
#>

$ErrorActionPreference = "Stop"

function Write-Step($msg) {
  Write-Host ""
  Write-Host "==> $msg" -ForegroundColor Cyan
}

Write-Step "Checking Node.js"
try {
  $nodev = node -v
  Write-Host "Node: $nodev"
} catch {
  Write-Host "Node.js not found. Install Node.js 18+ then re-run." -ForegroundColor Red
  exit 1
}

Write-Step "Checking npm"
try {
  $npmv = npm -v
  Write-Host "npm: $npmv"
} catch {
  Write-Host "npm not found. Install Node.js (includes npm) then re-run." -ForegroundColor Red
  exit 1
}

Write-Step "Installing dependencies (npm install)"
npm install

Write-Step "Preparing environment file"
$envPath = Join-Path (Get-Location) ".env.local"
$templatePath = Join-Path (Get-Location) ".env.local.example"

if (!(Test-Path $envPath)) {
  Copy-Item $templatePath $envPath
  Write-Host ".env.local created from template. Please fill SUPABASE keys before running full flow." -ForegroundColor Yellow
} else {
  Write-Host ".env.local already exists." -ForegroundColor Green
}

Write-Step "Quick validation of env vars (non-blocking)"
powershell -ExecutionPolicy Bypass -File .\scripts\verify.ps1

Write-Step "Starting dev server"
Write-Host "Open: http://localhost:3000" -ForegroundColor Green
npm run dev
