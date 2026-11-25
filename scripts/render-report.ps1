# Renders docs/report/rapport.html to docs/report/rapport.pdf with Microsoft Edge (headless, A4, no header/footer).
# Usage (from the repository root):  powershell -ExecutionPolicy Bypass -File scripts/render-report.ps1

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$html = Join-Path $root 'docs/report/rapport.html'
$pdf = Join-Path $root 'docs/report/rapport.pdf'
$edge = @(
  "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
  "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $edge) { throw 'Microsoft Edge was not found.' }

$profileDir = Join-Path $env:TEMP 'drawtopia-report-edge'
$url = 'file:///' + ($html -replace '\\', '/')
Start-Process -FilePath $edge -Wait -ArgumentList @(
  '--headless=new', '--disable-gpu', "--user-data-dir=$profileDir",
  '--no-pdf-header-footer', "--print-to-pdf=$pdf", $url
)
$pages = ([regex]::Matches([IO.File]::ReadAllText($pdf), '/Type\s*/Page[^s]')).Count
Write-Host "Wrote $pdf ($pages pages, including the cover)"
