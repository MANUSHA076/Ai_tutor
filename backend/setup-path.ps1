# Run once per terminal session (or dot-source: . .\setup-path.ps1)
$pythonRoot = "$env:LOCALAPPDATA\Programs\Python\Python312"
$pythonScripts = "$pythonRoot\Scripts"
if (Test-Path "$pythonRoot\python.exe") {
  $env:Path = "$pythonRoot;$pythonScripts;" + ($env:Path -replace [regex]::Escape("$pythonRoot;"), "" -replace [regex]::Escape("$pythonScripts;"), "")
  Write-Host "Python ready: $(python --version)"
} else {
  Write-Error "Python 3.12 not found. Install from https://www.python.org/downloads/"
  exit 1
}
