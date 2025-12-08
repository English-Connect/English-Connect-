const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Conexión a MySQL con UTF-8
const db = mysql.createPool({
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER || 'english_user',
  password: process.env.DB_PASSWORD || 'english_password',
  database: process.env.DB_NAME || 'english_connect',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
}).promise();

// Función para probar la conexión al inicio con reintentos
const checkConnection = async (retries = 5, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const connection = await db.getConnection();
      console.log('Conectado a MySQL correctamente');
      connection.release();
      return;
    } catch (err) {
      console.log(`Error conectando a MySQL (intento ${i + 1}/${retries}):`, err.message);
      if (i < retries - 1) {
        console.log(`Reintentando en ${delay / 1000} segundos...`);
        await new Promise(res => setTimeout(res, delay));
      } else {
        console.error('No se pudo conectar a MySQL después de varios intentos.');
      }
    }
  }
};

checkConnection();

// ==================== RUTAS DE USUARIOS ====================

// Registrar nuevo usuario
app.post('/api/usuarios/registro', async (req, res) => {
  const { nombres, apellido_paterno, apellido_materno, email, contrasena, nivel_actual, nivel_deseado, rol, edad, phone_number } = req.body;

  console.log("=== INTENTO DE REGISTRO ===");
  console.log("Cuerpo recibido (req.body):", req.body);
  console.log("Tipo de dato:", typeof req.body);

  // Validar campos requeridos
  if (!nombres || !apellido_paterno || !email || !contrasena || !rol) {
    return res.status(400).json({ error: 'Faltan campos requeridos: nombres, apellido_paterno, email, contrasena y rol son obligatorios' });
  }

  // Validar campos espec├¡ficos seg├║n el rol
  if (rol === 'ALUMNO' && (!nivel_actual || !nivel_deseado)) {
    return res.status(400).json({
      error: 'Campos requeridos faltantes',
      detail: 'Los alumnos deben especificar su nivel actual y nivel deseado.'
    });
  }

  if (rol === 'PROFESOR' && !nivel_actual) {
    return res.status(400).json({
      error: 'Campo requerido faltante',
      detail: 'Los profesores deben especificar su nivel actual.'
    });
  }

  if (rol === 'AMBOS' && (!nivel_actual || !nivel_deseado)) {
    return res.status(400).json({
      error: 'Campos requeridos faltantes',
      detail: 'Debe especificar tanto el nivel actual como el nivel deseado.'
    });
  }

  // Validar que profesores tengan nivel m├¡nimo B2
  if ((rol === 'PROFESOR' || rol === 'AMBOS') && nivel_actual) {
    const nivelesAvanzados = ['B2', 'C1', 'C2'];
    if (!nivelesAvanzados.includes(nivel_actual)) {
      return res.status(400).json({
        error: 'Nivel insuficiente para profesor',
        detail: 'Los profesores deben tener un nivel m├¡nimo de B2 (Intermedio Alto). Por favor, selecciona B2, C1 o C2.'
      });
    }
  }

  const sql = `INSERT INTO usuarios (nombres, apellido_paterno, apellido_materno, email, contrasena, nivel_actual, nivel_deseado, rol, edad, phone_number) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  try {
    // Convertir undefined a null para campos opcionales
    const [result] = await db.execute(sql, [
      nombres,
      apellido_paterno,
      apellido_materno || null,
      email,
      contrasena,
      nivel_actual || null,
      nivel_deseado || null,
      rol,
      edad || null,
      phone_number || null
    ]);

    res.json({ message: 'Usuario registrado exitosamente', usuario_id: result.insertId });
  } catch (err) {
    // Manejar espec├¡ficamente el error de email duplicado
    if (err.code === 'ER_DUP_ENTRY') {
      console.log('Error: Email duplicado -', email);
      return res.status(409).json({
        error: 'El email ya est├í registrado',
        detail: 'Ya existe una cuenta con este correo electr├│nico. Por favor, usa otro email o inicia sesi├│n.'
      });
    }

    // Otros errores de base de datos
    console.error('Error en registro:', err);
    return res.status(500).json({ error: 'Error al registrar usuario', detail: err.message });
  }
});

// Login de usuario
app.post('/api/usuarios/login', async (req, res) => {
  const { email, contrasena } = req.body;

  // Validar que lleguen los datos
  if (!email || !contrasena) {
    return res.status(400).json({ error: 'Email y contrase├▒a son requeridos' });
  }

  try {
    const sql = 'SELECT * FROM usuarios WHERE email = ? AND contrasena = ?';
    const [results] = await db.execute(sql, [email, contrasena]);

    if (results.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const usuario = { ...results[0] };
    delete usuario.contrasena; // No enviar la contrasena

    res.json({ message: 'Login exitoso', usuario });
  } catch (err) {
    console.error('Error en login:', err);
    return res.status(500).json({ error: 'Error al iniciar sesi├│n', detail: err.message });
  }
});

// Obtener todos los usuarios
app.get('/api/usuarios', async (req, res) => {
  try {
    const sql = 'SELECT usuario_id, nombres, apellido_paterno, email, nivel_actual, nivel_deseado, rol FROM usuarios';
    const [results] = await db.execute(sql);
    res.json(results);
  } catch (err) {
    console.error('Error obteniendo usuarios:', err);
    return res.status(500).json({ error: 'Error al obtener usuarios', detail: err.message });
  }
});

// ==================== RUTAS DE CLASES ====================

// Crear nueva clase (privada o pública)
app.post('/api/clases', async (req, res) => {
  const {
    alumno_id, profesor_id, fecha, hora_inicio, hora_fin,
    tipo, cupo_maximo, titulo, descripcion, nivel_requerido
  } = req.body;

  // Validar según tipo de clase
  if (tipo === 'PRIVADA' && !alumno_id) {
    return res.status(400).json({
      error: 'Las clases privadas requieren alumno_id'
    });
  }

  if (tipo === 'PUBLICA' && (!titulo || !cupo_maximo)) {
    return res.status(400).json({
      error: 'Las clases públicas requieren título y cupo máximo'
    });
  }

  try {
    const sql = `INSERT INTO clases 
      (alumno_id, profesor_id, fecha, hora_inicio, hora_fin, tipo, cupo_maximo, cupo_actual, titulo, descripcion, nivel_requerido, estado) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const [result] = await db.execute(sql, [
      alumno_id || null,
      profesor_id,
      fecha,
      hora_inicio,
      hora_fin,
      tipo || 'PRIVADA',
      cupo_maximo || 1,
      0, // cupo_actual inicial
      titulo || null,
      descripcion || null,
      nivel_requerido || null,
      'PROGRAMADA' // estado inicial
    ]);

    res.json({
      message: tipo === 'PUBLICA' ? 'Clase publicada exitosamente' : 'Clase creada exitosamente',
      clase_id: result.insertId
    });
  } catch (err) {
    console.error('Error creando clase:', err);
    return res.status(500).json({ error: 'Error al crear clase', detail: err.message });
  }
});

// Obtener clases de un usuario (privadas y públicas inscritas)
app.get('/api/clases/usuario/:usuario_id', async (req, res) => {
  const { usuario_id } = req.params;

  try {
    // Usar UNION para combinar clases privadas, clases como profesor, y clases públicas inscritas
    const sql = `
      SELECT c.*, 
             u_prof.nombres as profesor_nombre, 
             u_alum.nombres as alumno_nombre,
             NULL as inscripcion_id,
             NULL as inscripcion_estado,
             'PRIVADA' as origen
      FROM clases c
      JOIN usuarios u_prof ON c.profesor_id = u_prof.usuario_id
      LEFT JOIN usuarios u_alum ON c.alumno_id = u_alum.usuario_id
      WHERE c.alumno_id = ? OR c.profesor_id = ?
      
      UNION
      
      SELECT c.*, 
             u_prof.nombres as profesor_nombre, 
             NULL as alumno_nombre,
             i.inscripcion_id,
             i.estado as inscripcion_estado,
             'INSCRITA' as origen
      FROM clases c
      JOIN usuarios u_prof ON c.profesor_id = u_prof.usuario_id
      JOIN inscripciones i ON c.clase_id = i.clase_id
      WHERE i.alumno_id = ? AND i.estado = 'CONFIRMADA'
      
      ORDER BY fecha DESC, hora_inicio DESC
    `;

    const [results] = await db.execute(sql, [usuario_id, usuario_id, usuario_id]);
    res.json(results);
  } catch (err) {
    console.error('Error obteniendo clases de usuario:', err);
    return res.status(500).json({ error: 'Error al obtener clases', detail: err.message });
  }
});

// ==================== RUTAS DE MARKETPLACE ====================

// Listar clases públicas disponibles
app.get('/api/clases/disponibles', async (req, res) => {
  const { nivel, fecha, profesor_id } = req.query;

  try {
    let sql = `SELECT c.*, 
                u.nombres as profesor_nombre, 
                u.apellido_paterno as profesor_apellido,
                u.nivel_actual as profesor_nivel,
                (c.cupo_maximo - c.cupo_actual) as cupos_disponibles
               FROM clases c
               JOIN usuarios u ON c.profesor_id = u.usuario_id
               WHERE c.tipo = 'PUBLICA' 
                 AND c.estado = 'PROGRAMADA'
                 AND c.fecha >= CURDATE()
                 AND c.cupo_actual < c.cupo_maximo`;

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
    return res.status(500).json({ error: 'Error al obtener clases disponibles', detail: err.message });
  }
});

// Inscribirse en una clase pública
app.post('/api/clases/:clase_id/inscribirse', async (req, res) => {
  const { clase_id } = req.params;
  const { alumno_id } = req.body;

  try {
    // Verificar que la clase existe y es pública
    const [clases] = await db.execute(
      'SELECT * FROM clases WHERE clase_id = ? AND tipo = \'PUBLICA\'',
      [clase_id]
    );

    if (clases.length === 0) {
      return res.status(404).json({ error: 'Clase no encontrada o no es pública' });
    }

    const clase = clases[0];

    // Verificar cupos disponibles
    if (clase.cupo_actual >= clase.cupo_maximo) {
      return res.status(400).json({ error: 'No hay cupos disponibles' });
    }

    // Insertar inscripción
    await db.execute(
      'INSERT INTO inscripciones (clase_id, alumno_id, estado, fecha_inscripcion) VALUES (?, ?, ?, NOW())',
      [clase_id, alumno_id, 'CONFIRMADA']
    );

    // Incrementar cupo actual
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
    const sql = `SELECT u.nombres, u.apellido_paterno, u.apellido_materno, 
                        u.email, u.nivel_actual, i.fecha_inscripcion
                 FROM inscripciones i
                 JOIN usuarios u ON i.alumno_id = u.usuario_id
                 WHERE i.clase_id = ? AND i.estado = 'CONFIRMADA'
                 ORDER BY i.fecha_inscripcion ASC`;

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
    // Obtener datos de la inscripción
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
      'UPDATE inscripciones SET estado = \'CANCELADA\', fecha_cancelacion = NOW() WHERE inscripcion_id = ?',
      [inscripcion_id]
    );

    // Decrementar cupo actual
    await db.execute(
      'UPDATE clases SET cupo_actual = cupo_actual - 1 WHERE clase_id = ?',
      [clase_id]
    );

    res.json({ message: 'Inscripción cancelada exitosamente' });
  } catch (err) {
    console.error('Error cancelando inscripción:', err);
    return res.status(500).json({ error: 'Error al cancelar inscripción', detail: err.message });
  }
});

// Obtener clases públicas de un profesor
app.get('/api/profesores/:profesor_id/clases-publicas', async (req, res) => {
  const { profesor_id } = req.params;

  try {
    const sql = `SELECT *, 
                        (cupo_maximo - cupo_actual) as cupos_disponibles
                 FROM clases 
                 WHERE profesor_id = ? AND tipo = 'PUBLICA'
                 ORDER BY fecha DESC`;

    const [results] = await db.execute(sql, [profesor_id]);
    res.json(results);
  } catch (err) {
    console.error('Error obteniendo clases públicas del profesor:', err);
    return res.status(500).json({ error: 'Error al obtener clases públicas', detail: err.message });
  }
});

// ==================== RUTAS DE CONEXIONES ====================

// Enviar solicitud de conexi├│n
app.post('/api/conexiones', async (req, res) => {
  const { solicitante_id, receptor_id, nivel_solicitado } = req.body;

  try {
    const sql = `INSERT INTO conexiones (solicitante_id, receptor_id, nivel_solicitado) 
                 VALUES (?, ?, ?)`;

    const [result] = await db.execute(sql, [solicitante_id, receptor_id, nivel_solicitado]);
    res.json({ message: 'Solicitud de conexi├│n enviada', conexion_id: result.insertId });
  } catch (err) {
    console.error('Error enviando solicitud de conexi├│n:', err);
    return res.status(500).json({ error: 'Error al enviar solicitud de conexi├│n', detail: err.message });
  }
});

// Obtener conexiones de un usuario
app.get('/api/conexiones/usuario/:usuario_id', async (req, res) => {
  const { usuario_id } = req.params;

  try {
    const sql = `SELECT c.*, 
                 u_sol.nombres as solicitante_nombre,
                 u_rec.nombres as receptor_nombre
                 FROM conexiones c
                 JOIN usuarios u_sol ON c.solicitante_id = u_sol.usuario_id
                 JOIN usuarios u_rec ON c.receptor_id = u_rec.usuario_id
                 WHERE c.solicitante_id = ? OR c.receptor_id = ?`;

    const [results] = await db.execute(sql, [usuario_id, usuario_id]);
    res.json(results);
  } catch (err) {
    console.error('Error obteniendo conexiones de usuario:', err);
    return res.status(500).json({ error: 'Error al obtener conexiones', detail: err.message });
  }
});

// ==================== RUTAS DE DISPONIBILIDAD ====================

// Agregar disponibilidad
app.post('/api/disponibilidades', async (req, res) => {
  const { usuario_id, dia, hora_inicio, hora_fin } = req.body;

  try {
    const sql = `INSERT INTO disponibilidades (usuario_id, dia, hora_inicio, hora_fin) 
                 VALUES (?, ?, ?, ?)`;

    const [result] = await db.execute(sql, [usuario_id, dia, hora_inicio, hora_fin]);
    res.json({ message: 'Disponibilidad agregada', disponibilidad_id: result.insertId });
  } catch (err) {
    console.error('Error agregando disponibilidad:', err);
    return res.status(500).json({ error: 'Error al agregar disponibilidad', detail: err.message });
  }
});

// Obtener disponibilidad de un usuario
app.get('/api/disponibilidades/usuario/:usuario_id', async (req, res) => {
  const { usuario_id } = req.params;

  try {
    const sql = 'SELECT * FROM disponibilidades WHERE usuario_id = ?';
    const [results] = await db.execute(sql, [usuario_id]);
    res.json(results);
  } catch (err) {
    console.error('Error obteniendo disponibilidades de usuario:', err);
    return res.status(500).json({ error: 'Error al obtener disponibilidades', detail: err.message });
  }
});

// ==================== RUTA DE PRUEBA ====================

app.get('/', (req, res) => {
  res.json({
    message: 'API de English Connect funcionando!',
    endpoints: {
      usuarios: '/api/usuarios',
      clases: '/api/clases',
      conexiones: '/api/conexiones',
      disponibilidades: '/api/disponibilidades'
    }
  });
});

// Agregar despu├®s de las rutas existentes

// Obtener usuario por ID
app.get('/api/usuarios/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const sql = 'SELECT usuario_id, nombres, apellido_paterno, email, nivel_actual, nivel_deseado, rol FROM usuarios WHERE usuario_id = ?';
    const [results] = await db.execute(sql, [id]);

    if (results.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(results[0]);
  } catch (err) {
    console.error('Error obteniendo usuario por ID:', err);
    return res.status(500).json({ error: 'Error al obtener usuario', detail: err.message });
  }
});

// Aceptar conexi├│n
app.put('/api/conexiones/:id/aceptar', async (req, res) => {
  const { id } = req.params;

  try {
    const sql = 'UPDATE conexiones SET estado = "ACEPTADA" WHERE conexion_id = ?';
    await db.execute(sql, [id]);
    res.json({ message: 'Conexi├│n aceptada' });
  } catch (err) {
    console.error('Error aceptando conexi├│n:', err);
    return res.status(500).json({ error: 'Error al aceptar conexi├│n', detail: err.message });
  }
});

// Actualizar estado de clase
app.put('/api/clases/:id', async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  try {
    const sql = 'UPDATE clases SET estado = ? WHERE clase_id = ?';
    await db.execute(sql, [estado, id]);
    res.json({ message: 'Estado de clase actualizado' });
  } catch (err) {
    console.error('Error actualizando estado de clase:', err);
    return res.status(500).json({ error: 'Error al actualizar estado de clase', detail: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
