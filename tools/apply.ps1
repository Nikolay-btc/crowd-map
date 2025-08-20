param([string]$FromFile="", [switch]$NoDev)
function Apply-File($base,$item){
  $path=Join-Path $base $item.path; $dir=Split-Path $path -Parent
  if(-not(Test-Path $dir)){ New-Item -ItemType Directory -Force -Path $dir | Out-Null }
  if(Test-Path $path){ Copy-Item $path "$path.bak" -Force }
  $mode=$item.mode; if([string]::IsNullOrWhiteSpace($mode)){ $mode="replace" }
  if($mode -eq "append"){ Add-Content -Encoding UTF8 $path $item.content }
  elseif($mode -eq "prepend"){ Set-Content -Encoding UTF8 $path ($item.content + (Get-Content $path -Raw)) }
  else{ Set-Content -Encoding UTF8 -NoNewline $path $item.content }
  Write-Host "  • $($item.path) [$mode]" -ForegroundColor Cyan
}
$base=(Get-Location).Path
$raw= if($FromFile){ Get-Content $FromFile -Raw } else { $input | Out-String }
if(-not $raw){ Write-Error "Нет JSON патча"; exit 1 }
try{ $patch=$raw | ConvertFrom-Json }catch{ Write-Error "JSON не парсится: $($_.Exception.Message)"; exit 1 }
if(-not $patch.files){ Write-Error "В JSON нет 'files'"; exit 1 }
Write-Host "Применяю патч..." -ForegroundColor Green
foreach($f in $patch.files){ Apply-File $base $f }
if(-not $NoDev){ Write-Host "Готово" -ForegroundColor Yellow }