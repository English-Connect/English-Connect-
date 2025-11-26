#  English Connect

Plataforma web para conectar estudiantes de inglés con profesores nativos para clases en línea personalizadas.

## Características

-  **Registro de usuarios** (Alumnos y Profesores)
-  **Sistema de autenticación** (Login/Logout)
-  **Programación de clases** entre alumnos y profesores
-  **Conexiones entre usuarios** (solicitudes de clases)
-  **Gestión de disponibilidad** para profesores
-  **Niveles de inglés** (A1, A2, B1, B2, C1, C2)
-  **Dashboards personalizados** según el rol (Alumno/Profesor)

## Tecnologías

### Backend
- Node.js 20+
- Express 5.1.0
- MySQL 8.0
- CORS
- Dotenv

### Frontend
- React 19.1.1
- Vite 7.1.7
- React Router DOM 7.9.5
- Axios 1.13.2
- Tailwind CSS (en desarrollo)

### Infraestructura
- Docker & Docker Compose
- Nginx (para producción)

## Inicio Rápido

### Opción 1: Con Docker (Recomendado) 🐳

**Prerequisitos:**
- Docker Desktop instalado

**Pasos:**

```powershell
# 1. Clonar el repositorio
git clone <url-del-repo>
cd English-Connect-

# 2. Usar el script helper (Windows)
.\docker-helper.ps1

# O manualmente:
# Copiar archivo de entorno
Copy-Item .env.example .env

# Iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f
```

**URLs:**
- Frontend: http://localhost
- Backend API: http://localhost:5000
- MySQL: localhost:3306

📖 **Documentación completa de Docker:** [DOCKER.md](./DOCKER.md)

### Opción 2: Instalación Manual

**Prerequisitos:**
- Node.js 16+ y npm
- MySQL 8.0
- Git

#### Backend

```powershell
# Navegar a la carpeta del backend
cd backend

# Instalar dependencias
npm install

# Crear archivo .env
# Agregar:
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=tu_password
# DB_NAME=english_connect
# PORT=5000

# Crear la base de datos en MySQL
mysql -u root -p < ../database/init.sql

# Iniciar servidor
npm run dev
```

#### Frontend

```powershell
# Navegar a la carpeta del frontend
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

## Estructura del Proyecto

```
English-Connect-/
├── backend/                    # API REST con Express
│   ├── server.js              # Servidor principal
│   ├── package.json           # Dependencias del backend
│   ├── Dockerfile             # Imagen Docker (producción)
│   └── Dockerfile.dev         # Imagen Docker (desarrollo)
│
├── frontend/                  # Aplicación React
│   ├── src/
│   │   ├── components/        # Componentes React
│   │   ├── pages/            # Páginas de la aplicación
│   │   ├── services/         # API client (axios)
│   │   └── styles/           # Estilos CSS
│   ├── public/               # Archivos estáticos
│   ├── package.json          # Dependencias del frontend
│   ├── Dockerfile            # Imagen Docker (producción)
│   ├── Dockerfile.dev        # Imagen Docker (desarrollo)
│   └── nginx.conf            # Configuración de Nginx
│
├── database/
│   └── init.sql              # Script de inicialización de BD
│
├── docker-compose.yml         # Orquestación (producción)
├── docker-compose.dev.yml     # Orquestación (desarrollo)
├── docker-helper.ps1          # Script auxiliar de Docker
├── .env.example              # Plantilla de variables de entorno
├── DOCKER.md                 # Documentación de Docker
└── README.md                 # Este archivo
```

## API Endpoints

### Usuarios
- `POST /api/usuarios/registro` - Registrar nuevo usuario
- `POST /api/usuarios/login` - Iniciar sesión
- `GET /api/usuarios` - Obtener todos los usuarios
- `GET /api/usuarios/:id` - Obtener usuario por ID

### Clases
- `POST /api/clases` - Crear nueva clase
- `GET /api/clases/usuario/:usuario_id` - Obtener clases de un usuario
- `PUT /api/clases/:id` - Actualizar estado de clase

### Conexiones
- `POST /api/conexiones` - Enviar solicitud de conexión
- `GET /api/conexiones/usuario/:usuario_id` - Obtener conexiones de un usuario
- `PUT /api/conexiones/:id/aceptar` - Aceptar conexión

### Disponibilidades
- `POST /api/disponibilidades` - Agregar disponibilidad
- `GET /api/disponibilidades/usuario/:usuario_id` - Obtener disponibilidad de usuario

##  Base de Datos

### Tablas principales:

- **usuarios** - Información de alumnos y profesores
- **clases** - Clases programadas
- **conexiones** - Solicitudes entre usuarios
- **disponibilidades** - Horarios disponibles de profesores

### Usuarios de prueba:

| Email | Contraseña | Rol |
|-------|------------|-----|
| juan.perez@example.com | password123 | ALUMNO |
| maria.gonzalez@example.com | password123 | ALUMNO |
| robert.smith@example.com | teacher123 | PROFESOR |
| emily.brown@example.com | teacher123 | PROFESOR |

## Comandos Útiles

### Con Docker

```powershell
# Iniciar proyecto
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener proyecto
docker-compose down

# Reconstruir imágenes
docker-compose build --no-cache

# Backup de BD
docker-compose exec db mysqldump -u english_user -penglish_password english_connect > backup.sql
```

### Sin Docker

#### Backend
```powershell
npm start      # Producción
npm run dev    # Desarrollo (con nodemon)
```

#### Frontend
```powershell
npm run dev      # Servidor de desarrollo
npm run build    # Compilar para producción
npm run preview  # Vista previa de la build
npm run lint     # Linter
```

Crea un archivo `.env` en la raíz del proyecto:

```env
# Base de datos
DB_ROOT_PASSWORD=rootpassword
DB_NAME=english_connect
DB_USER=english_user
DB_PASSWORD=english_password
DB_PORT=3306

# Puertos
BACKEND_PORT=5000
FRONTEND_PORT=80
```

##  Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto es de código abierto y está disponible bajo la licencia ISC.

## Autores

- **Equipo English Connect**

##  Roadmap

- [ ] Implementar autenticación JWT
- [ ] Agregar videollamadas con WebRTC
- [ ] Sistema de calificaciones y reseñas
- [ ] Chat en tiempo real
- [ ] Panel de administración
- [ ] Pagos integrados
- [ ] Notificaciones push
- [ ] Aplicación móvil

---

