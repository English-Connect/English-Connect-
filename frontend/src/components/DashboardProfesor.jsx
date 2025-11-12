import React, { useState, useEffect } from 'react';
import { claseService, conexionService, usuarioService } from '../services/api';

const DashboardProfesor = () => {
  const [clases, setClases] = useState([]);
  const [conexiones, setConexiones] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('solicitudes');

  const usuario = JSON.parse(localStorage.getItem('usuario'));

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [clasesRes, conexionesRes, usuariosRes] = await Promise.all([
        claseService.obtenerPorUsuario(usuario.usuario_id),
        conexionService.obtenerPorUsuario(usuario.usuario_id),
        usuarioService.obtenerTodos()
      ]);
      
      setClases(clasesRes.data);
      setConexiones(conexionesRes.data);
      setAlumnos(usuariosRes.data.filter(u => u.rol !== 'PROFESOR'));
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const aceptarConexion = async (conexionId) => {
    try {
      await conexionService.aceptarConexion(conexionId);
      alert('✅ Conexión aceptada - ¡Ahora puedes programar clases con este alumno!');
      cargarDatos();
    } catch (error) {
      alert('❌ Error: ' + error.response?.data?.error);
    }
  };

  const rechazarConexion = async (conexionId) => {
    try {
      // Aquí agregarías la lógica para rechazar la conexión
      alert('Funcionalidad de rechazar próximamente');
    } catch (error) {
      alert('❌ Error: ' + error.response?.data?.error);
    }
  };

  const crearClase = async (alumnoId, alumnoNombre) => {
    const fecha = prompt(`🗓️ Programar clase para ${alumnoNombre}\nIngresa la fecha (YYYY-MM-DD):`);
    if (!fecha) return;

    const horaInicio = prompt('⏰ Hora de inicio (HH:MM):');
    if (!horaInicio) return;

    const duracion = prompt('⏱️ Duración en minutos:') || '60';
    const horaFin = calcularHoraFin(horaInicio, parseInt(duracion));

    try {
      await claseService.crear({
        alumno_id: alumnoId,
        profesor_id: usuario.usuario_id,
        fecha: fecha,
        hora_inicio: horaInicio + ':00',
        hora_fin: horaFin + ':00'
      });
      alert('✅ Clase programada exitosamente');
      cargarDatos();
    } catch (error) {
      alert('❌ Error: ' + error.response?.data?.error);
    }
  };

  const calcularHoraFin = (horaInicio, duracion) => {
    const [horas, minutos] = horaInicio.split(':').map(Number);
    const totalMinutos = horas * 60 + minutos + duracion;
    const nuevasHoras = Math.floor(totalMinutos / 60);
    const nuevosMinutos = totalMinutos % 60;
    return `${nuevasHoras.toString().padStart(2, '0')}:${nuevosMinutos.toString().padStart(2, '0')}`;
  };

  if (loading) return <div className="container text-center">Cargando...</div>;

  return (
    <div className="container">
      <h1 className="mb-20">👨‍🏫 Dashboard - Profesor</h1>
      
      {/* Navegación por pestañas */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '2px solid #eee', flexWrap: 'wrap' }}>
        <button 
          className={`btn ${activeTab === 'solicitudes' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('solicitudes')}
          style={{ borderRadius: '20px' }}
        >
          🔔 Solicitudes
        </button>
        <button 
          className={`btn ${activeTab === 'clases' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('clases')}
          style={{ borderRadius: '20px' }}
        >
          📅 Mis Clases
        </button>
        <button 
          className={`btn ${activeTab === 'alumnos' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('alumnos')}
          style={{ borderRadius: '20px' }}
        >
          🎓 Mis Alumnos
        </button>
        <button 
          className={`btn ${activeTab === 'estadisticas' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('estadisticas')}
          style={{ borderRadius: '20px' }}
        >
          📊 Estadísticas
        </button>
      </div>

      {/* Contenido de pestañas */}
      {activeTab === 'solicitudes' && (
        <div className="card">
          <h3>🔔 Solicitudes de Conexión Pendientes</h3>
          {conexiones.filter(c => c.estado === 'PENDIENTE').length === 0 ? (
            <div className="text-center">
              <p>No hay solicitudes pendientes</p>
              <p>Los alumnos aparecerán aquí cuando te envíen solicitudes</p>
            </div>
          ) : (
            <div className="grid grid-2">
              {conexiones.filter(c => c.estado === 'PENDIENTE').map(conexion => (
                <div key={conexion.conexion_id} style={{ 
                  border: '1px solid #eee', 
                  padding: '20px', 
                  borderRadius: '10px',
                  background: '#f9f9f9'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                    <div style={{ 
                      width: '60px', 
                      height: '60px', 
                      borderRadius: '50%', 
                      background: 'linear-gradient(135deg, #28a745, #20c997)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '1.5rem'
                    }}>
                      🎓
                    </div>
                    <div>
                      <strong style={{ fontSize: '1.2rem' }}>{conexion.solicitante_nombre}</strong>
                      <p>📧 {conexion.solicitante_id && alumnos.find(a => a.usuario_id === conexion.solicitante_id)?.email}</p>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '15px' }}>
                    <p><strong>Nivel solicitado:</strong> {conexion.nivel_solicitado}</p>
                    <p><strong>Fecha solicitud:</strong> {new Date(conexion.fecha).toLocaleDateString()}</p>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      onClick={() => aceptarConexion(conexion.conexion_id)}
                      className="btn btn-success"
                      style={{ flex: 1 }}
                    >
                      ✅ Aceptar
                    </button>
                    <button 
                      onClick={() => rechazarConexion(conexion.conexion_id)}
                      className="btn btn-secondary"
                      style={{ flex: 1 }}
                    >
                      ❌ Rechazar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'clases' && (
        <div className="card">
          <h3>📅 Mis Clases Programadas</h3>
          {clases.length === 0 ? (
            <div className="text-center">
              <p>No tienes clases programadas</p>
              <p>¡Acepta solicitudes de alumnos para comenzar!</p>
            </div>
          ) : (
            <div className="grid grid-2">
              {clases.map(clase => (
                <div key={clase.clase_id} style={{ 
                  border: '1px solid #eee', 
                  padding: '20px', 
                  borderRadius: '10px',
                  background: '#f9f9f9'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                    <div>
                      <strong style={{ fontSize: '1.2rem' }}>Alumno: {clase.alumno_nombre}</strong>
                      <p>📅 Fecha: {clase.fecha}</p>
                      <p>🕒 Hora: {clase.hora_inicio} - {clase.hora_fin}</p>
                    </div>
                    <span style={{ 
                      padding: '5px 15px',
                      borderRadius: '15px',
                      background: clase.estado === 'COMPLETADA' ? '#d4edda' : 
                                  clase.estado === 'CONFIRMADA' ? '#d1ecf1' : '#fff3cd',
                      color: clase.estado === 'COMPLETADA' ? '#155724' : 
                             clase.estado === 'CONFIRMADA' ? '#0c5460' : '#856404',
                      fontWeight: 'bold'
                    }}>
                      {clase.estado}
                    </span>
                  </div>
                  
                  {clase.estado === 'CONFIRMADA' && (
                    <button 
                      className="btn btn-primary"
                      style={{ width: '100%' }}
                      onClick={() => alert('Funcionalidad de unirse a clase próximamente')}
                    >
                      🎥 Iniciar Clase
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'alumnos' && (
        <div className="card">
          <h3>🎓 Mis Alumnos Conectados</h3>
          {conexiones.filter(c => c.estado === 'ACEPTADA').length === 0 ? (
            <div className="text-center">
              <p>No tienes alumnos conectados</p>
              <p>¡Acepta solicitudes para ver alumnos aquí!</p>
            </div>
          ) : (
            <div className="grid grid-2">
              {conexiones.filter(c => c.estado === 'ACEPTADA').map(conexion => {
                const alumno = alumnos.find(a => a.usuario_id === conexion.solicitante_id);
                return (
                  <div key={conexion.conexion_id} style={{ 
                    border: '1px solid #eee', 
                    padding: '20px', 
                    borderRadius: '10px',
                    background: '#f9f9f9'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                      <div style={{ 
                        width: '60px', 
                        height: '60px', 
                        borderRadius: '50%', 
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '1.5rem'
                      }}>
                        🎓
                      </div>
                      <div>
                        <strong style={{ fontSize: '1.2rem' }}>{conexion.solicitante_nombre}</strong>
                        <p>📧 {alumno?.email}</p>
                        <p>📚 Nivel: {alumno?.nivel_actual} → {alumno?.nivel_deseado}</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        onClick={() => crearClase(conexion.solicitante_id, conexion.solicitante_nombre)}
                        className="btn btn-primary"
                        style={{ flex: 1 }}
                      >
                        🗓️ Programar Clase
                      </button>
                      <button 
                        className="btn btn-secondary"
                        style={{ flex: 1 }}
                        onClick={() => alert('Funcionalidad de mensajería próximamente')}
                      >
                        💬 Enviar Mensaje
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'estadisticas' && (
        <div>
          <div className="grid grid-3 mb-20">
            <div className="card text-center">
              <h4>📊 Total Clases</h4>
              <p style={{ fontSize: '2rem', color: '#667eea' }}>{clases.length}</p>
            </div>
            <div className="card text-center">
              <h4>👥 Alumnos Activos</h4>
              <p style={{ fontSize: '2rem', color: '#28a745' }}>
                {conexiones.filter(c => c.estado === 'ACEPTADA').length}
              </p>
            </div>
            <div className="card text-center">
              <h4>⏰ Horas Dictadas</h4>
              <p style={{ fontSize: '2rem', color: '#ffc107' }}>
                {clases.filter(c => c.estado === 'COMPLETADA').length}
              </p>
            </div>
          </div>

          <div className="card">
            <h4>📈 Actividad Reciente</h4>
            <div style={{ padding: '20px' }}>
              <p>🔔 <strong>Solicitudes pendientes:</strong> {conexiones.filter(c => c.estado === 'PENDIENTE').length}</p>
              <p>📅 <strong>Clases esta semana:</strong> {clases.filter(c => {
                const fechaClase = new Date(c.fecha);
                const unaSemanaAtras = new Date();
                unaSemanaAtras.setDate(unaSemanaAtras.getDate() - 7);
                return fechaClase > unaSemanaAtras;
              }).length}</p>
              <p>✅ <strong>Clases completadas:</strong> {clases.filter(c => c.estado === 'COMPLETADA').length}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardProfesor;