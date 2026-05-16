# Stop whatever is using port 8000 (old uvicorn / hung backend)
$lines = netstat -ano | Select-String ":8000\s+.*LISTENING"
if (-not $lines) {
    Write-Host "Port 8000 is free."
    exit 0
}

$pids = $lines | ForEach-Object {
    if ($_ -match '\s+(\d+)\s*$') { [int]$Matches[1] }
} | Sort-Object -Unique

foreach ($pid in $pids) {
    Write-Host "Stopping PID $pid on port 8000..."
    taskkill /PID $pid /F 2>$null
}

Start-Sleep -Seconds 1
$still = netstat -ano | Select-String ":8000\s+.*LISTENING"
if ($still) {
    Write-Host "Port 8000 still in use. Close other backend terminals or restart PC."
    exit 1
}
Write-Host "Port 8000 is now free. Run .\start-stable.ps1"
