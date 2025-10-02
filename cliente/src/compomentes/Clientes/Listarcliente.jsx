import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Listarcliente = () => {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [filteredClientes, setFilteredClientes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [clientesDePagina, setClientesDePagina] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
 
  const clientesPorPagina = 5;

  // Función para obtener clientes de la API
  const fetchClientes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token'); // Ajusta según tu implementación
      
      const response = await fetch('https://localhost:7232/api/Customer', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener los clientes');
      }

      const data = await response.json();
      // Basado en tu JSON, los clientes están en data.clientes
      setClientes(data.clientes || []);
      setFilteredClientes(data.clientes || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching clientes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  // Función para filtrar clientes
  useEffect(() => {
    if (searchTerm === '') {
      setFilteredClientes(clientes);
    } else {
      const filtered = clientes.filter(cliente =>
        cliente.nombreCliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.apellidoCliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.emailCliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.numeroDocCliente.toString().includes(searchTerm) ||
        cliente.telefonoCliente.includes(searchTerm)
      );
      setFilteredClientes(filtered);
    }
    setCurrentPage(1); // Resetear a la primera página al buscar
  }, [searchTerm, clientes]);

  // Cálculos para la paginación
  const indexOfLastCliente = currentPage * clientesPorPagina;
  const indexOfFirstCliente = indexOfLastCliente - clientesPorPagina;
  const clientesActuales = filteredClientes.slice(indexOfFirstCliente, indexOfLastCliente);
  const totalPaginas = Math.ceil(filteredClientes.length / clientesPorPagina);
  

  // Funciones de navegación de páginas
  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    console.log('Intento ir a la siguiente página');
    setCurrentPage(prev => Math.min(prev + 1, totalPaginas));
  };

  const handleVolver = () => {
    navigate('/menu-cliente'); // Ajusta la ruta según tu configuración
  };

  if (loading) {
    return (
      <div className="consulta-container">
        <h2>Cargando clientes...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="consulta-container">
        <h2>Error: {error}</h2>
        <button onClick={fetchClientes} className="btn blue">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="consulta-container">
      <div className="acciones-header">
        <h2>Lista de Clientes</h2>
        <input
          type="text"
          placeholder="Buscar cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {clientesActuales.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h3>No se encontraron clientes</h3>
          <p>{searchTerm ? 'Intenta con otros términos de búsqueda' : 'No hay clientes registrados'}</p>
        </div>
      ) : (
        <>
          <table className="tabla-clientes">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre Completo</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Documento</th>
                <th>Dirección</th>
                <th>Código Postal</th>
                <th>Total Pedidos</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientesActuales.map((cliente) => (
                <tr key={cliente.idCliente}>
                  <td>{cliente.idCliente}</td>
                  <td>{`${cliente.nombreCliente} ${cliente.apellidoCliente}`}</td>
                  <td>{cliente.emailCliente}</td>
                  <td>{cliente.telefonoCliente}</td>
                  <td>{cliente.numeroDocCliente}</td>
                  <td>{cliente.direccionCliente}</td>
                  <td>{cliente.codigoPostalCliente}</td>
                  <td>{cliente.totalPedidos}</td>
                  <td>
                    <button onClick={() => navigate(`/editarCliente/${cliente.idCliente}`)}>✏️</button>
                    <button onClick={() => navigate(`/eliminarCliente/${cliente.idCliente}`)}>🗑️ </button>
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
                style={{
                  backgroundColor: '#8b5fbf',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  opacity: currentPage === 1 ? '0.6' : '1',
                  transition: 'all 0.3s ease'
                }}
              >
                ← Anterior
              </button>
              
              <span style={{ 
                margin: '0 20px', 
                fontWeight: 'bold',
                fontSize: '14px',
                color: '#333'
              }}>
                Página {currentPage} de {totalPaginas}
              </span>
              
              <button
                onClick={goToNextPage}
                
                disabled={currentPage === totalPaginas}
                style={{
                  backgroundColor: '#7c3aed',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: currentPage === totalPaginas ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  opacity: currentPage === totalPaginas ? '0.6' : '1',
                  transition: 'all 0.3s ease'
                }}
              >
                Siguiente →
              </button>
            </div>

            <div className="paginacion-grupo">
              <span style={{ 
                marginRight: '15px',
                fontSize: '14px',
                color: '#555'
              }}>
                Mostrando {indexOfFirstCliente + 1} a{' '}
                {Math.min(indexOfLastCliente, filteredClientes.length)} de{' '}
                {filteredClientes.length} clientes
              </span>
              
              {totalPaginas > 1 && (
                <select
                  value={currentPage}
                  onChange={(e) => goToPage(Number(e.target.value))}
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

      <div style={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        marginTop: '30px',
        paddingRight: '20px'
      }}>
        <button 
          onClick={() => navigate('/clientes')}
          style={{
            backgroundColor: '#7c3aed',
            color: 'white',
            border: 'none',
            padding: '12px 30px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
            transition: 'all 0.3s ease',
            minWidth: '120px'
          }}
          onMouseEnter={(e) => {
            e.target.style.boxShadow = '0 6px 20px rgba(124, 58, 237, 0.5)';
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.3)';
            e.target.style.transform = 'translateY(0px)';
          }}
        >
          Volver
        </button>
      </div>
    </div>
  );
};

export default Listarcliente;



