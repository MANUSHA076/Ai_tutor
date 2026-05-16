# Same as start.ps1 but without --reload (fewer random restarts while coding)
. "$PSScriptRoot\setup-path.ps1"
Set-Location $PSScriptRoot

$inUse = netstat -ano | Select-String ":8000\s+.*LISTENING"
if ($inUse) {
    Write-Host "Port 8000 is already in use. Stopping old backend..."
    & "$PSScriptRoot\stop-backend.ps1"
    if ($LASTEXITCODE -ne 0) { exit 1 }
}

Write-Host "Installing core dependencies (fast)..."
python -m pip install -r requirements.txt -q --default-timeout=120
Write-Host "Server: http://127.0.0.1:8000  (stable mode, no auto-reload)"
Write-Host "Keep this window open while using the app."
python -m uvicorn main:app --host 127.0.0.1 --port 8000
