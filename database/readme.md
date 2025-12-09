# 📚 English Connect — Base de Datos

Este repositorio contiene el diseño, estructura y modelo de la base de datos del proyecto **English Connect**, una plataforma educativa enfocada en facilitar el aprendizaje del idioma inglés mediante clases, seguimiento personalizado, progresos, logros y más funcionalidades centradas en la experiencia del usuario.

---

## 🏗️ Modelo de Base de Datos

A continuación se presenta diagrama del modelo de base de datos generado mediante Mermaid:

```mermaid
erDiagram

    usuarios {
        INT id_usuario PK
        VARCHAR nombre
        VARCHAR correo
        VARCHAR contrasena
        DATE fecha_nacimiento
        VARCHAR pais
        INT nivel_id FK
        TIMESTAMP fecha_registro
        VARCHAR avatar_url
        ENUM estado
    }

    niveles {
        INT id_nivel PK
        VARCHAR nombre_nivel
        TEXT descripcion
        INT puntos_requeridos
    }

    clases {
        INT id_clase PK
        VARCHAR titulo
        TEXT descripcion
        INT nivel_id FK
        INT duracion_minutos
        ENUM tipo_clase
        INT capacidad_maxima
        DATETIME fecha_hora_inicio
        INT profesor_id FK
        ENUM estado
    }

    disponibilidades {
        INT id_disponibilidad PK
        INT usuario_id FK
        ENUM dia_semana
        TIME hora_inicio
        TIME hora_fin
    }

    conexiones {
        INT id_conexion PK
        INT usuario_id FK
        INT clase_id FK
        TIMESTAMP fecha_conexion
        ENUM estado_conexion
    }

    actividad_usuario {
        INT id_actividad PK
        INT usuario_id FK
        VARCHAR tipo_actividad
        TEXT descripcion
        TIMESTAMP fecha_hora
        INT duracion_segundos
    }

    progreso_usuario {
        INT id_progreso PK
        INT usuario_id FK
        INT nivel_id FK
        INT puntos_totales
        INT lecciones_completadas
        DECIMAL horas_estudio
        TIMESTAMP fecha_actualizacion
    }

    calificaciones {
        INT id_calificacion PK
        INT usuario_id FK
        INT clase_id FK
        DECIMAL puntuacion
        TEXT comentario
        TIMESTAMP fecha_calificacion
    }

    inasistencias {
        INT id_inasistencia PK
        INT usuario_id FK
        INT clase_id FK
        TIMESTAMP fecha_inasistencia
        TEXT motivo
        BOOLEAN justificado
    }

    abandonos {
        INT id_abandono PK
        INT usuario_id FK
        INT clase_id FK
        TIMESTAMP fecha_abandono
        TEXT motivo
    }

    sesiones_usuario {
        INT id_sesion PK
        INT usuario_id FK
        TIMESTAMP fecha_inicio
        TIMESTAMP fecha_fin
        VARCHAR dispositivo
        VARCHAR sistema_operativo
    }

    logros {
        INT id_logro PK
        VARCHAR nombre_logro
        TEXT descripcion
        VARCHAR icono_url
        INT puntos_otorgados
        VARCHAR criterio
    }

    logros_compartidos {
        INT id_compartido PK
        INT usuario_id FK
        INT logro_id FK
        TIMESTAMP fecha_obtencion
        TIMESTAMP fecha_compartido
        VARCHAR plataforma_compartido
    }

    preferencias_visuales {
        INT id_preferencia PK
        INT usuario_id FK
        ENUM tema
        ENUM tamano_fuente
        ENUM idioma_interfaz
        BOOLEAN notificaciones_email
        BOOLEAN notificaciones_push
    }

    feedback_plataforma {
        INT id_feedback PK
        INT usuario_id FK
        ENUM tipo_feedback
        TEXT descripcion
        TIMESTAMP fecha_envio
        ENUM estado
    }

    %% Relaciones principales
    usuarios ||--o{ clases : "es profesor de"
    usuarios ||--o{ disponibilidades : "tiene"
    usuarios ||--o{ conexiones : "participa"
    usuarios ||--o{ actividad_usuario : "realiza"
    usuarios ||--o{ progreso_usuario : "posee"
    usuarios ||--o{ calificaciones : "califica"
    usuarios ||--o{ inasistencias : "tiene"
    usuarios ||--o{ abandonos : "abandona"
    usuarios ||--o{ sesiones_usuario : "inicia sesión"
    usuarios ||--o{ logros_compartidos : "comparte"
    usuarios ||--|| preferencias_visuales : "tiene 1 a 1"
    usuarios ||--o{ feedback_plataforma : "envía"

    niveles ||--o{ usuarios : "nivel actual"
    niveles ||--o{ clases : "nivel requerido"
    niveles ||--o{ progreso_usuario : "lleva progreso"

    clases ||--o{ conexiones : "registra"
    clases ||--o{ calificaciones : "recibe"
    clases ||--o{ inasistencias : "registra"
    clases ||--o{ abandonos : "registra"

    logros ||--o{ logros_compartidos : "asignado"
