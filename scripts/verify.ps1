<#
Verifies that required environment variables exist in .env.local.
Usage:
  powershell -ExecutionPolicy Bypass -File .\scripts\verify.ps1
#>

$ErrorActionPreference = "Stop"
$envPath = Join-Path (Get-Location) ".env.local"
if (!(Test-Path $envPath)) {
  Write-Host ".env.local not found. Run scripts\setup.ps1 first." -ForegroundColor Yellow
  exit 0
}

$content = Get-Content $envPath -Raw

function Has-Value($key) {
  $m = [regex]::Match($content, "(?m)^\s*$key\s*=\s*(.+)\s*$")
  if (!$m.Success) { return $false }
  $val = $m.Groups[1].Value.Trim()
  if ($val -eq "" -or $val -match "^\s*$") { return $false }
  return $true
}

$required = @("NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY")
$optional = @("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", "STRIPE_SECRET_KEY")

$missing = @()
foreach ($k in $required) {
  if (!(Has-Value $k)) { $missing += $k }
}

if ($missing.Count -gt 0) {
  Write-Host "Missing required env vars in .env.local:" -ForegroundColor Yellow
  foreach ($m in $missing) { Write-Host " - $m" -ForegroundColor Yellow }
  Write-Host ""
  Write-Host "Add these from your Supabase Project Settings -> API." -ForegroundColor Yellow
} else {
  Write-Host "Required env vars present." -ForegroundColor Green
}

$optMissing = @()
foreach ($k in $optional) {
  if (!(Has-Value $k)) { $optMissing += $k }
}
if ($optMissing.Count -gt 0) {
  Write-Host "Stripe keys not set (optional). Payments won't run locally without them." -ForegroundColor Cyan
}
