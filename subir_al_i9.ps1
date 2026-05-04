$files = @("main.py", "agent.py", "database.py", "skills.py", ".env")
$remotePath = "/home/mbo/Chat_Nieto/"
$server = "mbo@172.16.71.208"

Write-Host "Iniciando despliegue al servidor i9 (172.16.71.208)..." -ForegroundColor Cyan

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Subiendo $file..." -ForegroundColor Yellow
        scp $file "$($server):$($remotePath)"
    } else {
        Write-Host "Error: No se encuentra el archivo $file" -ForegroundColor Red
    }
}

Write-Host "Despliegue completado! Ahora reinicia el servidor en la terminal de Linux." -ForegroundColor Green
