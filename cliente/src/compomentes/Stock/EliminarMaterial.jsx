import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Stock.css';

const API_URL = 'https://localhost:7232/api/Material';

function EliminarMaterial() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [eliminando, setEliminando] = useState(false);

  useEffect(() => {
    // Cargar datos del material a eliminar
    const token = localStorage.getItem('token'); 
    fetch(`${API_URL}/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('No se pudo cargar el material');
        return res.json();
      })
      .then(data => {
        setMaterial(data);
        setLoading(false);
      })
      .catch(() => {
        setError('No se pudo cargar el material');
        setLoading(false);
      });
  }, [id]);

  const handleEliminar = async () => {
    if (!window.confirm('¿Está seguro de que desea eliminar este material?')) {
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
      
      if (!res.ok) throw new Error('Error al eliminar material');
      
      alert('Material eliminado con éxito');
      navigate('/listar-material');
    } catch {
      setError('Ocurrió un error al eliminar el material.');
    } finally {
      setEliminando(false);
    }
  };

  const handleCancelar = () => {
    navigate('/listar-material');
  };

  if (loading) {
    return (
      <div className="formulario-container">
        <p>Cargando material...</p>
      </div>
    );
  }

  if (error && !material) {
    return (
      <div className="formulario-container">
        <h2>Error</h2>
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={() => navigate('/listarMaterial')} className="btn volver">
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="formulario-container">
      <div className="vista-contenido">
        <h2>Eliminar Material</h2>
        
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

        {material && (
          <div style={{ 
            backgroundColor: '#fff3cd', 
            padding: '20px', 
            borderRadius: '8px', 
            marginBottom: '20px',
            border: '1px solid #ffeaa7'
          }}>
            <h3 style={{ color: '#856404', marginBottom: '15px' }}>
              ¿Está seguro de que desea eliminar el siguiente material?
            </h3>
            
            <div style={{ lineHeight: '1.8' }}>
              <p><strong>Nombre:</strong> {material.nombre}</p>
              <p><strong>Cantidad:</strong> {material.cantidad}</p>
              <p><strong>Proveedor:</strong> {material.proveedor}</p>
              <p><strong>Fecha de Entrada:</strong> {new Date(material.fechaEntrada).toLocaleDateString()}</p>
              <p><strong>ID Tipo Material:</strong> {material.tipoMaterial_IdTipoMaterial}</p>
              <p><strong>ID Color:</strong> {material.color_IdColor || 'No especificado'}</p>
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
            style={{
              backgroundColor: '#dc3545',
              color: 'white'
            }}
          >
            {eliminando ? 'Eliminando...' : 'Eliminar Material'}
          </button>
          <button 
            onClick={handleCancelar}
            disabled={eliminando}
            style={{
              backgroundColor: '#6c757d',
              color: 'white'
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export default EliminarMaterial;