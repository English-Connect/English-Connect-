import React, { useState } from 'react';
import { claseService } from '../services/api';

const PublicarClase = ({ onClasePublicada }) => {
    const usuario = JSON.parse(localStorage.getItem('usuario'));

    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        nivel_requerido: 'A1',
        fecha: '',
        hora_inicio: '',
        duracion: '60',
        cupo_maximo: '5'
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const calcularHoraFin = (horaInicio, duracion) => {
        const [horas, minutos] = horaInicio.split(':').map(Number);
        const totalMinutos = horas * 60 + minutos + parseInt(duracion);
        const nuevasHoras = Math.floor(totalMinutos / 60);
        const nuevosMinutos = totalMinutos % 60;
        return `${nuevasHoras.toString().padStart(2, '0')}:${nuevosMinutos.toString().padStart(2, '0')}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validaciones
        if (!formData.titulo || !formData.fecha || !formData.hora_inicio) {
            alert('❌ Por favor completa todos los campos requeridos');
            return;
        }

        const horaFin = calcularHoraFin(formData.hora_inicio, formData.duracion);

        setLoading(true);
        try {
            await claseService.crear({
                profesor_id: usuario.usuario_id,
                tipo: 'PUBLICA',
                titulo: formData.titulo,
                descripcion: formData.descripcion || null,
                nivel_requerido: formData.nivel_requerido,
                fecha: formData.fecha,
                hora_inicio: formData.hora_inicio + ':00',
                hora_fin: horaFin + ':00',
                cupo_maximo: parseInt(formData.cupo_maximo)
            });

            alert('✅ ¡Clase publicada exitosamente!');

            // Limpiar formulario
            setFormData({
                titulo: '',
                descripcion: '',
                nivel_requerido: 'A1',
                fecha: '',
                hora_inicio: '',
                duracion: '60',
                cupo_maximo: '5'
            });

            // Callback para actualizar la lista padre
            if (onClasePublicada) onClasePublicada();

        } catch (error) {
            alert('❌ Error: ' + (error.response?.data?.error || 'Error al publicar clase'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card">
            <h3>📢 Publicar Nueva Clase</h3>
            <p style={{ color: '#666', marginBottom: '20px' }}>
                Crea una clase pública para que los alumnos puedan inscribirse
            </p>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-2">
                    {/* Título */}
                    <div className="form-group">
                        <label className="form-label">Título de la Clase *</label>
                        <input
                            type="text"
                            name="titulo"
                            value={formData.titulo}
                            onChange={handleChange}
                            placeholder="ej: Conversación Básica A1"
                            className="form-input"
                            required
                            maxLength="200"
                        />
                    </div>

                    {/* Nivel Requerido */}
                    <div className="form-group">
                        <label className="form-label">Nivel Requerido *</label>
                        <select
                            name="nivel_requerido"
                            value={formData.nivel_requerido}
                            onChange={handleChange}
                            className="form-select"
                            required
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

                {/* Descripción */}
                <div className="form-group">
                    <label className="form-label">Descripción</label>
                    <textarea
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={handleChange}
                        placeholder="Describe los temas que cubrirás en esta clase..."
                        className="form-input"
                        rows="3"
                        style={{ width: '100%', resize: 'vertical' }}
                    />
                </div>

                <div className="grid grid-3">
                    {/* Fecha */}
                    <div className="form-group">
                        <label className="form-label">Fecha *</label>
                        <input
                            type="date"
                            name="fecha"
                            value={formData.fecha}
                            onChange={handleChange}
                            className="form-input"
                            min={new Date().toISOString().split('T')[0]}
                            required
                        />
                    </div>

                    {/* Hora Inicio */}
                    <div className="form-group">
                        <label className="form-label">Hora de Inicio *</label>
                        <input
                            type="time"
                            name="hora_inicio"
                            value={formData.hora_inicio}
                            onChange={handleChange}
                            className="form-input"
                            required
                        />
                    </div>

                    {/* Duración */}
                    <div className="form-group">
                        <label className="form-label">Duración (min) *</label>
                        <select
                            name="duracion"
                            value={formData.duracion}
                            onChange={handleChange}
                            className="form-select"
                            required
                        >
                            <option value="30">30 minutos</option>
                            <option value="45">45 minutos</option>
                            <option value="60">1 hora</option>
                            <option value="90">1.5 horas</option>
                            <option value="120">2 horas</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-2">
                    {/* Cupo Máximo */}
                    <div className="form-group">
                        <label className="form-label">Cupo Máximo *</label>
                        <input
                            type="number"
                            name="cupo_maximo"
                            value={formData.cupo_maximo}
                            onChange={handleChange}
                            className="form-input"
                            min="1"
                            max="50"
                            required
                        />
                        <small style={{ color: '#666' }}>Número máximo de alumnos</small>
                    </div>

                    {/* Preview Hora Fin */}
                    <div className="form-group">
                        <label className="form-label">Hora de Finalización</label>
                        <div style={{
                            padding: '10px',
                            background: '#f0f0f0',
                            borderRadius: '5px',
                            marginTop: '5px'
                        }}>
                            {formData.hora_inicio ? (
                                <strong>{calcularHoraFin(formData.hora_inicio, formData.duracion)}</strong>
                            ) : (
                                <span style={{ color: '#999' }}>Selecciona hora de inicio</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Preview de la clase */}
                {formData.titulo && (
                    <div style={{
                        marginTop: '20px',
                        padding: '15px',
                        background: '#f9f9f9',
                        borderRadius: '10px',
                        border: '2px dashed #667eea'
                    }}>
                        <h4 style={{ marginBottom: '10px' }}>👁️ Vista Previa</h4>
                        <div style={{ display: 'flex', alignItems: 'start', gap: '15px' }}>
                            <div style={{ flex: 1 }}>
                                <strong style={{ fontSize: '1.1rem', color: '#667eea' }}>{formData.titulo}</strong>
                                <p style={{ margin: '5px 0', color: '#666' }}>{formData.descripcion || 'Sin descripción'}</p>
                                <div style={{ display: 'flex', gap: '15px', marginTop: '10px', fontSize: '0.9rem' }}>
                                    <span>📚 Nivel: {formData.nivel_requerido}</span>
                                    <span>📅 {formData.fecha || 'Fecha pendiente'}</span>
                                    <span>🕒 {formData.hora_inicio || '--:--'}</span>
                                    <span>👥 Cupos: {formData.cupo_maximo}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Botones */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{ flex: 1 }}
                    >
                        {loading ? '⏳ Publicando...' : '📢 Publicar Clase'}
                    </button>
                    <button
                        type="button"
                        onClick={() => setFormData({
                            titulo: '', descripcion: '', nivel_requerido: 'A1',
                            fecha: '', hora_inicio: '', duracion: '60', cupo_maximo: '5'
                        })}
                        className="btn btn-secondary"
                    >
                        🔄 Limpiar
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PublicarClase;
