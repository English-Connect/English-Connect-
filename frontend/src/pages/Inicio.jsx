import React from 'react';
import { Link } from 'react-router-dom';

const Inicio = () => {
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  return (
    <div className="container">
      {/* Hero Section */}
      <section style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '100px 20px',
        textAlign: 'center',
        borderRadius: '15px',
        marginBottom: '50px'
      }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>
          🎓 English Connect
        </h1>
        <p style={{ fontSize: '1.5rem', marginBottom: '30px' }}>
          Conectando estudiantes y profesores de inglés alrededor del mundo
        </p>
        {usuario ? (
          <Link to="/dashboard" className="btn" style={{ 
            background: 'white', 
            color: '#667eea',
            fontSize: '1.2rem',
            padding: '15px 30px'
          }}>
            Ir a Mi Dashboard
          </Link>
        ) : (
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/registro" className="btn" style={{ 
              background: 'white', 
              color: '#667eea',
              fontSize: '1.2rem',
              padding: '15px 30px'
            }}>
              Comenzar Ahora
            </Link>
            <Link to="/login" className="btn" style={{ 
              background: 'transparent', 
              border: '2px solid white',
              color: 'white',
              fontSize: '1.2rem',
              padding: '15px 30px'
            }}>
              Iniciar Sesión
            </Link>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="grid grid-3" style={{ marginBottom: '50px' }}>
        <div className="card text-center">
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>👨‍🏫</div>
          <h3>Profesores Voluntarios</h3>
          <p>Conecta con profesores certificados que quieren ayudarte a aprender inglés</p>
        </div>
        
        <div className="card text-center">
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🕒</div>
          <h3>Horarios Flexibles</h3>
          <p>Estudia cuando quieras, desde cualquier lugar del mundo</p>
        </div>
        
        <div className="card text-center">
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>💯</div>
          <h3>Completamente Gratuito</h3>
          <p>Acceso ilimitado a clases y recursos sin costo alguno</p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center">
        <h2 style={{ marginBottom: '20px' }}>¿Listo para comenzar tu viaje en inglés?</h2>
        <p style={{ marginBottom: '30px', fontSize: '1.2rem' }}>
          Únete a nuestra comunidad de más de 10,000 estudiantes y profesores
        </p>
        {!usuario && (
          <Link to="/registro" className="btn btn-primary" style={{ fontSize: '1.2rem', padding: '15px 40px' }}>
            Registrarse Gratis
          </Link>
        )}
      </section>
    </div>
  );
};

export default Inicio;