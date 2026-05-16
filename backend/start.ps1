. "$PSScriptRoot\setup-path.ps1"
Set-Location $PSScriptRoot
Write-Host "Installing/updating dependencies..."
python -m pip install -r requirements.txt -q
python -m uvicorn main:app --reload --port 8000
