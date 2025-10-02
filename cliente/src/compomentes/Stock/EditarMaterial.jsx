import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Stock.css';

const API_URL = 'https://localhost:7232/api/Material';

const initialMaterialState = {
  nombre: '',
  cantidad: 0,
  fechaEntrada: '',
  proveedor: '',
  tipoMaterial_IdTipoMaterial: 0,
  color_IdColor: 0
};

function EditarMaterial() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [material, setMaterial] = useState(initialMaterialState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Cargar datos del material
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
        // Formatear la fecha para el input date
        const materialData = {
          ...data,
          fechaEntrada: data.fechaEntrada ? data.fechaEntrada.split('T')[0] : ''
        };
        setMaterial(materialData);
        setLoading(false);
      })
      .catch(() => {
        setError('No se pudo cargar el material');
        setLoading(false);
      });
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMaterial(prev => ({ 
      ...prev, 
      [name]: name === 'cantidad' || name === 'tipoMaterial_IdTipoMaterial' || name === 'color_IdColor' 
        ? parseInt(value) || 0 
        : value 
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
        const token = localStorage.getItem('token'); 
        
        // Formatear la fecha para el backend
        const materialToSend = {
          ...material,
          fechaEntrada: material.fechaEntrada ? `${material.fechaEntrada}T00:00:00.000Z` : new Date().toISOString()
        };

        const res = await fetch(`${API_URL}/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(materialToSend)
        });
        
        if (!res.ok) throw new Error('Error al actualizar material');
        
        alert('Material actualizado con éxito');
        navigate('/listar-material');
    } catch {
      setError('Ocurrió un error al actualizar el material.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Cargando...</p>;

  return (
    <div className="formulario-container">
      <form onSubmit={handleSubmit}>
        <h2>Editar Material</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        
        <input 
          name="nombre" 
          value={material.nombre} 
          onChange={handleChange} 
          placeholder="Nombre del material" 
          required 
        />
        
        <input 
          type="number" 
          name="cantidad" 
          value={material.cantidad} 
          onChange={handleChange} 
          placeholder="Cantidad" 
          min="0"
          required 
        />
        
        <input 
          type="date" 
          name="fechaEntrada" 
          value={material.fechaEntrada} 
          onChange={handleChange} 
          required 
        />
        
        <input 
          name="proveedor" 
          value={material.proveedor} 
          onChange={handleChange} 
          placeholder="Proveedor" 
          required 
        />
        
        <input 
          type="number" 
          name="tipoMaterial_IdTipoMaterial" 
          value={material.tipoMaterial_IdTipoMaterial} 
          onChange={handleChange} 
          placeholder="ID Tipo Material" 
          min="0"
          required 
        />
        
        <input 
          type="number" 
          name="color_IdColor" 
          value={material.color_IdColor} 
          onChange={handleChange} 
          placeholder="ID Color" 
          min="0"
        />
        
        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
          <button type="button" onClick={() => navigate('/listarMaterial')}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditarMaterial;