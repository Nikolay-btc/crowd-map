param([string]$FromFile="", [switch]$NoDev)
$ErrorActionPreference="Stop"

function Write-File($Path, $Content, [string]$Mode="replace"){
  $dir = Split-Path $Path -Parent
  if($dir -and !(Test-Path $dir)){ New-Item -ItemType Directory -Force -Path $dir | Out-Null }
  if(Test-Path $Path){ Copy-Item $Path "$Path.bak" -Force }
  switch($Mode){
    "append"   { Add-Content -Path $Path -Value $Content -Encoding UTF8 }
    "prepend"  { $old = (Test-Path $Path) ? (Get-Content $Path -Raw) : ""; Set-Content -Path $Path -Value ($Content + $old) -Encoding UTF8 -NoNewline }
    default    { Set-Content -Path $Path -Value $Content -Encoding UTF8 -NoNewline }
  }
  Write-Host ("  • {0} [{1}]" -f $Path,$Mode) -ForegroundColor Cyan
}

$raw = $FromFile ? (Get-Content $FromFile -Raw) : ($input | Out-String)
if([string]::IsNullOrWhiteSpace($raw)){ Write-Error "Нет JSON патча"; exit 1 }
try { $patch = $raw | ConvertFrom-Json } catch { Write-Error "JSON не парсится: $($_.Exception.Message)"; exit 1 }
if(-not $patch.files){ Write-Error "В JSON нет 'files'"; exit 1 }

Write-Host "Применяю патч..." -ForegroundColor Green
foreach($f in $patch.files){
  $mode = if($f.mode){ [string]$f.mode } else { "replace" }
  Write-File $f.path $f.content $mode
}
if(-not $NoDev){ Write-Host "Готово" -ForegroundColor Yellow }