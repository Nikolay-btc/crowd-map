param([string]$Zip="snapshot.zip")
if(Test-Path $Zip){ Remove-Item $Zip -Force }
Compress-Archive -Path * -DestinationPath $Zip -Force
Write-Host "Готово: $Zip"