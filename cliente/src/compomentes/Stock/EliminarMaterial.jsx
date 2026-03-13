import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiUrl } from '../../config/api';
import './Stock.css';

const API_URL_MATERIAL = apiUrl('/api/Material');

function EliminarMaterial() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [eliminando, setEliminando] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');

    const fetchMaterial = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL_MATERIAL}/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('No se pudo cargar el material');
        }

        const materialData = await response.json();
        setMaterial(materialData);
      } catch (fetchError) {
        setError(fetchError.message || 'No se pudo cargar el material');
      } finally {
        setLoading(false);
      }
    };

    fetchMaterial();
  }, [id]);

  const handleEliminar = async () => {
    const confirmar = window.confirm('¿Esta seguro de que desea eliminar este material?');

    if (!confirmar) {
      return;
    }

    try {
      setEliminando(true);
      setError('');
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL_MATERIAL}/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('No se pudo eliminar el material');
      }

      navigate('/listarMaterial');
    } catch (deleteError) {
      setError(deleteError.message || 'Ocurrio un error al eliminar el material.');
    } finally {
      setEliminando(false);
    }
  };

  if (loading) {
    return (
      <div className="stock-cargando-panel">
        <p>Cargando material...</p>
      </div>
    );
  }

  if (error && !material) {
    return (
      <div className="stock-error-panel">
        <h2>Error</h2>
        <p>{error}</p>
        <button
          id="boton_volver_error_eliminacion_stock"
          className="stock-listado-boton-volver boton_volver_error_eliminacion_stock"
          onClick={() => navigate('/listarMaterial')}
        >
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="stock-eliminar-panel">
      <h2 className="stock-eliminar-titulo">Eliminar Material</h2>

      {error ? <div className="stock-eliminar-alerta-error">{error}</div> : null}

      {material ? (
        <div className="stock-eliminar-tarjeta">
          <h3 className="stock-eliminar-subtitulo">
            ¿Esta seguro de que desea eliminar el siguiente material?
          </h3>

          <div className="stock-eliminar-detalles">
            <p>
              <strong>Nombre:</strong> {material.nombre}
            </p>
            <p>
              <strong>Cantidad:</strong> {material.cantidad}
            </p>
            <p>
              <strong>Proveedor:</strong> {material.proveedor}
            </p>
            <p>
              <strong>Fecha de Entrada:</strong>{' '}
              {material.fechaEntrada ? new Date(material.fechaEntrada).toLocaleDateString() : 'N/A'}
            </p>
            <p>
              <strong>Tipo de Material:</strong>{' '}
              {material.tipoMaterialDescripcion || material.tipoMaterial_IdTipoMaterial}
            </p>
            <p>
              <strong>Color:</strong> {material.colorDescripcion || 'No especificado'}
            </p>
          </div>

          <div className="stock-eliminar-advertencia">Esta accion no se puede deshacer.</div>
        </div>
      ) : null}

      <div className="stock-eliminar-acciones">
        <button
          id="boton_confirmar_eliminacion_material_stock"
          className="stock-eliminar-boton-confirmar boton_confirmar_eliminacion_material_stock"
          onClick={handleEliminar}
          disabled={eliminando}
        >
          {eliminando ? 'Eliminando...' : 'Eliminar Material'}
        </button>
        <button
          id="boton_cancelar_eliminacion_material_stock"
          className="stock-eliminar-boton-cancelar boton_cancelar_eliminacion_material_stock"
          onClick={() => navigate('/listarMaterial')}
          disabled={eliminando}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

export default EliminarMaterial;
