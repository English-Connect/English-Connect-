import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token a las requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Servicios para Usuarios
export const usuarioService = {
  registrar: (usuarioData) => api.post('/usuarios/registro', usuarioData),
  login: (credenciales) => api.post('/usuarios/login', credenciales),
  obtenerTodos: () => api.get('/usuarios'),
  obtenerPorId: (usuarioId) => api.get(`/usuarios/${usuarioId}`),
};

// Servicios para Clases
export const claseService = {
  crear: (claseData) => api.post('/clases', claseData),
  obtenerPorUsuario: (usuarioId) => api.get(`/clases/usuario/${usuarioId}`),
  actualizarEstado: (claseId, estado) => api.put(`/clases/${claseId}`, { estado }),
  obtenerDisponibles: () => api.get('/clases/disponibles'),
};

// Servicios para Conexiones
export const conexionService = {
  crear: (conexionData) => api.post('/conexiones', conexionData),
  obtenerPorUsuario: (usuarioId) => api.get(`/conexiones/usuario/${usuarioId}`),
  aceptarConexion: (conexionId) => api.put(`/conexiones/${conexionId}/aceptar`),
};

// Servicios para Disponibilidad
export const disponibilidadService = {
  crear: (disponibilidadData) => api.post('/disponibilidades', disponibilidadData),
  obtenerPorUsuario: (usuarioId) => api.get(`/disponibilidades/usuario/${usuarioId}`),
};

export default api;