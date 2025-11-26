const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Conexión a MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'english_connect'
});

db.connect((err) => {
  if (err) {
    console.log('Error conectando a MySQL:', err);
    return;
  }
  console.log('Conectado a MySQL correctamente');
});

// ==================== RUTAS DE USUARIOS ====================

// Registrar nuevo usuario
app.post('/api/usuarios/registro', (req, res) => {
  const { nombres, apellido_paterno, apellido_materno, email, contrasena, nivel_actual, nivel_deseado, rol, edad, phone_number } = req.body;

  // Validar campos requeridos
  if (!nombres || !apellido_paterno || !email || !contrasena || !rol) {
    return res.status(400).json({ error: 'Faltan campos requeridos: nombres, apellido_paterno, email, contrasena y rol son obligatorios' });
  }

  const sql = `INSERT INTO usuarios (nombres, apellido_paterno, apellido_materno, email, contrasena, nivel_actual, nivel_deseado, rol, edad, phone_number) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  // Convertir undefined a null para campos opcionales
  db.execute(sql, [
    nombres, 
    apellido_paterno, 
    apellido_materno || null, 
    email, 
    contrasena, 
    nivel_actual || 'A1', 
    nivel_deseado || 'C2', 
    rol, 
    edad || null, 
    phone_number || null
  ],
    (err, result) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      res.json({ message: 'Usuario registrado exitosamente', usuario_id: result.insertId });
    });
});

// Login de usuario
app.post('/api/usuarios/login', (req, res) => {
  const { email, contrasena } = req.body;

  // Validar que lleguen los datos
  if (!email || !contrasena) {
    return res.status(400).json({ error: 'Email y contraseña son requeridos' });
  }

  const sql = 'SELECT * FROM usuarios WHERE email = ? AND contrasena = ?';
  db.execute(sql, [email, contrasena], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const usuario = { ...results[0] };
    delete usuario.contrasena; // No enviar la contrasena

    res.json({ message: 'Login exitoso', usuario });
  });
});

// Obtener todos los usuarios
app.get('/api/usuarios', (req, res) => {
  const sql = 'SELECT usuario_id, nombres, apellido_paterno, email, nivel_actual, nivel_deseado, rol FROM usuarios';
  db.execute(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// ==================== RUTAS DE CLASES ====================

// Crear nueva clase
app.post('/api/clases', (req, res) => {
  const { alumno_id, profesor_id, fecha, hora_inicio, hora_fin } = req.body;

  const sql = `INSERT INTO clases (alumno_id, profesor_id, fecha, hora_inicio, hora_fin) 
               VALUES (?, ?, ?, ?, ?)`;

  db.execute(sql, [alumno_id, profesor_id, fecha, hora_inicio, hora_fin], (err, result) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({ message: 'Clase creada exitosamente', clase_id: result.insertId });
  });
});

// Obtener clases de un usuario
app.get('/api/clases/usuario/:usuario_id', (req, res) => {
  const { usuario_id } = req.params;

  const sql = `SELECT c.*, 
               u_prof.nombres as profesor_nombre, 
               u_alum.nombres as alumno_nombre
               FROM clases c
               JOIN usuarios u_prof ON c.profesor_id = u_prof.usuario_id
               JOIN usuarios u_alum ON c.alumno_id = u_alum.usuario_id
               WHERE c.alumno_id = ? OR c.profesor_id = ?`;

  db.execute(sql, [usuario_id, usuario_id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// ==================== RUTAS DE CONEXIONES ====================

// Enviar solicitud de conexión
app.post('/api/conexiones', (req, res) => {
  const { solicitante_id, receptor_id, nivel_solicitado } = req.body;

  const sql = `INSERT INTO conexiones (solicitante_id, receptor_id, nivel_solicitado) 
               VALUES (?, ?, ?)`;

  db.execute(sql, [solicitante_id, receptor_id, nivel_solicitado], (err, result) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({ message: 'Solicitud de conexión enviada', conexion_id: result.insertId });
  });
});

// Obtener conexiones de un usuario
app.get('/api/conexiones/usuario/:usuario_id', (req, res) => {
  const { usuario_id } = req.params;

  const sql = `SELECT c.*, 
               u_sol.nombres as solicitante_nombre,
               u_rec.nombres as receptor_nombre
               FROM conexiones c
               JOIN usuarios u_sol ON c.solicitante_id = u_sol.usuario_id
               JOIN usuarios u_rec ON c.receptor_id = u_rec.usuario_id
               WHERE c.solicitante_id = ? OR c.receptor_id = ?`;

  db.execute(sql, [usuario_id, usuario_id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// ==================== RUTAS DE DISPONIBILIDAD ====================

// Agregar disponibilidad
app.post('/api/disponibilidades', (req, res) => {
  const { usuario_id, dia, hora_inicio, hora_fin } = req.body;

  const sql = `INSERT INTO disponibilidades (usuario_id, dia, hora_inicio, hora_fin) 
               VALUES (?, ?, ?, ?)`;

  db.execute(sql, [usuario_id, dia, hora_inicio, hora_fin], (err, result) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({ message: 'Disponibilidad agregada', disponibilidad_id: result.insertId });
  });
});

// Obtener disponibilidad de un usuario
app.get('/api/disponibilidades/usuario/:usuario_id', (req, res) => {
  const { usuario_id } = req.params;

  const sql = 'SELECT * FROM disponibilidades WHERE usuario_id = ?';
  db.execute(sql, [usuario_id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
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
app.get('/api/usuarios/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT usuario_id, nombres, apellido_paterno, email, nivel_actual, nivel_deseado, rol FROM usuarios WHERE usuario_id = ?';

  db.execute(sql, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(results[0]);
  });
});

// Aceptar conexión
app.put('/api/conexiones/:id/aceptar', (req, res) => {
  const { id } = req.params;
  const sql = 'UPDATE conexiones SET estado = "ACEPTADA" WHERE conexion_id = ?';

  db.execute(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Conexión aceptada' });
  });
});

// Actualizar estado de clase
app.put('/api/clases/:id', (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  const sql = 'UPDATE clases SET estado = ? WHERE clase_id = ?';

  db.execute(sql, [estado, id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Estado de clase actualizado' });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});