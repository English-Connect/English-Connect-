# Makefile para English Connect
# Comandos rápidos para gestión del proyecto con Docker

.PHONY: help dev prod stop restart logs build clean status backup

# Comando por defecto
help:
	@echo "English Connect - Comandos disponibles:"
	@echo ""
	@echo "  make dev        - Iniciar en modo desarrollo"
	@echo "  make prod       - Iniciar en modo producción"
	@echo "  make stop       - Detener todos los servicios"
	@echo "  make restart    - Reiniciar servicios"
	@echo "  make logs       - Ver logs en tiempo real"
	@echo "  make build      - Reconstruir imágenes"
	@echo "  make clean      - Limpiar todo (elimina datos)"
	@echo "  make status     - Ver estado de servicios"
	@echo "  make backup     - Hacer backup de la base de datos"
	@echo ""

# Iniciar en modo desarrollo
dev:
	@echo "Iniciando en modo desarrollo..."
	docker-compose -f docker-compose.dev.yml up -d
	@echo "Frontend: http://localhost:5173"
	@echo "Backend: http://localhost:5000"

# Iniciar en modo producción
prod:
	@echo "Iniciando en modo producción..."
	docker-compose up -d
	@echo "Frontend: http://localhost"
	@echo "Backend: http://localhost:5000"

# Detener servicios
stop:
	@echo "Deteniendo servicios..."
	docker-compose down
	docker-compose -f docker-compose.dev.yml down

# Reiniciar servicios
restart:
	@echo "Reiniciando servicios..."
	docker-compose restart

# Ver logs
logs:
	@echo "Mostrando logs (Ctrl+C para salir)..."
	docker-compose logs -f

# Reconstruir imágenes
build:
	@echo "Reconstruyendo imágenes..."
	docker-compose build --no-cache

# Limpiar todo
clean:
	@echo "Eliminando contenedores, volúmenes y datos..."
	docker-compose down -v --rmi all
	docker-compose -f docker-compose.dev.yml down -v --rmi all

# Ver estado
status:
	@echo "Estado de servicios:"
	docker-compose ps

# Backup de base de datos
backup:
	@echo "Creando backup..."
	docker-compose exec db mysqldump -u english_user -penglish_password english_connect > backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "Backup creado"
