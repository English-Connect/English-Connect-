-- Migración 001: Agregar soporte para clases públicas y sistema de inscripciones
-- Autor: Sistema
-- Fecha: 2025-12-07
-- Descripción: Permite a profesores publicar clases abiertas y a alumnos inscribirse

USE english_connect;

-- ============================================================
-- 1. MODIFICAR TABLA CLASES
-- ============================================================

-- Agregar nuevas columnas para clases públicas
ALTER TABLE clases 
  ADD COLUMN tipo ENUM('PRIVADA', 'PUBLICA') DEFAULT 'PRIVADA' AFTER estado,
  ADD COLUMN cupo_maximo INT DEFAULT 1 AFTER tipo,
  ADD COLUMN cupo_actual INT DEFAULT 0 AFTER cupo_maximo,
  ADD COLUMN titulo VARCHAR(200) AFTER cupo_actual,
  ADD COLUMN descripcion TEXT AFTER titulo,
  ADD COLUMN nivel_requerido ENUM('A1','A2','B1','B2','C1','C2') AFTER descripcion;

-- Hacer alumno_id opcional (NULL) para clases públicas
ALTER TABLE clases 
  MODIFY COLUMN alumno_id INT NULL;

-- Agregar índices para búsqueda eficiente
ALTER TABLE clases
  ADD INDEX idx_tipo (tipo),
  ADD INDEX idx_fecha_tipo (fecha, tipo),
  ADD INDEX idx_nivel_requerido (nivel_requerido);

-- ============================================================
-- 2. CREAR TABLA INSCRIPCIONES
-- ============================================================

CREATE TABLE IF NOT EXISTS inscripciones (
  inscripcion_id INT PRIMARY KEY AUTO_INCREMENT,
  clase_id INT NOT NULL,
  alumno_id INT NOT NULL,
  estado ENUM('CONFIRMADA', 'CANCELADA') DEFAULT 'CONFIRMADA',
  fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_cancelacion TIMESTAMP NULL,
  FOREIGN KEY (clase_id) REFERENCES clases(clase_id) ON DELETE CASCADE,
  FOREIGN KEY (alumno_id) REFERENCES usuarios(usuario_id) ON DELETE CASCADE,
  UNIQUE KEY unique_enrollment (clase_id, alumno_id),
  INDEX idx_clase (clase_id),
  INDEX idx_alumno (alumno_id),
  INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 3. INSERTAR DATOS DE PRUEBA
-- ============================================================

-- Actualizar clases existentes para tener el nuevo esquema
UPDATE clases SET tipo = 'PRIVADA' WHERE tipo IS NULL;

-- Insertar clases públicas de ejemplo
INSERT INTO clases (profesor_id, fecha, hora_inicio, hora_fin, tipo, cupo_maximo, titulo, descripcion, nivel_requerido, estado) VALUES
(3, '2025-12-20', '10:00:00', '11:00:00', 'PUBLICA', 5, 'Conversación Básica A1', 'Práctica de conversaciones cotidianas para principiantes. Aprenderás saludos, presentaciones y frases comunes.', 'A1', 'PROGRAMADA'),
(3, '2025-12-22', '14:00:00', '15:30:00', 'PUBLICA', 3, 'Gramática Intermedia B1', 'Tiempos verbales y estructuras complejas. Trabajaremos presente perfecto, pasado continuo y condicionales.', 'B1', 'PROGRAMADA'),
(4, '2025-12-21', '16:00:00', '17:00:00', 'PUBLICA', 8, 'Pronunciación Avanzada C1', 'Mejora tu acento y entonación con ejercicios prácticos de fonética inglesa.', 'C1', 'PROGRAMADA'),
(4, '2025-12-23', '09:00:00', '10:30:00', 'PUBLICA', 4, 'Business English B2', 'Inglés para negocios: emails, presentaciones y reuniones profesionales.', 'B2', 'PROGRAMADA');

-- Inscribir algunos alumnos de prueba en clases públicas
INSERT INTO inscripciones (clase_id, alumno_id) VALUES
((SELECT clase_id FROM clases WHERE titulo = 'Conversación Básica A1' LIMIT 1), 1),
((SELECT clase_id FROM clases WHERE titulo = 'Gramática Intermedia B1' LIMIT 1), 2);

-- Actualizar cupo_actual basado en inscripciones
UPDATE clases c
SET c.cupo_actual = (
  SELECT COUNT(*) 
  FROM inscripciones i 
  WHERE i.clase_id = c.clase_id AND i.estado = 'CONFIRMADA'
)
WHERE c.tipo = 'PUBLICA';

-- ============================================================
-- VERIFICACIÓN
-- ============================================================

SELECT 'Migración 001 completada exitosamente' AS mensaje;

-- Mostrar resumen de clases públicas
SELECT 
  tipo,
  COUNT(*) as total_clases,
  SUM(cupo_maximo) as total_cupos,
  SUM(cupo_actual) as cupos_ocupados
FROM clases
GROUP BY tipo;
