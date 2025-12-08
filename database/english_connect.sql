-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS english_connect;
USE english_connect;

-- Tabla: usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    fecha_nacimiento DATE,
    pais VARCHAR(50),
    nivel_id INT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    avatar_url VARCHAR(255),
    estado ENUM('activo', 'inactivo', 'suspendido') DEFAULT 'activo'
);

-- Tabla: niveles
CREATE TABLE IF NOT EXISTS niveles (
    id_nivel INT AUTO_INCREMENT PRIMARY KEY,
    nombre_nivel VARCHAR(50) NOT NULL,
    descripcion TEXT,
    puntos_requeridos INT DEFAULT 0
);

-- Tabla: clases
CREATE TABLE IF NOT EXISTS clases (
    id_clase INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    descripcion TEXT,
    nivel_id INT,
    duracion_minutos INT,
    tipo_clase ENUM('individual', 'grupal') DEFAULT 'individual',
    capacidad_maxima INT DEFAULT 1,
    fecha_hora_inicio DATETIME,
    profesor_id INT,
    estado ENUM('programada', 'en_curso', 'completada', 'cancelada') DEFAULT 'programada',
    FOREIGN KEY (nivel_id) REFERENCES niveles(id_nivel)
);

-- Tabla: disponibilidades
CREATE TABLE IF NOT EXISTS disponibilidades (
    id_disponibilidad INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    dia_semana ENUM('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'),
    hora_inicio TIME,
    hora_fin TIME,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id_usuario)
);

-- Tabla: conexiones
CREATE TABLE IF NOT EXISTS conexiones (
    id_conexion INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    clase_id INT,
    fecha_conexion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado_conexion ENUM('conectado', 'desconectado') DEFAULT 'conectado',
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (clase_id) REFERENCES clases(id_clase)
);

-- Tabla: actividad_usuario
CREATE TABLE IF NOT EXISTS actividad_usuario (
    id_actividad INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    tipo_actividad VARCHAR(50) NOT NULL,
    descripcion TEXT,
    fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    duracion_segundos INT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id_usuario)
);

-- Tabla: progreso_usuario
CREATE TABLE IF NOT EXISTS progreso_usuario (
    id_progreso INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    nivel_id INT,
    puntos_totales INT DEFAULT 0,
    lecciones_completadas INT DEFAULT 0,
    horas_estudio DECIMAL(5,2) DEFAULT 0.00,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (nivel_id) REFERENCES niveles(id_nivel)
);

-- Tabla: calificaciones
CREATE TABLE IF NOT EXISTS calificaciones (
    id_calificacion INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    clase_id INT,
    puntuacion DECIMAL(3,2) CHECK (puntuacion >= 0 AND puntuacion <= 5),
    comentario TEXT,
    fecha_calificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (clase_id) REFERENCES clases(id_clase)
);

-- Tabla: inasistencias
CREATE TABLE IF NOT EXISTS inasistencias (
    id_inasistencia INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    clase_id INT,
    fecha_inasistencia TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    motivo TEXT,
    justificado BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (clase_id) REFERENCES clases(id_clase)
);

-- Tabla: abandonos
CREATE TABLE IF NOT EXISTS abandonos (
    id_abandono INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    clase_id INT,
    fecha_abandono TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    motivo TEXT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (clase_id) REFERENCES clases(id_clase)
);

-- Tabla: sesiones_usuario
CREATE TABLE IF NOT EXISTS sesiones_usuario (
    id_sesion INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_fin TIMESTAMP NULL,
    dispositivo VARCHAR(50),
    sistema_operativo VARCHAR(50),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id_usuario)
);

-- Tabla: logros
CREATE TABLE IF NOT EXISTS logros (
    id_logro INT AUTO_INCREMENT PRIMARY KEY,
    nombre_logro VARCHAR(100) NOT NULL,
    descripcion TEXT,
    icono_url VARCHAR(255),
    puntos_otorgados INT DEFAULT 0,
    criterio VARCHAR(255)
);

-- Tabla: logros_compartidos
CREATE TABLE IF NOT EXISTS logros_compartidos (
    id_compartido INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    logro_id INT,
    fecha_obtencion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_compartido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    plataforma_compartido VARCHAR(50),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (logro_id) REFERENCES logros(id_logro)
);

-- Tabla: preferencias_visuales
CREATE TABLE IF NOT EXISTS preferencias_visuales (
    id_preferencia INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT UNIQUE,
    tema ENUM('claro', 'oscuro', 'auto') DEFAULT 'claro',
    tamano_fuente ENUM('pequeno', 'normal', 'grande') DEFAULT 'normal',
    idioma_interfaz ENUM('es', 'en', 'pt') DEFAULT 'es',
    notificaciones_email BOOLEAN DEFAULT TRUE,
    notificaciones_push BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id_usuario)
);

-- Tabla: feedback_plataforma
CREATE TABLE IF NOT EXISTS feedback_plataforma (
    id_feedback INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    tipo_feedback ENUM('bug', 'sugerencia', 'comentario', 'elogio'),
    descripcion TEXT NOT NULL,
    fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('pendiente', 'revisado', 'resuelto', 'descartado') DEFAULT 'pendiente',
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id_usuario)
);

-- Añadir claves foráneas que requieren referencias cruzadas
ALTER TABLE usuarios ADD CONSTRAINT fk_usuario_nivel 
    FOREIGN KEY (nivel_id) REFERENCES niveles(id_nivel) ON DELETE SET NULL;

ALTER TABLE clases ADD CONSTRAINT fk_clase_profesor 
    FOREIGN KEY (profesor_id) REFERENCES usuarios(id_usuario) ON DELETE SET NULL;

-- Crear algunos índices para mejorar el rendimiento
CREATE INDEX idx_usuario_correo ON usuarios(correo);
CREATE INDEX idx_clase_fecha ON clases(fecha_hora_inicio);
CREATE INDEX idx_clase_profesor ON clases(profesor_id);
CREATE INDEX idx_conexion_usuario ON conexiones(usuario_id);
CREATE INDEX idx_actividad_usuario ON actividad_usuario(usuario_id, fecha_hora);
CREATE INDEX idx_progreso_usuario ON progreso_usuario(usuario_id);
CREATE INDEX idx_calificacion_clase ON calificaciones(clase_id);