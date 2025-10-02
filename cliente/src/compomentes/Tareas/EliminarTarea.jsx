import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Tareas.css';

const API_URL = 'https://localhost:7232/api/Task';

function EliminarTarea() {
  const { id } = useParams();
  const [tarea, setTarea] = useState(null);
  const [loading, setLoading] = useState(true);
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
        setTarea(data);
      } catch (err) {
        setError('Error al cargar la tarea');
      } finally {
        setLoading(false);
      }
    };
    fetchTarea();
  }, [id]);

  const handleDelete = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Error al eliminar la tarea');
      setSuccess('Tarea eliminada correctamente');
      setTimeout(() => navigate('/consultarTareas'), 1200);
    } catch (err) {
      setError('No se pudo eliminar la tarea');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="formulario-container">
      <div className="vista-contenido">
        <h2>Eliminar Tarea</h2>
        {loading ? (
          <h3>Cargando...</h3>
        ) : error ? (
          <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>
        ) : tarea ? (
          <>
            <p>¿Estás seguro que deseas eliminar la siguiente tarea?</p>
            <ul style={{ marginBottom: 20 }}>
              <li><b>ID:</b> {tarea.idTarea}</li>
              <li><b>Nombre:</b> {tarea.nombreTarea}</li>
              <li><b>Descripción:</b> {tarea.descripcion}</li>
            </ul>
            {success && <div style={{ color: 'green', marginBottom: 10 }}>{success}</div>}
            <div className="form-actions">
              <button onClick={handleDelete} style={{ background: '#d32f2f', color: '#fff' }} disabled={loading}>
                Eliminar
              </button>
              <button type="button" className="volver" onClick={() => navigate('/consultarTareas')} disabled={loading}>
                Cancelar
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default EliminarTarea;
