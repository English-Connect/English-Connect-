import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';

const ClaseOnline = () => {
  const { claseId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [claseInfo, setClaseInfo] = useState(null);
  const messagesEndRef = useRef(null);

  const usuario = JSON.parse(localStorage.getItem('usuario'));

  useEffect(() => {
    // Simular datos de la clase
    setClaseInfo({
      clase_id: claseId,
      profesor_nombre: "Ana García",
      alumno_nombre: usuario.nombres,
      tema: "Conversación Básica - Saludos y Presentaciones"
    });

    // Mensajes de ejemplo
    setMessages([
      { id: 1, usuario: "Ana García", texto: "¡Hola! Bienvenido a la clase", timestamp: new Date(), tipo: "profesor" },
      { id: 2, usuario: "Sistema", texto: "Clase iniciada", timestamp: new Date(), tipo: "sistema" }
    ]);
  }, [claseId, usuario]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: messages.length + 1,
        usuario: usuario.nombres,
        texto: newMessage,
        timestamp: new Date(),
        tipo: "usuario"
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  if (!claseInfo) return <div className="container text-center">Cargando clase...</div>;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>💻 Clase en Línea</h1>
        <div>
          <strong>Tema:</strong> {claseInfo.tema}
        </div>
      </div>

      <div className="grid grid-2">
        {/* Video Container */}
        <div>
          <div className="video-container">
            <div style={{ 
              background: '#333', 
              height: '400px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'white',
              fontSize: '18px'
            }}>
              🎥 Video llamada integrada
              <br />
              <small>(En una implementación real usarías WebRTC)</small>
            </div>
          </div>

          {/* Controles de clase */}
          <div className="card">
            <h4>🛠️ Herramientas de Clase</h4>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button className="btn btn-primary">📁 Compartir Pantalla</button>
              <button className="btn btn-secondary">📄 Subir Material</button>
              <button className="btn btn-success">✅ Finalizar Clase</button>
              <button className="btn btn-secondary">🎤 Silenciar/Activar</button>
            </div>
          </div>

          {/* Pizarra colaborativa */}
          <div className="card">
            <h4>🖊️ Pizarra Compartida</h4>
            <div style={{ 
              border: '2px solid #ddd', 
              height: '200px', 
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#666'
            }}>
              Pizarra interactiva - Dibuja y escribe aquí
            </div>
          </div>
        </div>

        {/* Chat */}
        <div className="chat-container">
          <h4>💬 Chat de la Clase</h4>
          
          <div className="messages">
            {messages.map(message => (
              <div 
                key={message.id} 
                className={`message ${message.tipo === 'usuario' && message.usuario === usuario.nombres ? 'own' : ''}`}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <strong style={{ 
                    color: message.tipo === 'profesor' ? '#667eea' : 
                           message.tipo === 'sistema' ? '#28a745' : '#333'
                  }}>
                    {message.usuario}
                  </strong>
                  <small style={{ color: '#666' }}>
                    {message.timestamp.toLocaleTimeString()}
                  </small>
                </div>
                <div>{message.texto}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input">
            <input
              type="text"
              placeholder="Escribe tu mensaje..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              style={{ 
                flex: 1, 
                padding: '10px', 
                border: '1px solid #ddd', 
                borderRadius: '5px' 
              }}
            />
            <button 
              onClick={sendMessage}
              className="btn btn-primary"
              style={{ padding: '10px 20px' }}
            >
              Enviar
            </button>
          </div>
        </div>
      </div>

      {/* Recursos de la clase */}
      <div className="card mt-20">
        <h4>📚 Recursos de la Clase</h4>
        <div className="grid grid-3">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📄</div>
            <p>PDF - Saludos Básicos</p>
            <button className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: '12px' }}>
              Descargar
            </button>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🎵</div>
            <p>Audio - Pronunciación</p>
            <button className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: '12px' }}>
              Escuchar
            </button>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📝</div>
            <p>Ejercicios - Práctica</p>
            <button className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: '12px' }}>
              Abrir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClaseOnline;