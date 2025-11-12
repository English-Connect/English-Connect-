import React, { useState, useEffect } from 'react';
import { claseService, conexionService } from '../services/api';
import { Link } from 'react-router-dom';

const DashboardAlumno = () => {
  const [clases, setClases] = useState([]);
  const [conexiones, setConexiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('clases');

  const usuario = JSON.parse(localStorage.getItem('usuario'));

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [clasesRes, conexionesRes] = await Promise.all([
        claseService.obtenerPorUsuario(usuario.usuario_id),
        conexionService.obtenerPorUsuario(usuario.usuario_id)
      ]);
      
      setClases(clasesRes.data);
      setConexiones(conexionesRes.data);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container text-center">Cargando...</div>;

  return (
    <div className="container">
      <h1 className="mb-20">🎓 Dashboard - Alumno</h1>
      
      {/* Navegación por pestañas */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '2px solid #eee' }}>
        <button 
          className={`btn ${activeTab === 'clases' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('clases')}
          style={{ borderRadius: '20px' }}
        >
          📅 Mis Clases
        </button>
        <button 
          className={`btn ${activeTab === 'conexiones' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('conexiones')}
          style={{ borderRadius: '20px' }}
        >
          👥 Mis Conexiones
        </button>
        <button 
          className={`btn ${activeTab === 'profesores' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('profesores')}
          style={{ borderRadius: '20px' }}
        >
          👨‍🏫 Buscar Profesores
        </button>
        <button 
          className={`btn ${activeTab === 'progreso' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('progreso')}
          style={{ borderRadius: '20px' }}
        >
          📊 Mi Progreso
        </button>
      </div>

      {/* Contenido de pestañas */}
      {activeTab === 'clases' && (
        <div className="card">
          <h3>📅 Mis Clases Programadas</h3>
          {clases.length === 0 ? (
            <div className="text-center">
              <p>No tienes clases programadas</p>
              <p>¡Conecta con profesores para comenzar!</p>
              <button 
                className="btn btn-primary mt-20"
                onClick={() => setActiveTab('profesores')}
              >
                👨‍🏫 Buscar Profesores
              </button>
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
                      <strong style={{ fontSize: '1.2rem' }}>Profesor: {clase.profesor_nombre}</strong>
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
                    <Link 
                      to={`/clase/${clase.clase_id}`}
                      className="btn btn-primary"
                      style={{ width: '100%' }}
                    >
                      🎥 Unirse a Clase
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'conexiones' && (
        <div className="card">
          <h3>👥 Mis Conexiones con Profesores</h3>
          {conexiones.length === 0 ? (
            <div className="text-center">
              <p>No tienes conexiones activas</p>
              <button 
                className="btn btn-primary mt-20"
                onClick={() => setActiveTab('profesores')}
              >
                👨‍🏫 Buscar Profesores
              </button>
            </div>
          ) : (
            <div className="grid grid-2">
              {conexiones.map(conexion => (
                <div key={conexion.conexion_id} style={{ 
                  border: '1px solid #eee', 
                  padding: '20px', 
                  borderRadius: '10px',
                  background: '#f9f9f9'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                    <div>
                      <strong style={{ fontSize: '1.2rem' }}>
                        {conexion.solicitante_id === usuario.usuario_id ? 
                         `Profesor: ${conexion.receptor_nombre}` : 
                         `Alumno: ${conexion.solicitante_nombre}`}
                      </strong>
                      <p>📚 Nivel solicitado: {conexion.nivel_solicitado}</p>
                      <p>📅 Fecha solicitud: {new Date(conexion.fecha).toLocaleDateString()}</p>
                    </div>
                    <span style={{ 
                      padding: '5px 15px',
                      borderRadius: '15px',
                      background: conexion.estado === 'ACEPTADA' ? '#d4edda' : 
                                  conexion.estado === 'PENDIENTE' ? '#fff3cd' : '#f8d7da',
                      color: conexion.estado === 'ACEPTADA' ? '#155724' : 
                             conexion.estado === 'PENDIENTE' ? '#856404' : '#721c24',
                      fontWeight: 'bold'
                    }}>
                      {conexion.estado}
                    </span>
                  </div>
                  
                  {conexion.estado === 'ACEPTADA' && (
                    <button 
                      className="btn btn-success"
                      style={{ width: '100%' }}
                      onClick={() => alert('Funcionalidad de programar clase próximamente')}
                    >
                      🗓️ Programar Nueva Clase
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'profesores' && (
        <div>
          <div className="card mb-20">
            <h3 className="text-center">👨‍🏫 Encuentra tu Profesor Ideal</h3>
            <p className="text-center">
              Conecta con profesores voluntarios que te ayudarán a mejorar tu inglés
            </p>
          </div>
          
          {/* Aquí integraríamos el componente ListaProfesores */}
          <div style={{ border: '2px dashed #667eea', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
            <h4>🚀 Funcionalidad de Búsqueda de Profesores</h4>
            <p>Esta funcionalidad está disponible en una sección separada</p>
            <Link to="/profesores" className="btn btn-primary">
              🔍 Ver Todos los Profesores
            </Link>
          </div>
        </div>
      )}

      {activeTab === 'progreso' && (
        <div className="card">
          <h3>📊 Mi Progreso de Aprendizaje</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '40px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: '20px' }}>
                <p><strong>🎯 Nivel Actual:</strong> 
                  <span style={{ 
                    color: '#667eea', 
                    fontWeight: 'bold', 
                    fontSize: '1.2rem',
                    marginLeft: '10px'
                  }}>
                    {usuario.nivel_actual}
                  </span>
                </p>
                <p><strong>🎯 Nivel Objetivo:</strong> 
                  <span style={{ 
                    color: '#28a745', 
                    fontWeight: 'bold', 
                    fontSize: '1.2rem',
                    marginLeft: '10px'
                  }}>
                    {usuario.nivel_deseado}
                  </span>
                </p>
              </div>
              
              <div>
                <p><strong>📅 Clases Completadas:</strong> 
                  <span style={{ marginLeft: '10px', fontWeight: 'bold' }}>
                    {clases.filter(c => c.estado === 'COMPLETADA').length}
                  </span>
                </p>
                <p><strong>👥 Profesores Conectados:</strong> 
                  <span style={{ marginLeft: '10px', fontWeight: 'bold' }}>
                    {conexiones.filter(c => c.estado === 'ACEPTADA').length}
                  </span>
                </p>
              </div>
            </div>
            
            <div style={{ 
              width: '150px', 
              height: '150px', 
              borderRadius: '50%', 
              background: 'conic-gradient(#667eea 0% 65%, #eee 65% 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1.5rem',
              position: 'relative'
            }}>
              <div style={{ 
                background: 'white', 
                width: '120px', 
                height: '120px', 
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#667eea'
              }}>
                65%
              </div>
            </div>
          </div>
          
          <div style={{ marginTop: '30px' }}>
            <h4>🏆 Próximos Objetivos</h4>
            <div className="grid grid-3">
              <div style={{ textAlign: 'center', padding: '15px' }}>
                <div style={{ fontSize: '2rem' }}>🎯</div>
                <p>Completar 10 clases</p>
                <div style={{ 
                  background: '#eee', 
                  height: '10px', 
                  borderRadius: '5px',
                  marginTop: '10px'
                }}>
                  <div style={{ 
                    background: '#667eea', 
                    height: '100%', 
                    borderRadius: '5px',
                    width: '40%'
                  }}></div>
                </div>
                <small>4/10 completadas</small>
              </div>
              
              <div style={{ textAlign: 'center', padding: '15px' }}>
                <div style={{ fontSize: '2rem' }}>💬</div>
                <p>Practicar conversación</p>
                <div style={{ 
                  background: '#eee', 
                  height: '10px', 
                  borderRadius: '5px',
                  marginTop: '10px'
                }}>
                  <div style={{ 
                    background: '#28a745', 
                    height: '100%', 
                    borderRadius: '5px',
                    width: '60%'
                  }}></div>
                </div>
                <small>En progreso</small>
              </div>
              
              <div style={{ textAlign: 'center', padding: '15px' }}>
                <div style={{ fontSize: '2rem' }}>📚</div>
                <p>Avanzar al siguiente nivel</p>
                <div style={{ 
                  background: '#eee', 
                  height: '10px', 
                  borderRadius: '5px',
                  marginTop: '10px'
                }}>
                  <div style={{ 
                    background: '#ffc107', 
                    height: '100%', 
                    borderRadius: '5px',
                    width: '25%'
                  }}></div>
                </div>
                <small>25% completado</small>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardAlumno;