import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiUrl } from '../../config/api';
import { readCollection } from '../../utils/apiResponse';
import './Stock.css';

const API_URL_MATERIAL = apiUrl('/api/Material');

function ListarMaterial() {
  const navigate = useNavigate();
  const [materiales, setMateriales] = useState([]);
  const [materialesFiltrados, setMaterialesFiltrados] = useState([]);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const materialesPorPagina = 5;

  const fetchMateriales = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');

      const response = await fetch(API_URL_MATERIAL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener los materiales');
      }

      const data = await response.json();
      const materialesRecibidos = readCollection(data, ['materiales']);

      setMateriales(materialesRecibidos);
      setMaterialesFiltrados(materialesRecibidos);
    } catch (fetchError) {
      setError(fetchError.message || 'No se pudo cargar el listado de materiales');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMateriales();
  }, []);

  useEffect(() => {
    if (!terminoBusqueda.trim()) {
      setMaterialesFiltrados(materiales);
      setPaginaActual(1);
      return;
    }

    const busquedaNormalizada = terminoBusqueda.toLowerCase();
    const materialesCoincidentes = materiales.filter((material) => {
      const nombre = material.nombre?.toLowerCase() || '';
      const proveedor = material.proveedor?.toLowerCase() || '';
      const cantidad = material.cantidad?.toString() || '';
      const tipoMaterial =
        material.tipoMaterialDescripcion?.toLowerCase() ||
        material.tipoMaterial?.descripcionMaterial?.toLowerCase() ||
        '';
      const color =
        material.colorDescripcion?.toLowerCase() ||
        material.color?.descripcionColor?.toLowerCase() ||
        '';

      return (
        nombre.includes(busquedaNormalizada) ||
        proveedor.includes(busquedaNormalizada) ||
        cantidad.includes(busquedaNormalizada) ||
        tipoMaterial.includes(busquedaNormalizada) ||
        color.includes(busquedaNormalizada)
      );
    });

    setMaterialesFiltrados(materialesCoincidentes);
    setPaginaActual(1);
  }, [terminoBusqueda, materiales]);

  const indexUltimoMaterial = paginaActual * materialesPorPagina;
  const indexPrimerMaterial = indexUltimoMaterial - materialesPorPagina;
  const materialesActuales = materialesFiltrados.slice(indexPrimerMaterial, indexUltimoMaterial);
  const totalPaginas = Math.max(1, Math.ceil(materialesFiltrados.length / materialesPorPagina));

  if (loading) {
    return (
      <div className="stock-cargando-panel">
        <h2>Cargando materiales...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="stock-error-panel">
        <h2>Error: {error}</h2>
        <button
          id="boton_reintentar_carga_listado_stock"
          className="stock-listado-boton-reintentar boton_reintentar_carga_listado_stock"
          onClick={fetchMateriales}
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="stock-formulario-contenedor stock-listado-panel">
      <div className="stock-listado-encabezado">
        <h2 className="stock-formulario-titulo stock-listado-titulo">Lista de Materiales</h2>
        <div className="stock-listado-barra-herramientas">
          <div className="stock-formulario-campo stock-listado-campo-busqueda">
            <label
              className="stock-formulario-etiqueta"
              htmlFor="campo_busqueda_material_listado_stock"
            >
              Buscar material
            </label>
            <input
              id="campo_busqueda_material_listado_stock"
              className="stock-formulario-control stock-listado-buscador"
              type="text"
              placeholder="Nombre, proveedor, tipo o color"
              value={terminoBusqueda}
              onChange={(event) => setTerminoBusqueda(event.target.value)}
            />
          </div>
        </div>
      </div>

      {materialesActuales.length === 0 ? (
        <div className="stock-listado-vacio">
          <h3>No se encontraron materiales</h3>
          <p>
            {terminoBusqueda
              ? 'Intenta con otros terminos de busqueda.'
              : 'No hay materiales registrados.'}
          </p>
        </div>
      ) : (
        <>
          <div className="stock-listado-tabla-marco">
            <table className="stock-tabla-materiales">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Cantidad</th>
                  <th>Fecha Entrada</th>
                  <th>Proveedor</th>
                  <th>Color</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {materialesActuales.map((material) => {
                  const materialId = material.idMaterial || material.id;

                  return (
                    <tr key={materialId}>
                      <td>{materialId}</td>
                      <td>{material.nombre}</td>
                      <td>{material.tipoMaterialDescripcion || 'Sin tipo'}</td>
                      <td>{material.cantidad}</td>
                      <td>
                        {material.fechaEntrada
                          ? new Date(material.fechaEntrada).toLocaleDateString()
                          : 'N/A'}
                      </td>
                      <td>{material.proveedor}</td>
                      <td>{material.colorDescripcion || 'No especificado'}</td>
                      <td className="stock-tabla-celda-acciones">
                        <button
                          id={`boton_editar_material_listado_stock_${materialId}`}
                          className={`stock-tabla-boton-accion stock-tabla-boton-accion--editar boton_editar_material_listado_stock_${materialId}`}
                          onClick={() => navigate(`/editarMaterial/${materialId}`)}
                          title="Editar material"
                        >
                          ✏️
                        </button>
                        <button
                          id={`boton_eliminar_material_listado_stock_${materialId}`}
                          className={`stock-tabla-boton-accion stock-tabla-boton-accion--eliminar boton_eliminar_material_listado_stock_${materialId}`}
                          onClick={() => navigate(`/eliminarMaterial/${materialId}`)}
                          title="Eliminar material"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="stock-paginacion-contenedor">
            <div className="stock-paginacion-grupo">
              <button
                id="boton_paginacion_anterior_listado_stock"
                className="stock-paginacion-boton boton_paginacion_anterior_listado_stock"
                onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
                disabled={paginaActual === 1}
              >
                ← Anterior
              </button>

              <span className="stock-paginacion-texto">
                Pagina {paginaActual} de {totalPaginas}
              </span>

              <button
                id="boton_paginacion_siguiente_listado_stock"
                className="stock-paginacion-boton boton_paginacion_siguiente_listado_stock"
                onClick={() => setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))}
                disabled={paginaActual === totalPaginas}
              >
                Siguiente →
              </button>
            </div>

            <div className="stock-paginacion-grupo">
              <span className="stock-paginacion-resumen">
                Mostrando {materialesFiltrados.length === 0 ? 0 : indexPrimerMaterial + 1} a{' '}
                {Math.min(indexUltimoMaterial, materialesFiltrados.length)} de{' '}
                {materialesFiltrados.length} materiales
              </span>

              {totalPaginas > 1 ? (
                <select
                  id="selector_pagina_listado_stock"
                  className="stock-paginacion-selector"
                  value={paginaActual}
                  onChange={(event) => setPaginaActual(Number(event.target.value))}
                >
                  {Array.from({ length: totalPaginas }, (_, index) => index + 1).map((pageNumber) => (
                    <option key={pageNumber} value={pageNumber}>
                      Pagina {pageNumber}
                    </option>
                  ))}
                </select>
              ) : null}
            </div>
          </div>
        </>
      )}

      <div className="stock-listado-acciones-finales">
        <button
          id="boton_volver_menu_desde_listado_stock"
          className="stock-listado-boton-volver boton_volver_menu_desde_listado_stock"
          onClick={() => navigate('/stock')}
        >
          Volver al Menu Stock
        </button>
      </div>
    </div>
  );
}

export default ListarMaterial;
