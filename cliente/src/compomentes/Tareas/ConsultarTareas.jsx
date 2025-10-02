
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Tareas.css';

const API_URL = 'https://localhost:7232/api/Task';

function ConsultarTareas() {
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [filtradas, setFiltradas] = useState([]);
  const navigate = useNavigate();

  // Paginación
  const tareasPorPagina = 5;
  const [paginaActual, setPaginaActual] = useState(1);
  const totalPaginas = Math.ceil(filtradas.length / tareasPorPagina);
  const indexOfLast = paginaActual * tareasPorPagina;
  const indexOfFirst = indexOfLast - tareasPorPagina;
  const tareasActuales = filtradas.slice(indexOfFirst, indexOfLast);

  const goToPage = (pageNumber) => setPaginaActual(pageNumber);
  const goToPreviousPage = () => setPaginaActual(prev => Math.max(prev - 1, 1));
  const goToNextPage = () => setPaginaActual(prev => Math.min(prev + 1, totalPaginas));

  useEffect(() => {
    setLoading(true);
    fetch(API_URL, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('No se pudo cargar las tareas');
        return res.json();
      })
      .then(data => {
        // Si la respuesta tiene .tareas, usar ese array
        const arr = Array.isArray(data.tareas) ? data.tareas : (Array.isArray(data) ? data : (data ? [data] : []));
        setTareas(arr);
        setFiltradas(arr);
        setLoading(false);
      })
      .catch(() => {
        setError('No se pudo cargar las tareas');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!busqueda) {
      setFiltradas(tareas);
    } else {
      setFiltradas(
        (Array.isArray(tareas) ? tareas : []).filter(t =>
          t.nombreTarea?.toLowerCase().includes(busqueda.toLowerCase()) ||
          t.descripcion?.toLowerCase().includes(busqueda.toLowerCase()) ||
          t.idTarea?.toString() === busqueda
        )
      );
    }
  }, [busqueda, tareas]);

  return (
    <div className="consulta-container">
      <div className="acciones-header">
        <h2>Lista de Tareas</h2>
        <input
          type="text"
          placeholder="Buscar tarea..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
      </div>

      {loading ? (
        <h3>Cargando tareas...</h3>
      ) : error ? (
        <h3 style={{ color: 'red' }}>{error}</h3>
      ) : tareasActuales.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h3>No se encontraron tareas</h3>
          <p>{busqueda ? 'Intenta con otros términos de búsqueda' : 'No hay tareas registradas'}</p>
        </div>
      ) : (
        <>
          <table className="tabla-clientes tabla-tareas-ajustada">
            <thead>
              <tr>
                <th style={{background:'#663dd4',color:'#fff'}}>ID</th>
                <th style={{background:'#663dd4',color:'#fff'}}>Nombre</th>
                <th style={{background:'#663dd4',color:'#fff'}}>Descripción</th>
                <th style={{background:'#663dd4',color:'#fff'}}>Fecha Creación</th>
                <th style={{background:'#663dd4',color:'#fff'}}>Fecha Actualización</th>
                <th style={{background:'#663dd4',color:'#fff'}}>Asignaciones Activas</th>
                <th style={{background:'#663dd4',color:'#fff'}}>Asignaciones Completadas</th>
                <th style={{background:'#663dd4',color:'#fff'}}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tareasActuales.map((t, idx) => (
                <tr key={t.idTarea || idx}>
                  <td>{t.idTarea}</td>
                  <td>{t.nombreTarea}</td>
                  <td>{t.descripcion}</td>
                  <td>{new Date(t.fechaCreacion).toLocaleDateString()}</td>
                  <td>{new Date(t.fechaActualizacion).toLocaleDateString()}</td>
                  <td>{t.asignacionesActivas}</td>
                  <td>{t.asignacionesCompletadas}</td>
                  <td>
                    <button
                      onClick={() => navigate(`/editarTarea/${t.idTarea}`)}
                      style={{background:'none',border:'none',fontSize:'1.2rem',cursor:'pointer',marginRight:'6px'}}
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => navigate(`/eliminarTarea/${t.idTarea}`)}
                      style={{background:'none',border:'none',fontSize:'1.2rem',cursor:'pointer'}}
                      title="Eliminar"
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
                disabled={paginaActual === 1}
                style={{
                  backgroundColor: '#8b5fbf',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: paginaActual === 1 ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  opacity: paginaActual === 1 ? '0.6' : '1',
                  transition: 'all 0.3s ease'
                }}
              >
                ← Anterior
              </button>
              <span style={{ margin: '0 20px', fontWeight: 'bold', fontSize: '14px', color: '#333' }}>
                Página {paginaActual} de {totalPaginas}
              </span>
              <button
                onClick={goToNextPage}
                disabled={paginaActual === totalPaginas}
                style={{
                  backgroundColor: '#7c3aed',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: paginaActual === totalPaginas ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  opacity: paginaActual === totalPaginas ? '0.6' : '1',
                  transition: 'all 0.3s ease'
                }}
              >
                Siguiente →
              </button>
            </div>
            <div className="paginacion-grupo">
              <span style={{ marginRight: '15px', fontSize: '14px', color: '#555' }}>
                Mostrando {tareasActuales.length === 0 ? 0 : indexOfFirst + 1} a {Math.min(indexOfLast, filtradas.length)} de {filtradas.length} tareas
              </span>
              {totalPaginas > 1 && (
                <select
                  value={paginaActual}
                  onChange={e => goToPage(Number(e.target.value))}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #ddd',
                    fontSize: '14px',
                    backgroundColor: '#f8f9fa',
                    color: '#333',
                    cursor: 'pointer'
                  }}
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
    </div>
  );
}

export default ConsultarTareas;
