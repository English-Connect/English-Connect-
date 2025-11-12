import React, { useState } from 'react';
import { usuarioService } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Registro = () => {
  const [formData, setFormData] = useState({
    nombres: '',
    apellido_paterno: '',
    apellido_materno: '',
    email: '',
    contraseña: '',
    nivel_actual: 'A1',
    nivel_deseado: 'A2',
    rol: 'ALUMNO',
    edad: '',
    phone_number: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const datosEnviar = {
      ...formData,
      edad: formData.edad !== '' ? parseInt(formData.edad) : null,
      apellido_materno: formData.apellido_materno || null,
      phone_number: formData.phone_number || null
    };

    try {
      const response = await usuarioService.registrar(datosEnviar);
      alert('✅ Usuario registrado exitosamente!');
      
      // Auto login después del registro
      const loginResponse = await usuarioService.login({
        email: formData.email,
        contraseña: formData.contraseña
      });
      
      localStorage.setItem('usuario', JSON.stringify(loginResponse.data.usuario));
      localStorage.setItem('token', 'mock-token'); // En producción usarías el token real
      
      navigate('/dashboard');
    } catch (error) {
      alert('❌ Error al registrar: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="container">
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2 className="text-center mb-20">🎓 Registro en English Connect</h2>
        
        <form onSubmit={handleSubmit} className="card">
          <fieldset style={{ border: 'none', marginBottom: '20px' }}>
            <legend style={{ fontWeight: 'bold', color: '#555', marginBottom: '15px' }}>📋 Información Personal</legend>
            
            <div className="form-group">
              <label className="form-label">Nombres *</label>
              <input
                type="text"
                name="nombres"
                placeholder="Ej: María Elena"
                value={formData.nombres}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Apellido Paterno *</label>
                <input
                  type="text"
                  name="apellido_paterno"
                  placeholder="Ej: García"
                  value={formData.apellido_paterno}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>
              
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Apellido Materno</label>
                <input
                  type="text"
                  name="apellido_materno"
                  placeholder="Ej: López"
                  value={formData.apellido_materno}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Edad</label>
                <input
                  type="number"
                  name="edad"
                  placeholder="Ej: 25"
                  value={formData.edad}
                  onChange={handleChange}
                  min="1"
                  max="120"
                  className="form-input"
                />
              </div>
              
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Teléfono</label>
                <input
                  type="text"
                  name="phone_number"
                  placeholder="Ej: 555-123-4567"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>
          </fieldset>

          <fieldset style={{ border: 'none', marginBottom: '20px' }}>
            <legend style={{ fontWeight: 'bold', color: '#555', marginBottom: '15px' }}>🔐 Credenciales</legend>
            
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input
                type="email"
                name="email"
                placeholder="Ej: usuario@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contraseña *</label>
              <input
                type="password"
                name="contraseña"
                placeholder="Mínimo 6 caracteres"
                value={formData.contraseña}
                onChange={handleChange}
                required
                minLength="6"
                className="form-input"
              />
            </div>
          </fieldset>

          <fieldset style={{ border: 'none', marginBottom: '20px' }}>
            <legend style={{ fontWeight: 'bold', color: '#555', marginBottom: '15px' }}>📚 Niveles de Inglés</legend>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Nivel Actual *</label>
                <select 
                  name="nivel_actual" 
                  value={formData.nivel_actual} 
                  onChange={handleChange}
                  className="form-select"
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
                <label className="form-label">Nivel Deseado *</label>
                <select 
                  name="nivel_deseado" 
                  value={formData.nivel_deseado} 
                  onChange={handleChange}
                  className="form-select"
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
              <label className="form-label">Rol en la Plataforma *</label>
              <select 
                name="rol" 
                value={formData.rol} 
                onChange={handleChange}
                className="form-select"
              >
                <option value="ALUMNO">🎓 Alumno - Quiero aprender inglés</option>
                <option value="PROFESOR">👨‍🏫 Profesor - Quiero enseñar inglés</option>
                <option value="AMBOS">🔁 Ambos - Quiero aprender y enseñar</option>
              </select>
            </div>
          </fieldset>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            🚀 Registrarse en English Connect
          </button>

          <p className="text-center mt-20">
            ¿Ya tienes cuenta? <a href="/login" style={{ color: '#667eea' }}>Inicia sesión aquí</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Registro;