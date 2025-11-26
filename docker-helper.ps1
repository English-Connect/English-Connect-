# Script de ayuda para Docker - English Connect

Write-Host "🐳English Connect - Docker Helper" -ForegroundColor Cyan
Write-Host ""

function Show-Menu {
    Write-Host "Selecciona una opción:" -ForegroundColor Yellow
    Write-Host "1. Iniciar proyecto (Producción)"
    Write-Host "2. Iniciar proyecto (Desarrollo)"
    Write-Host "3. Detener proyecto"
    Write-Host "4. Reiniciar servicios"
    Write-Host "5. Ver logs"
    Write-Host "6. Reconstruir imágenes"
    Write-Host "7. Limpiar todo (⚠️ elimina volúmenes)"
    Write-Host "8. Ver estado de servicios"
    Write-Host "9. Backup de base de datos"
    Write-Host "0. Salir"
    Write-Host ""
}

function Start-Production {
    Write-Host "Iniciando proyecto en modo producción..." -ForegroundColor Green
    docker-compose up -d
    Write-Host ""
    Write-Host "Proyecto iniciado!" -ForegroundColor Green
    Write-Host "Frontend: http://localhost" -ForegroundColor Cyan
    Write-Host "Backend: http://localhost:5000" -ForegroundColor Cyan
}

function Start-Development {
    Write-Host "🔧 Iniciando proyecto en modo desarrollo..." -ForegroundColor Green
    docker-compose -f docker-compose.dev.yml up -d
    Write-Host ""
    Write-Host "Proyecto iniciado!" -ForegroundColor Green
    Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
    Write-Host "Backend: http://localhost:5000" -ForegroundColor Cyan
}

function Stop-Project {
    Write-Host "Deteniendo proyecto..." -ForegroundColor Yellow
    docker-compose down
    docker-compose -f docker-compose.dev.yml down
    Write-Host "Proyecto detenido" -ForegroundColor Green
}

function Restart-Services {
    Write-Host "Reiniciando servicios..." -ForegroundColor Yellow
    docker-compose restart
    Write-Host "Servicios reiniciados" -ForegroundColor Green
}

function Show-Logs {
    Write-Host "Mostrando logs (Ctrl+C para salir)..." -ForegroundColor Cyan
    docker-compose logs -f
}

function Rebuild-Images {
    Write-Host "🏗️ Reconstruyendo imágenes..." -ForegroundColor Yellow
    docker-compose build --no-cache
    Write-Host "✅ Imágenes reconstruidas" -ForegroundColor Green
}

function Clean-All {
    Write-Host "⚠️  ADVERTENCIA: Esto eliminará todos los contenedores, volúmenes y datos" -ForegroundColor Red
    $confirm = Read-Host "¿Estás seguro? (s/n)"
    if ($confirm -eq 's' -or $confirm -eq 'S') {
        Write-Host "🗑️ Limpiando todo..." -ForegroundColor Yellow
        docker-compose down -v --rmi all
        docker-compose -f docker-compose.dev.yml down -v --rmi all
        Write-Host "✅ Limpieza completada" -ForegroundColor Green
    } else {
        Write-Host "❌ Operación cancelada" -ForegroundColor Yellow
    }
}

function Show-Status {
    Write-Host "📋 Estado de servicios:" -ForegroundColor Cyan
    docker-compose ps
}

function Backup-Database {
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupFile = "backup_$timestamp.sql"
    Write-Host "💾 Creando backup de la base de datos..." -ForegroundColor Cyan
    docker-compose exec -T db mysqldump -u english_user -penglish_password english_connect > $backupFile
    Write-Host "✅ Backup creado: $backupFile" -ForegroundColor Green
}

# Verificar si Docker está corriendo
try {
    docker ps | Out-Null
} catch {
    Write-Host "❌ Error: Docker no está corriendo o no está instalado" -ForegroundColor Red
    Write-Host "Por favor, inicia Docker Desktop y vuelve a intentar" -ForegroundColor Yellow
    exit
}

# Verificar si existe el archivo .env
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  No se encontró archivo .env" -ForegroundColor Yellow
    Write-Host "📝 Creando .env desde .env.example..." -ForegroundColor Cyan
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Archivo .env creado. Puedes editarlo si necesitas cambiar la configuración." -ForegroundColor Green
    Write-Host ""
}

# Loop principal
do {
    Show-Menu
    $option = Read-Host "Opción"
    Write-Host ""
    
    switch ($option) {
        "1" { Start-Production }
        "2" { Start-Development }
        "3" { Stop-Project }
        "4" { Restart-Services }
        "5" { Show-Logs }
        "6" { Rebuild-Images }
        "7" { Clean-All }
        "8" { Show-Status }
        "9" { Backup-Database }
        "0" { 
            Write-Host "👋 ¡Hasta luego!" -ForegroundColor Cyan
            break 
        }
        default { 
            Write-Host "❌ Opción inválida" -ForegroundColor Red 
        }
    }
    
    if ($option -ne "0" -and $option -ne "5") {
        Write-Host ""
        Write-Host "Presiona Enter para continuar..." -ForegroundColor Gray
        Read-Host
        Clear-Host
    }
} while ($option -ne "0")
