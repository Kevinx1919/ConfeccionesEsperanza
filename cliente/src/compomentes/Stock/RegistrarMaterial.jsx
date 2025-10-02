import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

function RegistrarMaterial() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [material, setMaterial] = useState({ ...initialMaterialState });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [titulo, setTitulo] = useState('Registrar Material');

  useEffect(() => {
    if (id) {
      setLoading(true);
      setTitulo('Editar Material');
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
        .catch(err => {
          setError('No se pudo cargar el material para editar.');
          setLoading(false);
        });
    }
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

  const validateForm = () => {
    if (
      !material.nombre ||
      !material.cantidad ||
      !material.fechaEntrada ||
      !material.proveedor ||
      !material.tipoMaterial_IdTipoMaterial
    ) {
      setError('Nombre, Cantidad, Fecha de Entrada, Proveedor y Tipo de Material son campos obligatorios.');
      return false;
    }
    
    if (material.cantidad < 0) {
      setError('La cantidad no puede ser negativa.');
      return false;
    }
    
    if (material.tipoMaterial_IdTipoMaterial < 1) {
      setError('Seleccione un tipo de material válido.');
      return false;
    }

    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      // Formatear la fecha para el backend
      const materialToSend = {
        ...material,
        fechaEntrada: material.fechaEntrada ? `${material.fechaEntrada}T00:00:00.000Z` : new Date().toISOString()
      };

      if (id) {
        // Actualizar material
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
      } else {
        // Crear material
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(materialToSend)
        });
        if (!res.ok) throw new Error('Error al registrar material');
        alert('Material registrado con éxito');
      }
      navigate('/listar-material');
    } catch (err) {
      setError('Ocurrió un error al guardar el material. Por favor, inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && id) {
    return (
      <div className="formulario-container">
        <p>Cargando datos del material...</p>
      </div>
    );
  }

  return (
    <div className="formulario-container">
      <form onSubmit={handleSubmit}>
        <h2>{titulo}</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        
        <input 
          name="nombre" 
          value={material.nombre} 
          onChange={handleChange} 
          placeholder="Nombre del material" 
          required 
          disabled={loading} 
        />
        
        <input 
          type="number" 
          name="cantidad" 
          value={material.cantidad} 
          onChange={handleChange} 
          placeholder="Cantidad" 
          min="0"
          required 
          disabled={loading} 
        />
        
        <input 
          type="date" 
          name="fechaEntrada" 
          value={material.fechaEntrada} 
          onChange={handleChange} 
          required 
          disabled={loading} 
        />
        
        <input 
          name="proveedor" 
          value={material.proveedor} 
          onChange={handleChange} 
          placeholder="Proveedor" 
          required 
          disabled={loading} 
        />
        
        <input 
          type="number" 
          name="tipoMaterial_IdTipoMaterial" 
          value={material.tipoMaterial_IdTipoMaterial} 
          onChange={handleChange} 
          placeholder="ID Tipo Material" 
          min="1"
          required 
          disabled={loading} 
        />
        
        <input 
          type="number" 
          name="color_IdColor" 
          value={material.color_IdColor} 
          onChange={handleChange} 
          placeholder="ID Color (opcional)" 
          min="0"
          disabled={loading} 
        />
        
        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Guardando...' : (id ? 'Actualizar' : 'Registrar')}
          </button>
          <button type="button" onClick={() => navigate('/listarMaterial')} disabled={loading}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default RegistrarMaterial;