// ==================== NUEVOS ENDPOINTS DE MARKETPLACE ====================

// Obtener clases públicas disponibles (Marketplace)
app.get('/api/clases/disponibles', async (req, res) => {
    const { nivel, fecha, profesor_id } = req.query;

    try {
        let sql = `
      SELECT c.*, 
        u.nombres as profesor_nombre,
        u.apellido_paterno as profesor_apellido,
        u.nivel_actual as profesor_nivel,
        (c.cupo_maximo - c.cupo_actual) as cupos_disponibles
      FROM clases c
      JOIN usuarios u ON c.profesor_id = u.usuario_id
      WHERE c.tipo = 'PUBLICA' 
        AND c.estado = 'PROGRAMADA'
        AND c.fecha >= CURDATE()
        AND c.cupo_actual < c.cupo_maximo
    `;

        const params = [];

        if (nivel) {
            sql += ' AND c.nivel_requerido = ?';
            params.push(nivel);
        }

        if (fecha) {
            sql += ' AND c.fecha = ?';
            params.push(fecha);
        }

        if (profesor_id) {
            sql += ' AND c.profesor_id = ?';
            params.push(profesor_id);
        }

        sql += ' ORDER BY c.fecha ASC, c.hora_inicio ASC';

        const [results] = await db.execute(sql, params);
        res.json(results);
    } catch (err) {
        console.error('Error obteniendo clases disponibles:', err);
        return res.status(500).json({ error: 'Error al obtener clases', detail: err.message });
    }
});

// Inscribirse en una clase pública
app.post('/api/clases/:clase_id/inscribirse', async (req, res) => {
    const { clase_id } = req.params;
    const { alumno_id } = req.body;

    try {
        // Verificar que la clase existe y es pública
        const [clases] = await db.execute(
            'SELECT * FROM clases WHERE clase_id = ? AND tipo = "PUBLICA"',
            [clase_id]
        );

        if (clases.length === 0) {
            return res.status(404).json({ error: 'Clase no encontrada o no es pública' });
        }

        const clase = clases[0];

        // Verificar cupos disponibles
        if (clase.cupo_actual >= clase.cupo_maximo) {
            return res.status(400).json({ error: 'La clase está llena' });
        }

        // Insertar inscripción
        await db.execute(
            'INSERT INTO inscripciones (clase_id, alumno_id) VALUES (?, ?)',
            [clase_id, alumno_id]
        );

        // Actualizar cupo actual
        await db.execute(
            'UPDATE clases SET cupo_actual = cupo_actual + 1 WHERE clase_id = ?',
            [clase_id]
        );

        res.json({ message: 'Inscripción exitosa' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Ya estás inscrito en esta clase' });
        }
        console.error('Error en inscripción:', err);
        return res.status(500).json({ error: 'Error al inscribirse', detail: err.message });
    }
});

// Ver inscritos en una clase
app.get('/api/clases/:clase_id/inscritos', async (req, res) => {
    const { clase_id } = req.params;

    try {
        const sql = `
      SELECT i.*, u.nombres, u.apellido_paterno, u.email, u.nivel_actual
      FROM inscripciones i
      JOIN usuarios u ON i.alumno_id = u.usuario_id
      WHERE i.clase_id = ? AND i.estado = 'CONFIRMADA'
      ORDER BY i.fecha_inscripcion ASC
    `;

        const [results] = await db.execute(sql, [clase_id]);
        res.json(results);
    } catch (err) {
        console.error('Error obteniendo inscritos:', err);
        return res.status(500).json({ error: 'Error al obtener inscritos', detail: err.message });
    }
});

// Cancelar inscripción
app.delete('/api/inscripciones/:inscripcion_id', async (req, res) => {
    const { inscripcion_id } = req.params;

    try {
        // Obtener clase_id antes de borrar
        const [inscripciones] = await db.execute(
            'SELECT clase_id FROM inscripciones WHERE inscripcion_id = ?',
            [inscripcion_id]
        );

        if (inscripciones.length === 0) {
            return res.status(404).json({ error: 'Inscripción no encontrada' });
        }

        const clase_id = inscripciones[0].clase_id;

        // Marcar como cancelada
        await db.execute(
            'UPDATE inscripciones SET estado = "CANCELADA", fecha_cancelacion = NOW() WHERE inscripcion_id = ?',
            [inscripcion_id]
        );

        // Decrementar cupo actual
        await db.execute(
            'UPDATE clases SET cupo_actual = cupo_actual - 1 WHERE clase_id = ?',
            [clase_id]
        );

        res.json({ message: 'Inscripción cancelada' });
    } catch (err) {
        console.error('Error cancelando inscripción:', err);
        return res.status(500).json({ error: 'Error al cancelar inscripción', detail: err.message });
    }
});

// Obtener clases públicas de un profesor
app.get('/api/profesores/:profesor_id/clases-publicas', async (req, res) => {
    const { profesor_id } = req.params;

    try {
        const sql = `
      SELECT c.*, 
        (c.cupo_maximo - c.cupo_actual) as cupos_disponibles
      FROM clases c
      WHERE c.profesor_id = ? AND c.tipo = 'PUBLICA'
      ORDER BY c.fecha DESC
    `;

        const [results] = await db.execute(sql, [profesor_id]);
        res.json(results);
    } catch (err) {
        console.error('Error obteniendo clases públicas:', err);
        return res.status(500).json({ error: 'Error al obtener clases', detail: err.message });
    }
});
