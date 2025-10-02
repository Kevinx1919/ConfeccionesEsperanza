import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Emplado.css';

const API_URL = 'https://localhost:7232/api/User';

function EliminarEmpleado() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [empleado, setEmpleado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [eliminando, setEliminando] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${API_URL}/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('No se pudo cargar el empleado');
        return res.json();
      })
      .then(data => {
        setEmpleado(data);
        setLoading(false);
      })
      .catch(() => {
        setError('No se pudo cargar el empleado');
        setLoading(false);
      });
  }, [id]);

  const handleEliminar = async () => {
    if (!window.confirm('¿Está seguro de que desea eliminar este empleado?')) {
      return;
    }
    setEliminando(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Error al eliminar empleado');
      alert('Empleado eliminado con éxito');
      navigate('/listarEmpleados');
    } catch {
      setError('Ocurrió un error al eliminar el empleado.');
    } finally {
      setEliminando(false);
    }
  };

  const handleCancelar = () => {
    navigate('/listarEmpleados');
  };

  if (loading) {
    return (
      <div className="formulario-container">
        <p>Cargando empleado...</p>
      </div>
    );
  }

  if (error && !empleado) {
    return (
      <div className="formulario-container">
        <h2>Error</h2>
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={() => navigate('/listarEmpleados')} className="btn volver">
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="formulario-container">
      <div className="vista-contenido">
        <h2>Eliminar Empleado</h2>
        {error && (
          <div style={{
            color: 'red',
            backgroundColor: '#ffe6e6',
            padding: '10px',
            borderRadius: '5px',
            marginBottom: '15px',
            border: '1px solid red'
          }}>
            {error}
          </div>
        )}
        {empleado && (
          <div style={{
            backgroundColor: '#fff3cd',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #ffeaa7'
          }}>
            <h3 style={{ color: '#856404', marginBottom: '15px' }}>
              ¿Está seguro de que desea eliminar el siguiente empleado?
            </h3>
            <div style={{ lineHeight: '1.8' }}>
              <p><strong>Usuario:</strong> {empleado.userName}</p>
              <p><strong>Email:</strong> {empleado.email}</p>
              <p><strong>Teléfono:</strong> {empleado.phoneNumber || 'No especificado'}</p>
              <p><strong>Roles:</strong> {(empleado.roles || []).join(', ')}</p>
            </div>
            <div style={{
              backgroundColor: '#f8d7da',
              padding: '15px',
              borderRadius: '5px',
              marginTop: '15px',
              border: '1px solid #f5c6cb'
            }}>
              <p style={{ color: '#721c24', margin: 0, fontWeight: 'bold' }}>
                ⚠️ Esta acción no se puede deshacer
              </p>
            </div>
          </div>
        )}
        <div className="form-actions">
          <button
            onClick={handleEliminar}
            disabled={eliminando}
            style={{ backgroundColor: '#dc3545', color: 'white' }}
          >
            {eliminando ? 'Eliminando...' : 'Eliminar Empleado'}
          </button>
          <button
            onClick={handleCancelar}
            disabled={eliminando}
            style={{ backgroundColor: '#6c757d', color: 'white' }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export default EliminarEmpleado;