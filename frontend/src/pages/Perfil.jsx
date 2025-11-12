import React, { useState, useEffect } from 'react';
import { disponibilidadService } from '../services/api';

const Perfil = () => {
  const [usuario, setUsuario] = useState(null);
  const [disponibilidad, setDisponibilidad] = useState([]);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('usuario'));
    setUsuario(userData);
    cargarDisponibilidad(userData.usuario_id);
  }, []);

  const cargarDisponibilidad = async (usuarioId) => {
    try {
      const response = await disponibilidadService.obtenerPorUsuario(usuarioId);
      setDisponibilidad(response.data);
    } catch (error) {
      console.error('Error cargando disponibilidad:', error);
    }
  };

  const agregarDisponibilidad = async () => {
    const dia = prompt('Día (Lunes-Domingo):');
    const horaInicio = prompt('Hora inicio (HH:MM):');
    const horaFin = prompt('Hora fin (HH:MM):');

    if (dia && horaInicio && horaFin) {
      try {
        await disponibilidadService.crear({
          usuario_id: usuario.usuario_id,
          dia: dia,
          hora_inicio: horaInicio,
          hora_fin: horaFin
        });
        alert('✅ Disponibilidad agregada');
        cargarDisponibilidad(usuario.usuario_id);
      } catch (error) {
        alert('❌ Error: ' + error.response?.data?.error);
      }
    }
  };

  if (!usuario) return <div className="container text-center">Cargando...</div>;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>👤 Mi Perfil</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setEditMode(!editMode)}
        >
          {editMode ? '💾 Guardar' : '✏️ Editar Perfil'}
        </button>
      </div>

      <div className="grid grid-2">
        {/* Información Personal */}
        <div className="card">
          <h3>📋 Información Personal</h3>
          <div className="form-group">
            <label className="form-label">Nombres</label>
            <input
              type="text"
              value={usuario.nombres}
              readOnly={!editMode}
              className="form-input"
              onChange={(e) => setUsuario({...usuario, nombres: e.target.value})}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Apellido Paterno</label>
              <input
                type="text"
                value={usuario.apellido_paterno}
                readOnly={!editMode}
                className="form-input"
                onChange={(e) => setUsuario({...usuario, apellido_paterno: e.target.value})}
              />
            </div>
            
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Apellido Materno</label>
              <input
                type="text"
                value={usuario.apellido_materno || ''}
                readOnly={!editMode}
                className="form-input"
                onChange={(e) => setUsuario({...usuario, apellido_materno: e.target.value})}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Email</label>
              <input
                type="email"
                value={usuario.email}
                readOnly={!editMode}
                className="form-input"
                onChange={(e) => setUsuario({...usuario, email: e.target.value})}
              />
            </div>
            
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Teléfono</label>
              <input
                type="text"
                value={usuario.phone_number || ''}
                readOnly={!editMode}
                className="form-input"
                onChange={(e) => setUsuario({...usuario, phone_number: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Información Académica */}
        <div className="card">
          <h3>📚 Información Académica</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Nivel Actual</label>
              <select 
                value={usuario.nivel_actual} 
                disabled={!editMode}
                className="form-select"
                onChange={(e) => setUsuario({...usuario, nivel_actual: e.target.value})}
              >
                <option value="A1">A1 - Principiante</option>
                <option value="A2">A2 - Básico</option>
                <option value="B1">B1 - Intermedio</option>
                <option value="B2">B2 - Intermedio Alto</option>
                <option value="C1">C1 - Avanzado</option>
                <option value="C2">C2 - Maestría</option>
              </select>
            </div>
            
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Nivel Deseado</label>
              <select 
                value={usuario.nivel_deseado} 
                disabled={!editMode}
                className="form-select"
                onChange={(e) => setUsuario({...usuario, nivel_deseado: e.target.value})}
              >
                <option value="A1">A1 - Principiante</option>
                <option value="A2">A2 - Básico</option>
                <option value="B1">B1 - Intermedio</option>
                <option value="B2">B2 - Intermedio Alto</option>
                <option value="C1">C1 - Avanzado</option>
                <option value="C2">C2 - Maestría</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Rol</label>
            <select 
              value={usuario.rol} 
              disabled={!editMode}
              className="form-select"
              onChange={(e) => setUsuario({...usuario, rol: e.target.value})}
            >
              <option value="ALUMNO">Alumno</option>
              <option value="PROFESOR">Profesor</option>
              <option value="AMBOS">Ambos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Disponibilidad */}
      <div className="card mt-20">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3>🕒 Mi Disponibilidad</h3>
          <button 
            onClick={agregarDisponibilidad}
            className="btn btn-success"
          >
            + Agregar Horario
          </button>
        </div>

        {disponibilidad.length === 0 ? (
          <p>No has agregado horarios de disponibilidad</p>
        ) : (
          <div className="grid grid-3">
            {disponibilidad.map(disp => (
              <div key={disp.disponibilidad_id} style={{ 
                border: '1px solid #eee', 
                padding: '15px', 
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <strong style={{ fontSize: '1.2rem' }}>{disp.dia}</strong>
                <p>{disp.hora_inicio} - {disp.hora_fin}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Estadísticas */}
      <div className="grid grid-3 mt-20">
        <div className="card text-center">
          <h4>📅 Clases Totales</h4>
          <p style={{ fontSize: '2rem', color: '#667eea' }}>12</p>
        </div>
        <div className="card text-center">
          <h4>⭐ Calificación</h4>
          <p style={{ fontSize: '2rem', color: '#ffc107' }}>4.8/5</p>
        </div>
        <div className="card text-center">
          <h4>📈 Progreso</h4>
          <p style={{ fontSize: '2rem', color: '#28a745' }}>65%</p>
        </div>
      </div>
    </div>
  );
};

export default Perfil;