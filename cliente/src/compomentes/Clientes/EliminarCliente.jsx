import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Cliente.css';

const API_URL = 'https://localhost:7232/api/Customer';

function EliminarCliente() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState(null);
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
        if (!res.ok) throw new Error('No se pudo cargar el cliente');
        return res.json();
      })
      .then(data => {
        setCliente(data);
        setLoading(false);
      })
      .catch(() => {
        setError('No se pudo cargar el cliente');
        setLoading(false);
      });
  }, [id]);

  const handleEliminar = async () => {
    if (!window.confirm('¿Está seguro de que desea eliminar este cliente?')) {
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
      if (!res.ok) throw new Error('Error al eliminar cliente');
      alert('Cliente eliminado con éxito');
      navigate('/clientes');
    } catch {
      setError('Ocurrió un error al eliminar el cliente.');
    } finally {
      setEliminando(false);
    }
  };

  const handleCancelar = () => {
    navigate('/clientes');
  };

  if (loading) {
    return (
      <div className="formulario-container">
        <p>Cargando cliente...</p>
      </div>
    );
  }

  if (error && !cliente) {
    return (
      <div className="formulario-container">
        <h2>Error</h2>
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={() => navigate('/clientes')} className="btn volver">
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="formulario-container">
      <div className="vista-contenido">
        <h2>Eliminar Cliente</h2>
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
        {cliente && (
          <div style={{
            backgroundColor: '#fff3cd',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #ffeaa7'
          }}>
            <h3 style={{ color: '#856404', marginBottom: '15px' }}>
              ¿Está seguro de que desea eliminar el siguiente cliente?
            </h3>
            <div style={{ lineHeight: '1.8' }}>
              <p><strong>Nombre:</strong> {cliente.nombreCliente} {cliente.apellidoCliente}</p>
              <p><strong>Email:</strong> {cliente.emailCliente}</p>
              <p><strong>Teléfono:</strong> {cliente.telefonoCliente || 'No especificado'}</p>
              <p><strong>Documento:</strong> {cliente.numeroDocCliente}</p>
              <p><strong>Dirección:</strong> {cliente.direccionCliente}</p>
              <p><strong>Código Postal:</strong> {cliente.codigoPostalCliente}</p>
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
            {eliminando ? 'Eliminando...' : 'Eliminar Cliente'}
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

export default EliminarCliente;