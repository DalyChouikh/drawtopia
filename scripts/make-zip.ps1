# Builds the exam archive EXAM_MOBILE_Chouikh_MohamedAli_DrawTopia.zip in dist/.
#
#   projet/                 full source (every file tracked by git, no node_modules or caches)
#   rapport.pdf             docs/report/rapport.pdf
#   README.md               installation and test guide
#   captures/               authentic screenshots
#   validation/             teacher's dated approval (must be added by hand first)
#   DECLARATION_SOURCES.md  libraries and AI assistance
#
# Usage (from the repository root):  powershell -ExecutionPolicy Bypass -File scripts/make-zip.ps1

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$name = 'EXAM_MOBILE_Chouikh_MohamedAli_DrawTopia'
$dist = Join-Path $root 'dist'
$stage = Join-Path $dist $name
$zip = Join-Path $dist "$name.zip"

Set-Location $root

# 1. Required inputs
$approval = Get-ChildItem (Join-Path $root 'validation') -File | Where-Object { $_.Name -ne 'README.md' }
if (-not $approval) { throw 'validation/ only contains its README: add the teacher''s dated approval first.' }
$report = Join-Path $root 'docs/report/rapport.pdf'
if (-not (Test-Path $report)) { throw 'docs/report/rapport.pdf is missing.' }
if (git status --porcelain) { Write-Warning 'Uncommitted changes: projet/ is built from the working tree as it is now.' }

# 2. Fresh staging folder
if (Test-Path $dist) { Remove-Item $dist -Recurse -Force }
New-Item -ItemType Directory -Path (Join-Path $stage 'projet') -Force | Out-Null

# 3. projet/ = every tracked file (git already excludes node_modules, .expo, dist, caches)
foreach ($file in git ls-files) {
  if ($file -like 'captures/*') { continue }        # shipped once, at the archive root
  $target = Join-Path $stage "projet/$file"
  New-Item -ItemType Directory -Path (Split-Path $target) -Force | Out-Null
  Copy-Item (Join-Path $root $file) $target
}

# 4. Top-level deliverables
Copy-Item $report (Join-Path $stage 'rapport.pdf')
Copy-Item (Join-Path $root 'README.md') $stage
Copy-Item (Join-Path $root 'DECLARATION_SOURCES.md') $stage
Copy-Item (Join-Path $root 'captures') $stage -Recurse
New-Item -ItemType Directory -Path (Join-Path $stage 'validation') | Out-Null
$approval | Copy-Item -Destination (Join-Path $stage 'validation')

# 5. Archive
Compress-Archive -Path (Join-Path $stage '*') -DestinationPath $zip -CompressionLevel Optimal
$sizeMb = [math]::Round((Get-Item $zip).Length / 1MB, 1)
Write-Host "Created $zip ($sizeMb MB)"
