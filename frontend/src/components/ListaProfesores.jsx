import React, { useState, useEffect } from 'react';
import { usuarioService, conexionService } from '../services/api';

const ListaProfesores = () => {
  const [profesores, setProfesores] = useState([]);
  const [conexiones, setConexiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroNivel, setFiltroNivel] = useState('');

  const usuario = JSON.parse(localStorage.getItem('usuario'));

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [usuariosRes, conexionesRes] = await Promise.all([
        usuarioService.obtenerTodos(),
        conexionService.obtenerPorUsuario(usuario.usuario_id)
      ]);
      
      // Filtrar solo profesores
      const profesoresFiltrados = usuariosRes.data.filter(user => 
        user.rol === 'PROFESOR' || user.rol === 'AMBOS'
      );
      
      setProfesores(profesoresFiltrados);
      setConexiones(conexionesRes.data);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const enviarSolicitud = async (profesorId) => {
    try {
      await conexionService.crear({
        solicitante_id: usuario.usuario_id,
        receptor_id: profesorId,
        nivel_solicitado: usuario.nivel_deseado
      });
      alert('✅ Solicitud de conexión enviada al profesor');
      cargarDatos();
    } catch (error) {
      alert('❌ Error: ' + (error.response?.data?.error || 'No se pudo enviar la solicitud'));
    }
  };

  const yaEnviadaSolicitud = (profesorId) => {
    return conexiones.some(conexion => 
      conexion.receptor_id === profesorId && 
      (conexion.estado === 'PENDIENTE' || conexion.estado === 'ACEPTADA')
    );
  };

  const profesoresFiltrados = filtroNivel 
    ? profesores.filter(profesor => profesor.nivel_actual === filtroNivel)
    : profesores;

  if (loading) return <div className="container text-center">Cargando profesores...</div>;

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>👨‍🏫 Encuentra tu Profesor Ideal</h2>
          <div>
            <label className="form-label">Filtrar por nivel: </label>
            <select 
              value={filtroNivel} 
              onChange={(e) => setFiltroNivel(e.target.value)}
              className="form-select"
              style={{ width: 'auto', display: 'inline-block', marginLeft: '10px' }}
            >
              <option value="">Todos los niveles</option>
              <option value="A1">A1 - Principiante</option>
              <option value="A2">A2 - Básico</option>
              <option value="B1">B1 - Intermedio</option>
              <option value="B2">B2 - Intermedio Alto</option>
              <option value="C1">C1 - Avanzado</option>
              <option value="C2">C2 - Maestría</option>
            </select>
          </div>
        </div>

        {profesoresFiltrados.length === 0 ? (
          <div className="text-center">
            <p>No se encontraron profesores con los filtros seleccionados</p>
          </div>
        ) : (
          <div className="grid grid-3">
            {profesoresFiltrados.map(profesor => {
              const solicitudEnviada = yaEnviadaSolicitud(profesor.usuario_id);
              const solicitudAceptada = conexiones.some(conexion => 
                conexion.receptor_id === profesor.usuario_id && conexion.estado === 'ACEPTADA'
              );

              return (
                <div key={profesor.usuario_id} className="card" style={{ textAlign: 'center' }}>
                  <div style={{ 
                    width: '80px', 
                    height: '80px', 
                    borderRadius: '50%', 
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    margin: '0 auto 15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '2rem'
                  }}>
                    👨‍🏫
                  </div>
                  
                  <h3>{profesor.nombres} {profesor.apellido_paterno}</h3>
                  
                  <div style={{ margin: '15px 0' }}>
                    <p><strong>Nivel:</strong> {profesor.nivel_actual}</p>
                    <p><strong>Email:</strong> {profesor.email}</p>
                    {profesor.phone_number && (
                      <p><strong>Teléfono:</strong> {profesor.phone_number}</p>
                    )}
                  </div>

                  <div style={{ margin: '15px 0' }}>
                    {solicitudAceptada ? (
                      <span style={{ 
                        color: 'green', 
                        fontWeight: 'bold',
                        padding: '5px 10px',
                        background: '#d4edda',
                        borderRadius: '15px'
                      }}>
                        ✅ Conectado
                      </span>
                    ) : solicitudEnviada ? (
                      <span style={{ 
                        color: 'orange', 
                        fontWeight: 'bold',
                        padding: '5px 10px',
                        background: '#fff3cd',
                        borderRadius: '15px'
                      }}>
                        ⏳ Solicitud Enviada
                      </span>
                    ) : (
                      <button 
                        onClick={() => enviarSolicitud(profesor.usuario_id)}
                        className="btn btn-primary"
                        style={{ width: '100%' }}
                      >
                        📨 Enviar Solicitud
                      </button>
                    )}
                  </div>

                  {solicitudAceptada && (
                    <button 
                      className="btn btn-success"
                      style={{ width: '100%', marginTop: '10px' }}
                      onClick={() => alert('Funcionalidad de programar clase próximamente')}
                    >
                      🗓️ Programar Clase
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Estadísticas */}
      <div className="grid grid-3 mt-20">
        <div className="card text-center">
          <h4>📊 Total Profesores</h4>
          <p style={{ fontSize: '2rem', color: '#667eea' }}>{profesores.length}</p>
        </div>
        <div className="card text-center">
          <h4>✅ Conectados</h4>
          <p style={{ fontSize: '2rem', color: '#28a745' }}>
            {conexiones.filter(c => c.estado === 'ACEPTADA').length}
          </p>
        </div>
        <div className="card text-center">
          <h4>⏳ Pendientes</h4>
          <p style={{ fontSize: '2rem', color: '#ffc107' }}>
            {conexiones.filter(c => c.estado === 'PENDIENTE').length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ListaProfesores;