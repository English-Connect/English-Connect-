-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS english_connect;
USE english_connect;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    usuario_id INT PRIMARY KEY AUTO_INCREMENT,
    nombres VARCHAR(100) NOT NULL,
    apellido_paterno VARCHAR(100) NOT NULL,
    apellido_materno VARCHAR(100),
    email VARCHAR(150) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    nivel_actual ENUM('A1', 'A2', 'B1', 'B2', 'C1', 'C2') DEFAULT 'A1',
    nivel_deseado ENUM('A1', 'A2', 'B1', 'B2', 'C1', 'C2') DEFAULT 'C2',
    rol ENUM('ALUMNO', 'PROFESOR','AMBOS') NOT NULL DEFAULT 'ALUMNO',
    edad INT,
    phone_number VARCHAR(20),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_rol (rol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de clases
CREATE TABLE IF NOT EXISTS clases (
    clase_id INT PRIMARY KEY AUTO_INCREMENT,
    alumno_id INT NOT NULL,
    profesor_id INT NOT NULL,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    estado ENUM('PROGRAMADA', 'EN_CURSO', 'COMPLETADA', 'CANCELADA') DEFAULT 'PROGRAMADA',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (alumno_id) REFERENCES usuarios(usuario_id) ON DELETE CASCADE,
    FOREIGN KEY (profesor_id) REFERENCES usuarios(usuario_id) ON DELETE CASCADE,
    INDEX idx_alumno (alumno_id),
    INDEX idx_profesor (profesor_id),
    INDEX idx_fecha (fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de conexiones entre usuarios
CREATE TABLE IF NOT EXISTS conexiones (
    conexion_id INT PRIMARY KEY AUTO_INCREMENT,
    solicitante_id INT NOT NULL,
    receptor_id INT NOT NULL,
    nivel_solicitado ENUM('A1', 'A2', 'B1', 'B2', 'C1', 'C2'),
    estado ENUM('PENDIENTE', 'ACEPTADA', 'RECHAZADA') DEFAULT 'PENDIENTE',
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_respuesta TIMESTAMP NULL,
    FOREIGN KEY (solicitante_id) REFERENCES usuarios(usuario_id) ON DELETE CASCADE,
    FOREIGN KEY (receptor_id) REFERENCES usuarios(usuario_id) ON DELETE CASCADE,
    INDEX idx_solicitante (solicitante_id),
    INDEX idx_receptor (receptor_id),
    INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de disponibilidades de profesores
CREATE TABLE IF NOT EXISTS disponibilidades (
    disponibilidad_id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    dia ENUM('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO') NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(usuario_id) ON DELETE CASCADE,
    INDEX idx_usuario (usuario_id),
    INDEX idx_dia (dia)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar usuarios de prueba
INSERT INTO usuarios (nombres, apellido_paterno, apellido_materno, email, contrasena, nivel_actual, nivel_deseado, rol, edad, phone_number) VALUES
('Juan', 'Perez', 'Garcia', 'juan.perez@example.com', 'password123', 'A1', 'B2', 'ALUMNO', 25, '5551234567'),
('Maria', 'Gonzalez', 'Lopez', 'maria.gonzalez@example.com', 'password123', 'B1', 'C1', 'ALUMNO', 28, '5559876543'),
('Robert', 'Smith', 'Johnson', 'robert.smith@example.com', 'teacher123', 'C2', 'C2', 'PROFESOR', 35, '5551112222'),
('Emily', 'Brown', 'Davis', 'emily.brown@example.com', 'teacher123', 'C2', 'C2', 'PROFESOR', 32, '5553334444');

-- Insertar disponibilidades de ejemplo para profesores
INSERT INTO disponibilidades (usuario_id, dia, hora_inicio, hora_fin) VALUES
(3, 'LUNES', '09:00:00', '12:00:00'),
(3, 'MIERCOLES', '14:00:00', '18:00:00'),
(3, 'VIERNES', '09:00:00', '13:00:00'),
(4, 'MARTES', '10:00:00', '14:00:00'),
(4, 'JUEVES', '15:00:00', '19:00:00');

-- Insertar conexiones de ejemplo
INSERT INTO conexiones (solicitante_id, receptor_id, nivel_solicitado, estado) VALUES
(1, 3, 'B1', 'ACEPTADA'),
(2, 4, 'C1', 'PENDIENTE');

-- Insertar clases de ejemplo
INSERT INTO clases (alumno_id, profesor_id, fecha, hora_inicio, hora_fin, estado) VALUES
(1, 3, '2025-11-25', '10:00:00', '11:00:00', 'PROGRAMADA'),
(2, 4, '2025-11-26', '15:00:00', '16:00:00', 'PROGRAMADA');

-- Mensaje de confirmación
SELECT 'Base de datos inicializada correctamente' AS mensaje;
