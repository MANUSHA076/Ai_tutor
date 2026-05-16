# One-time install for PDF chunking + RAG (PyTorch is large - allow 10+ minutes)
. "$PSScriptRoot\setup-path.ps1"
Set-Location $PSScriptRoot

$t = 600
Write-Host "Step 1/4: numpy, scikit-learn, rank-bm25..."
python -m pip install --default-timeout=$t numpy scikit-learn rank-bm25

Write-Host "Step 2/4: PyTorch CPU (~800MB) - do not close this window..."
python -m pip install --default-timeout=$t torch --index-url https://download.pytorch.org/whl/cpu

Write-Host "Step 3/4: sentence-transformers..."
python -m pip install --default-timeout=$t sentence-transformers

Write-Host "Step 4/4: chromadb..."
python -m pip install --default-timeout=$t chromadb

python verify_ml.py
