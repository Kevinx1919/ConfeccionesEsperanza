import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiUrl } from '../../config/api';
import { readCollection } from '../../utils/apiResponse';

const ListarEmpleados = () => {
  const navigate = useNavigate();
  const [empleados, setEmpleados] = useState([]);
  const [filteredEmpleados, setFilteredEmpleados] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const empleadosPorPagina = 5;

  // Función para obtener empleados de la API
  const fetchEmpleados = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(apiUrl('/api/User'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener los empleados');
      }

      const data = await response.json();
      const usuariosRecibidos = readCollection(data, ['users']);
      setEmpleados(usuariosRecibidos);
      setFilteredEmpleados(usuariosRecibidos);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching empleados:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmpleados();
  }, []);

  // Función para filtrar empleados
  useEffect(() => {
    let filtered = empleados;

    // Filtro por término de búsqueda
    if (searchTerm !== '') {
      filtered = filtered.filter(empleado =>
        empleado.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        empleado.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        empleado.phoneNumber?.includes(searchTerm)
      );
    }

    // Filtro por rol
    if (roleFilter !== '') {
      filtered = filtered.filter(empleado =>
        empleado.roles?.some(role => role.toLowerCase() === roleFilter.toLowerCase())
      );
    }

    // Filtro por estado
    if (statusFilter !== '') {
      if (statusFilter === 'activo') {
        filtered = filtered.filter(empleado => !empleado.lockoutEnabled);
      } else if (statusFilter === 'bloqueado') {
        filtered = filtered.filter(empleado => empleado.lockoutEnabled);
      } else if (statusFilter === 'emailConfirmado') {
        filtered = filtered.filter(empleado => empleado.emailConfirmed);
      } else if (statusFilter === 'emailNoConfirmado') {
        filtered = filtered.filter(empleado => !empleado.emailConfirmed);
      } else if (statusFilter === '2FA') {
        filtered = filtered.filter(empleado => empleado.twoFactorEnabled);
      }
    }

    setFilteredEmpleados(filtered);
    setCurrentPage(1);
  }, [searchTerm, roleFilter, statusFilter, empleados]);

  // Obtener roles únicos para el filtro
  const uniqueRoles = [...new Set(empleados.flatMap(emp => emp.roles || []))];

  // Cálculos para la paginación
  const indexOfLastEmpleado = currentPage * empleadosPorPagina;
  const indexOfFirstEmpleado = indexOfLastEmpleado - empleadosPorPagina;
  const empleadosActuales = filteredEmpleados.slice(indexOfFirstEmpleado, indexOfLastEmpleado);
  const totalPaginas = Math.ceil(filteredEmpleados.length / empleadosPorPagina);

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

  const handleLimpiarFiltros = () => {
    setSearchTerm('');
    setRoleFilter('');
    setStatusFilter('');
  };

  const handleEditar = (empleado) => {
    // Implementar lógica de edición
    console.log('Editar empleado:', empleado);
  };

  const handleEliminar = (empleado) => {
    // Implementar lógica de eliminación
    console.log('Eliminar empleado:', empleado);
  };

  if (loading) {
    return (
      <div className="consulta-container">
        <h2>Cargando empleados...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="consulta-container">
        <h2>Error: {error}</h2>
        <button onClick={fetchEmpleados} className="btn blue">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="consulta-container">
      <div className="acciones-header">
        <h2>Lista de Empleados</h2>
        <div className="filtros-container">
          <input
            type="text"
            placeholder="Buscar por nombre, email o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-buscar"
          />
          
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="select-filtro"
          >
            <option value="">Todos los roles</option>
            {uniqueRoles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select-filtro"
          >
            <option value="">Todos los estados</option>
            <option value="activo">Activos</option>
            <option value="bloqueado">Bloqueados</option>
            <option value="emailConfirmado">Email Confirmado</option>
            <option value="emailNoConfirmado">Email No Confirmado</option>
            <option value="2FA">Con 2FA</option>
          </select>

          <button onClick={handleLimpiarFiltros} className="btn-limpiar-filtros">
            Limpiar Filtros
          </button>
        </div>
      </div>

      {empleadosActuales.length === 0 ? (
        <div className="sin-resultados">
          <h3>No se encontraron empleados</h3>
          <p>{searchTerm || roleFilter || statusFilter ? 'Intenta con otros filtros de búsqueda' : 'No hay empleados registrados'}</p>
        </div>
      ) : (
        <>
          <table className="tabla-clientes">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre de Usuario</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Roles</th>
                <th>Email Confirmado</th>
                <th>2FA Activado</th>
                <th>Estado</th>
                <th>Intentos Fallidos</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {empleadosActuales.map((empleado) => (
                <tr key={empleado.id}>
                  <td className="td-id">{empleado.id?.substring(0, 8)}...</td>
                  <td>{empleado.userName}</td>
                  <td>{empleado.email}</td>
                  <td>{empleado.phoneNumber || 'N/A'}</td>
                  <td>
                    {empleado.roles && empleado.roles.length > 0 ? (
                      <div className="roles-container">
                        {empleado.roles.map((role, idx) => (
                          <span key={idx} className="role-badge">
                            {role}
                          </span>
                        ))}
                      </div>
                    ) : (
                      'Sin roles'
                    )}
                  </td>
                  <td>
                    <span className={`status-text ${empleado.emailConfirmed ? 'status-confirmed' : 'status-unconfirmed'}`}>
                      {empleado.emailConfirmed ? '✓ Sí' : '✗ No'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-text ${empleado.twoFactorEnabled ? 'status-confirmed' : 'status-neutral'}`}>
                      {empleado.twoFactorEnabled ? '✓ Sí' : '✗ No'}
                    </span>
                  </td>
                  <td>
                    <span className={`estado-badge ${empleado.lockoutEnabled ? 'estado-bloqueado' : 'estado-activo'}`}>
                      {empleado.lockoutEnabled ? 'Bloqueado' : 'Activo'}
                    </span>
                  </td>
                  <td className="td-center">{empleado.accessFailedCount || 0}</td>
                  <td className="td-acciones">
                    <button 
                      onClick={() => navigate(`/editarEmpleado/${empleado.id}`)}
                      className="btn-accion btn-editar"
                      title="Editar empleado"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => navigate(`/eliminarEmpleado/${empleado.id}`)}
                      className="btn-accion btn-eliminar"
                      title="Eliminar empleado"
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
                className="btn-paginacion btn-anterior"
              >
                ← Anterior
              </button>
              
              <span className="paginacion-info">
                Página {currentPage} de {totalPaginas}
              </span>
              
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPaginas}
                className="btn-paginacion btn-siguiente"
              >
                Siguiente →
              </button>
            </div>

            <div className="paginacion-grupo">
              <span className="paginacion-resumen">
                Mostrando {indexOfFirstEmpleado + 1} a{' '}
                {Math.min(indexOfLastEmpleado, filteredEmpleados.length)} de{' '}
                {filteredEmpleados.length} empleados
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

      <div className="volver-container">
        <button 
          onClick={() => navigate('/empleados')}
          className="btn volver"
        >
          Volver
        </button>
      </div>
    </div>
  );
};

export default ListarEmpleados;
