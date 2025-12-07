const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Conexión a MySQL
// Configuración del pool de conexiones MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'english_connect',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Promisify para usar async/await si fuera necesario en el futuro, 
// aunque aquí usaremos execute directamente que es compatible.
const db = pool.promise();

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
        // No matamos el proceso, permitimos que siga intentando en cada request
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

  // Validar campos específicos según el rol
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

  // Validar que profesores tengan nivel mínimo B2
  if ((rol === 'PROFESOR' || rol === 'AMBOS') && nivel_actual) {
    const nivelesAvanzados = ['B2', 'C1', 'C2'];
    if (!nivelesAvanzados.includes(nivel_actual)) {
      return res.status(400).json({
        error: 'Nivel insuficiente para profesor',
        detail: 'Los profesores deben tener un nivel mínimo de B2 (Intermedio Alto). Por favor, selecciona B2, C1 o C2.'
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
    // Manejar específicamente el error de email duplicado
    if (err.code === 'ER_DUP_ENTRY') {
      console.log('Error: Email duplicado -', email);
      return res.status(409).json({
        error: 'El email ya está registrado',
        detail: 'Ya existe una cuenta con este correo electrónico. Por favor, usa otro email o inicia sesión.'
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
    return res.status(400).json({ error: 'Email y contraseña son requeridos' });
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
    return res.status(500).json({ error: 'Error al iniciar sesión', detail: err.message });
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

// Crear nueva clase
app.post('/api/clases', async (req, res) => {
  const { alumno_id, profesor_id, fecha, hora_inicio, hora_fin } = req.body;

  try {
    const sql = `INSERT INTO clases (alumno_id, profesor_id, fecha, hora_inicio, hora_fin) 
                 VALUES (?, ?, ?, ?, ?)`;

    const [result] = await db.execute(sql, [alumno_id, profesor_id, fecha, hora_inicio, hora_fin]);
    res.json({ message: 'Clase creada exitosamente', clase_id: result.insertId });
  } catch (err) {
    console.error('Error creando clase:', err);
    return res.status(500).json({ error: 'Error al crear clase', detail: err.message });
  }
});

// Obtener clases de un usuario
app.get('/api/clases/usuario/:usuario_id', async (req, res) => {
  const { usuario_id } = req.params;

  try {
    const sql = `SELECT c.*, 
                 u_prof.nombres as profesor_nombre, 
                 u_alum.nombres as alumno_nombre
                 FROM clases c
                 JOIN usuarios u_prof ON c.profesor_id = u_prof.usuario_id
                 JOIN usuarios u_alum ON c.alumno_id = u_alum.usuario_id
                 WHERE c.alumno_id = ? OR c.profesor_id = ?`;

    const [results] = await db.execute(sql, [usuario_id, usuario_id]);
    res.json(results);
  } catch (err) {
    console.error('Error obteniendo clases de usuario:', err);
    return res.status(500).json({ error: 'Error al obtener clases', detail: err.message });
  }
});

// ==================== RUTAS DE CONEXIONES ====================

// Enviar solicitud de conexión
app.post('/api/conexiones', async (req, res) => {
  const { solicitante_id, receptor_id, nivel_solicitado } = req.body;

  try {
    const sql = `INSERT INTO conexiones (solicitante_id, receptor_id, nivel_solicitado) 
                 VALUES (?, ?, ?)`;

    const [result] = await db.execute(sql, [solicitante_id, receptor_id, nivel_solicitado]);
    res.json({ message: 'Solicitud de conexión enviada', conexion_id: result.insertId });
  } catch (err) {
    console.error('Error enviando solicitud de conexión:', err);
    return res.status(500).json({ error: 'Error al enviar solicitud de conexión', detail: err.message });
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

// Agregar después de las rutas existentes

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

// Aceptar conexión
app.put('/api/conexiones/:id/aceptar', async (req, res) => {
  const { id } = req.params;

  try {
    const sql = 'UPDATE conexiones SET estado = "ACEPTADA" WHERE conexion_id = ?';
    await db.execute(sql, [id]);
    res.json({ message: 'Conexión aceptada' });
  } catch (err) {
    console.error('Error aceptando conexión:', err);
    return res.status(500).json({ error: 'Error al aceptar conexión', detail: err.message });
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