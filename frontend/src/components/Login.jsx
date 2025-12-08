import React, { useState } from 'react';
import { usuarioService } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    contrasena: ''
  });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await usuarioService.login(formData);

      localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
      localStorage.setItem('token', 'mock-token');

      alert('✅ ¡Bienvenido de vuelta!');
      navigate('/dashboard');
    } catch (error) {
      alert('❌ Error: ' + (error.response?.data?.error || 'Credenciales incorrectas'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div style={{ maxWidth: '400px', margin: '0 auto' }}>
        <h2 className="text-center mb-20">🔐 Iniciar Sesión</h2>

        <form onSubmit={handleSubmit} className="card">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              name="contrasena"
              placeholder="Tu contraseña"
              value={formData.contrasena}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? '⏳ Iniciando sesión...' : '🚀 Iniciar Sesión'}
          </button>

          <p className="text-center mt-20">
            ¿No tienes cuenta? <Link to="/registro" style={{ color: '#667eea' }}>Regístrate aquí</Link>
          </p>
        </form>

        {/* Demo Accounts */}
        <div className="card mt-20">
          <h4 className="text-center mb-15">Cuentas de Demo</h4>
          <div style={{ fontSize: '14px', color: '#666' }}>
            <p><strong>Alumno:</strong> carlos@email.com / 123456</p>
            <p><strong>Profesor:</strong> ana@email.com / 123456</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;