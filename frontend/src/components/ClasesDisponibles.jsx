import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ClasesDisponibles = () => {
    const [clases, setClases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtros, setFiltros] = useState({
        nivel: '',
        fecha: ''
    });

    const usuario = JSON.parse(localStorage.getItem('usuario'));

    useEffect(() => {
        cargarClases();
    }, []);

    const cargarClases = async () => {
        setLoading(true);
        try {
            // Construir query params
            const params = new URLSearchParams();
            if (filtros.nivel) params.append('nivel', filtros.nivel);
            if (filtros.fecha) params.append('fecha', filtros.fecha);

            const response = await axios.get(`${API_URL}/api/clases/disponibles?${params.toString()}`);
            setClases(response.data);
        } catch (error) {
            console.error('Error cargando clases:', error);
            alert('Error al cargar clases disponibles');
        } finally {
            setLoading(false);
        }
    };

    const handleFiltroChange = (e) => {
        setFiltros({
            ...filtros,
            [e.target.name]: e.target.value
        });
    };

    const aplicarFiltros = () => {
        cargarClases();
    };

    const limpiarFiltros = () => {
        setFiltros({ nivel: '', fecha: '' });
        setTimeout(() => cargarClases(), 100);
    };

    const inscribirse = async (claseId, tituloClase) => {
        if (!confirm(`¿Deseas inscribirte en "${tituloClase}"?`)) {
            return;
        }

        try {
            await axios.post(`${API_URL}/api/clases/${claseId}/inscribirse`, {
                alumno_id: usuario.usuario_id
            });

            alert('✅ ¡Inscripción exitosa! Podrás ver esta clase en tu dashboard.');
            cargarClases(); // Recargar para actualizar cupos
        } catch (error) {
            const mensaje = error.response?.data?.error || 'Error al inscribirse';
            alert('❌ ' + mensaje);
        }
    };

    if (loading) {
        return (
            <div className="container text-center">
                <h2>⏳ Cargando clases disponibles...</h2>
            </div>
        );
    }

    return (
        <div className="container">
            <h1 style={{ marginBottom: '10px' }}>🎓 Clases Disponibles</h1>
            <p style={{ color: '#666', marginBottom: '30px' }}>
                Explora y únete a clases públicas impartidas por nuestros profesores
            </p>

            {/* Filtros */}
            <div className="card" style={{ marginBottom: '30px' }}>
                <h4>🔍 Filtrar Clases</h4>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'end', flexWrap: 'wrap' }}>
                    <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
                        <label className="form-label">Nivel</label>
                        <select
                            name="nivel"
                            value={filtros.nivel}
                            onChange={handleFiltroChange}
                            className="form-select"
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

                    <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
                        <label className="form-label">Fecha</label>
                        <input
                            type="date"
                            name="fecha"
                            value={filtros.fecha}
                            onChange={handleFiltroChange}
                            className="form-input"
                            min={new Date().toISOString().split('T')[0]}
                        />
                    </div>

                    <button onClick={aplicarFiltros} className="btn btn-primary">
                        🔍 Buscar
                    </button>
                    <button onClick={limpiarFiltros} className="btn btn-secondary">
                        🔄 Limpiar
                    </button>
                </div>
            </div>

            {/* Resultados */}
            {clases.length === 0 ? (
                <div className="card text-center">
                    <h3>😔 No hay clases disponibles</h3>
                    <p>No se encontraron clases que coincidan con tus filtros.</p>
                    <p>Prueba cambiando los filtros o vuelve más tarde.</p>
                </div>
            ) : (
                <>
                    <div style={{ marginBottom: '15px', color: '#666' }}>
                        📊 Se encontraron <strong>{clases.length}</strong> clases disponibles
                    </div>

                    <div className="grid grid-2">
                        {clases.map(clase => (
                            <div
                                key={clase.clase_id}
                                className="card"
                                style={{
                                    border: '2px solid #f0f0f0',
                                    transition: 'all 0.3s',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.border = '2px solid #667eea';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.15)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.border = '2px solid #f0f0f0';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                {/* Header con nivel */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ margin: 0, color: '#667eea' }}>{clase.titulo}</h3>
                                    </div>
                                    <span style={{
                                        padding: '5px 12px',
                                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                        color: 'white',
                                        borderRadius: '15px',
                                        fontSize: '0.85rem',
                                        fontWeight: 'bold'
                                    }}>
                                        {clase.nivel_requerido}
                                    </span>
                                </div>

                                {/* Descripción */}
                                {clase.descripcion && (
                                    <p style={{ color: '#666', marginBottom: '15px', fontSize: '0.95rem' }}>
                                        {clase.descripcion}
                                    </p>
                                )}

                                {/* Información del profesor */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '10px',
                                    background: '#f9f9f9',
                                    borderRadius: '8px',
                                    marginBottom: '15px'
                                }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #f093fb, #f5576c)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontWeight: 'bold'
                                    }}>
                                        👨‍🏫
                                    </div>
                                    <div>
                                        <strong>{clase.profesor_nombre} {clase.profesor_apellido}</strong>
                                        <div style={{ fontSize: '0.85rem', color: '#666' }}>
                                            Nivel {clase.profesor_nivel}
                                        </div>
                                    </div>
                                </div>

                                {/* Detalles de la clase */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', color: '#999' }}>📅 Fecha</div>
                                        <strong>{new Date(clase.fecha).toLocaleDateString('es-ES', {
                                            weekday: 'short',
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}</strong>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', color: '#999' }}>🕒 Horario</div>
                                        <strong>{clase.hora_inicio.substring(0, 5)} - {clase.hora_fin.substring(0, 5)}</strong>
                                    </div>
                                </div>

                                {/* Cupos disponibles */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '10px',
                                    background: clase.cupos_disponibles > 0 ? '#d4edda' : '#f8d7da',
                                    borderRadius: '5px',
                                    marginBottom: '15px'
                                }}>
                                    <span style={{ fontSize: '0.9rem' }}>
                                        👥 <strong>{clase.cupos_disponibles}</strong> de <strong>{clase.cupo_maximo}</strong> cupos disponibles
                                    </span>
                                    {clase.cupos_disponibles === 0 && (
                                        <span style={{ color: '#721c24', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                            LLENO
                                        </span>
                                    )}
                                </div>

                                {/* Botón de inscripción */}
                                <button
                                    onClick={() => inscribirse(clase.clase_id, clase.titulo)}
                                    className="btn btn-primary"
                                    disabled={clase.cupos_disponibles === 0}
                                    style={{
                                        width: '100%',
                                        opacity: clase.cupos_disponibles === 0 ? 0.5 : 1,
                                        cursor: clase.cupos_disponibles === 0 ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {clase.cupos_disponibles === 0 ? '❌ Clase Llena' : '✅ Inscribirse'}
                                </button>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default ClasesDisponibles;
