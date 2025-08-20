param([string]$FromFile="", [switch]$NoDev)
$ErrorActionPreference="Stop"

function Write-File([string]$Path, [string]$Content, [string]$Mode="replace"){
  $dir = Split-Path $Path -Parent
  if($dir -and -not (Test-Path $dir)){ New-Item -ItemType Directory -Force -Path $dir | Out-Null }
  if(Test-Path $Path){ Copy-Item $Path "$Path.bak" -Force }

  if($Mode -eq "append"){
    Add-Content -Path $Path -Value $Content -Encoding UTF8
  } elseif ($Mode -eq "prepend"){
    $old = ""
    if(Test-Path $Path){ $old = Get-Content $Path -Raw }
    Set-Content -Path $Path -Value ($Content + $old) -Encoding UTF8 -NoNewline
  } else {
    Set-Content -Path $Path -Value $Content -Encoding UTF8 -NoNewline
  }

  Write-Host ("  • {0} [{1}]" -f $Path,$Mode) -ForegroundColor Cyan
}

$raw = ""
if($FromFile){ $raw = Get-Content $FromFile -Raw } else { $raw = ($input | Out-String) }
if([string]::IsNullOrWhiteSpace($raw)){ Write-Error "Нет JSON патча"; exit 1 }

try { $patch = $raw | ConvertFrom-Json } catch { Write-Error ("JSON не парсится: " + $_.Exception.Message); exit 1 }
if(-not $patch.files){ Write-Error "В JSON нет 'files'"; exit 1 }

Write-Host "Применяю патч..." -ForegroundColor Green
foreach($f in $patch.files){
  $mode = "replace"; if($f.mode){ $mode = [string]$f.mode }
  Write-File $f.path $f.content $mode
}
if(-not $NoDev){ Write-Host "Готово" -ForegroundColor Yellow }