import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Stock.css';

const ListarMaterial = () => {
  const navigate = useNavigate();
  const [materiales, setMateriales] = useState([]);
  const [filteredMateriales, setFilteredMateriales] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const materialesPorPagina = 5;

  // Función para obtener materiales de la API
  const fetchMateriales = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('https://localhost:7232/api/Material', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener los materiales');
      }

      const data = await response.json();
      
      // Asegurarnos de que siempre sea un array
      const materialesArray = Array.isArray(data) ? data : (data.materiales || []);
      
      setMateriales(materialesArray);
      setFilteredMateriales(materialesArray);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching materiales:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMateriales();
  }, []);

  // Función para filtrar materiales
  useEffect(() => {
    if (!Array.isArray(materiales)) {
      setFilteredMateriales([]);
      return;
    }

    if (searchTerm === '') {
      setFilteredMateriales(materiales);
    } else {
      const filtered = materiales.filter(material =>
        material.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.proveedor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.cantidad?.toString().includes(searchTerm) ||
        material.tipoMaterial?.descripcionMaterial?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMateriales(filtered);
    }
    setCurrentPage(1);
  }, [searchTerm, materiales]);

  // Cálculos para la paginación - CON VALIDACIÓN
  const materialesArray = Array.isArray(filteredMateriales) ? filteredMateriales : [];
  const indexOfLastMaterial = currentPage * materialesPorPagina;
  const indexOfFirstMaterial = indexOfLastMaterial - materialesPorPagina;
  const materialesActuales = materialesArray.slice(indexOfFirstMaterial, indexOfLastMaterial);
  const totalPaginas = Math.ceil(materialesArray.length / materialesPorPagina);

  // Funciones de navegación de páginas
  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPaginas));
  };

  const handleVolver = () => {
    navigate('/stock');
  };

  if (loading) {
    return (
      <div className="consulta-container">
        <h2>Cargando materiales...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="consulta-container">
        <h2>Error: {error}</h2>
        <button onClick={fetchMateriales} className="btn blue">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="consulta-container">
      <div className="acciones-header">
        <h2>Lista de Materiales</h2>
        <input
          type="text"
          placeholder="Buscar material..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '300px' }}
        />
      </div>

      {materialesActuales.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h3>No se encontraron materiales</h3>
          <p>{searchTerm ? 'Intenta con otros términos de búsqueda' : 'No hay materiales registrados'}</p>
        </div>
      ) : (
        <>
          <table className="tabla-materiales">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Cantidad</th>
                <th>Fecha Entrada</th>
                <th>Proveedor</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {materialesActuales.map((material) => (
                <tr key={material.idMaterial || material.id}>
                  <td>{material.idMaterial || material.id}</td>
                  <td>{material.nombre}</td>
                  <td>{material.cantidad}</td>
                  <td>{material.fechaEntrada ? new Date(material.fechaEntrada).toLocaleDateString() : 'N/A'}</td>
                  <td>{material.proveedor}</td>
                  <td>
                    <button 
                      onClick={() => navigate(`/editarMaterial/${material.idMaterial || material.id}`)}
                      style={{ marginRight: '5px' }}
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => navigate(`/eliminarMaterial/${material.idMaterial || material.id}`)}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Controles de paginación */}
          <div className="paginacion-controles">
            <div className="paginacion-grupo">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="btn-paginacion"
              >
                ← Anterior
              </button>
              
              <span className="info-pagina">
                Página {currentPage} de {totalPaginas}
              </span>
              
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPaginas}
                className="btn-paginacion"
              >
                Siguiente →
              </button>
            </div>

            <div className="paginacion-grupo">
              <span className="info-contador">
                Mostrando {indexOfFirstMaterial + 1} a{' '}
                {Math.min(indexOfLastMaterial, materialesArray.length)} de{' '}
                {materialesArray.length} materiales
              </span>
              
              {totalPaginas > 1 && (
                <select
                  value={currentPage}
                  onChange={(e) => goToPage(Number(e.target.value))}
                  className="select-pagina"
                >
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(pageNum => (
                    <option key={pageNum} value={pageNum}>
                      Página {pageNum}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </>
      )}

      <div className="volver-container" style={{ marginTop: '30px' }}>
        <button 
          onClick={handleVolver}
          className="btn volver"
        >
          Volver al Menú Stock
        </button>
      </div>
    </div>
  );
};

export default ListarMaterial;