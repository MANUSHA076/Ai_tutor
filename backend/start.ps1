. "$PSScriptRoot\setup-path.ps1"
Set-Location $PSScriptRoot
Write-Host "Installing core dependencies (fast)..."
python -m pip install -r requirements.txt -q --default-timeout=120
Write-Host "Server: http://127.0.0.1:8000  |  ML/RAG: run .\install-ml.ps1 once"
Write-Host "Keep this window open while using the app."
Write-Host "Tip: use .\start-stable.ps1 if the app freezes during PDF processing."
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
