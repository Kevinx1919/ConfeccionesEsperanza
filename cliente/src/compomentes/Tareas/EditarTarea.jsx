import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Tareas.css';

const API_URL = 'https://localhost:7232/api/Task';

const initialState = {
  nombreTarea: '',
  descripcion: '',
  comentarios: ''
};

function EditarTarea() {
  const { id } = useParams();
  const [tarea, setTarea] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTarea = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error('No se pudo obtener la tarea');
        const data = await res.json();
        setTarea({
          nombreTarea: data.nombreTarea || '',
          descripcion: data.descripcion || '',
          comentarios: data.comentarios || ''
        });
      } catch (err) {
        setError('Error al cargar la tarea');
      } finally {
        setLoading(false);
      }
    };
    fetchTarea();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTarea(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const validate = () => {
    if (!tarea.nombreTarea || !tarea.descripcion) {
      setError('El nombre y la descripción son obligatorios.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(tarea)
      });
      if (!res.ok) throw new Error('Error al actualizar la tarea');
      setSuccess('Tarea actualizada correctamente');
      setTimeout(() => navigate('/consultarTareas'), 1200);
    } catch (err) {
      setError('No se pudo actualizar la tarea');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="formulario-container">
      <div className="vista-contenido">
        <h2>Editar Tarea</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '18px' }}>
            <label>Nombre de la tarea *</label>
            <input
              type="text"
              name="nombreTarea"
              value={tarea.nombreTarea}
              onChange={handleChange}
              required
              maxLength={100}
            />
          </div>
          <div style={{ marginBottom: '18px' }}>
            <label>Descripción *</label>
            <textarea
              name="descripcion"
              value={tarea.descripcion}
              onChange={handleChange}
              required
              maxLength={300}
              rows={3}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '1rem',
                background: '#fff',
                color: '#222',
                resize: 'vertical',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <div style={{ marginBottom: '18px' }}>
            <label>Comentarios</label>
            <textarea
              name="comentarios"
              value={tarea.comentarios}
              onChange={handleChange}
              maxLength={300}
              rows={2}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '1rem',
                background: '#fff',
                color: '#222',
                resize: 'vertical',
                boxSizing: 'border-box'
              }}
            />
          </div>
          {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
          {success && <div style={{ color: 'green', marginBottom: 10 }}>{success}</div>}
          <div className="form-actions">
            <button type="submit" style={{ background: '#2a9d2f', color: '#fff' }} disabled={loading}>
              {loading ? 'Guardando...' : 'Actualizar'}
            </button>
            <button type="button" className="volver" onClick={() => navigate('/consultarTareas')} disabled={loading}>
              Volver
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditarTarea;
