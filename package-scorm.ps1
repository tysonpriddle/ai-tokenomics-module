# package-scorm.ps1
# Creates a SCORM-compliant ZIP ready for SAP SuccessFactors upload.
# Run from the tokenomics-module directory.

$ModuleDir  = $PSScriptRoot
$OutputDir  = Split-Path $ModuleDir -Parent
$ZipName    = "ai-tokenomics-scorm.zip"
$ZipPath    = Join-Path $OutputDir $ZipName

# Remove previous package if it exists
if (Test-Path $ZipPath) {
    Remove-Item $ZipPath -Force
    Write-Host "Removed previous package." -ForegroundColor Yellow
}

# Items to include (everything except this script, .claude folder, and any existing zip)
$Include = @("imsmanifest.xml", "index.html", "css", "js")

# Build using a temp staging area to control exactly what goes in
$TempDir = Join-Path $env:TEMP "scorm-stage-$(Get-Random)"
New-Item -ItemType Directory -Path $TempDir | Out-Null

foreach ($item in $Include) {
    $src = Join-Path $ModuleDir $item
    if (Test-Path $src) {
        Copy-Item -Path $src -Destination $TempDir -Recurse
    } else {
        Write-Warning "Missing: $item"
    }
}

# Create ZIP
Compress-Archive -Path "$TempDir\*" -DestinationPath $ZipPath -CompressionLevel Optimal

# Clean up temp
Remove-Item $TempDir -Recurse -Force

$Size = [math]::Round((Get-Item $ZipPath).Length / 1KB, 1)
Write-Host ""
Write-Host "Package created: $ZipPath" -ForegroundColor Green
Write-Host "Size: ${Size} KB" -ForegroundColor Cyan
Write-Host ""
Write-Host "Upload this file to SAP SuccessFactors as a SCORM 2004 package." -ForegroundColor White
