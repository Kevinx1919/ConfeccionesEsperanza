import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Pencil,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-react';
import { apiUrl } from '../../config/api';
import { readCollection } from '../../utils/apiResponse';

const API_URL_MATERIAL = apiUrl('/api/Material');

const panelClass =
  'mx-auto w-full max-w-[500rem] rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_80px_-32px_rgba(15,23,42,0.35)]';

const buttonBaseClass =
  'inline-flex items-center justify-center gap-2 rounded-2xl text-sm font-semibold transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60';

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
      const materialesRecibidos = readCollection(data, ['materiales', 'items', 'data']);

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
      <div className="mx-auto w-full max-w-[74rem] px-4 py-4 sm:px-6">
        <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-[0_24px_60px_-35px_rgba(15,23,42,0.35)]">
          <p className="text-base font-medium text-slate-600">Cargando materiales...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-[74rem] px-4 py-4 sm:px-6">
        <div className="rounded-[28px] border border-rose-200 bg-white p-8 text-center shadow-[0_24px_60px_-35px_rgba(15,23,42,0.35)]">
          <h2 className="text-2xl font-bold text-slate-900">Error</h2>
          <p className="mt-3 text-sm text-rose-700">{error}</p>
          <button
            id="boton_reintentar_carga_listado_stock"
            className={`${buttonBaseClass} mt-6 bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_100%)] px-5 py-3 text-white shadow-lg shadow-sky-500/20 focus:ring-sky-200 boton_reintentar_carga_listado_stock`}
            onClick={fetchMateriales}
          >
            <RefreshCw className="h-4 w-4" />
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[224rem] px-3 py-0 sm:px-5 lg:px-6">
      <section className={panelClass}>
        <div className="border-b border-slate-200 bg-[linear-gradient(135deg,#eff6ff_0%,#f8fafc_50%,#eef2ff_100%)] px-5 py-1.5 sm:px-8">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-[28rem]">
              <span className="inline-flex items-center rounded-full border border-sky-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
                Inventario
              </span>
              <h2 className="mt-1 text-[1.45rem] font-bold tracking-tight text-slate-900 sm:text-[1.8rem]">
                Lista de Materiales
              </h2>
              <p className="mt-0.5 text-[12px] leading-[1.15rem] text-slate-600">
                Consulta, busca y administra materiales.
              </p>
            </div>

            <div className="w-full max-w-6xl xl:max-w-7xl">
              <label
                className="mb-1.5 inline-flex items-center gap-2 text-[13px] font-semibold text-slate-700"
                htmlFor="campo_busqueda_material_listado_stock"
              >
                <span className="rounded-lg bg-sky-100 p-1 text-sky-700">
                  <Search className="h-3.5 w-3.5" />
                </span>
                Buscar material
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  id="campo_busqueda_material_listado_stock"
                  className="w-full rounded-2xl border border-slate-200 bg-white py-1.5 pl-10 pr-4 text-[13px] text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                  type="text"
                  placeholder="Nombre, proveedor, tipo o color"
                  value={terminoBusqueda}
                  onChange={(event) => setTerminoBusqueda(event.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 py-1 sm:px-8 sm:py-1">
          {materialesActuales.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
              <h3 className="text-xl font-semibold text-slate-900">No se encontraron materiales</h3>
              <p className="mt-3 text-sm text-slate-600">
                {terminoBusqueda
                  ? 'Intenta con otros terminos de busqueda.'
                  : 'No hay materiales registrados.'}
              </p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-hidden rounded-[22px] border border-slate-200 md:block">
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse">
                    <thead className="bg-slate-100">
                      <tr className="text-left text-[11px] font-semibold text-slate-700">
                        <th className="px-4 py-2">ID</th>
                        <th className="px-4 py-2">Nombre</th>
                        <th className="px-4 py-2">Tipo</th>
                        <th className="px-4 py-2">Cantidad</th>
                        <th className="px-4 py-2">Fecha Entrada</th>
                        <th className="px-4 py-2">Proveedor</th>
                        <th className="px-4 py-2">Color</th>
                        <th className="px-4 py-2">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white text-[11px] text-slate-700">
                      {materialesActuales.map((material, index) => {
                        const materialId = material.idMaterial || material.id;

                        return (
                          <tr
                            key={materialId}
                            className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}
                          >
                            <td className="px-4 py-2 font-semibold text-slate-900">{materialId}</td>
                            <td className="px-4 py-2">{material.nombre}</td>
                            <td className="px-4 py-2">{material.tipoMaterialDescripcion || 'Sin tipo'}</td>
                            <td className="px-4 py-2">{material.cantidad}</td>
                            <td className="px-4 py-2">
                              {material.fechaEntrada
                                ? new Date(material.fechaEntrada).toLocaleDateString()
                                : 'N/A'}
                            </td>
                            <td className="px-4 py-2">{material.proveedor}</td>
                            <td className="px-4 py-2">{material.colorDescripcion || 'No especificado'}</td>
                            <td className="px-4 py-2">
                              <div className="flex items-center gap-2">
                                <button
                                  id={`boton_editar_material_listado_stock_tabla_${materialId}`}
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-sky-200 bg-sky-50 text-sky-700 transition hover:bg-sky-100 focus:outline-none focus:ring-4 focus:ring-sky-100 boton_editar_material_listado_stock_tabla"
                                  onClick={() => navigate(`/editarMaterial/${materialId}`)}
                                  title="Editar material"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  id={`boton_eliminar_material_listado_stock_tabla_${materialId}`}
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-700 transition hover:bg-rose-100 focus:outline-none focus:ring-4 focus:ring-rose-100 boton_eliminar_material_listado_stock_tabla"
                                  onClick={() => navigate(`/eliminarMaterial/${materialId}`)}
                                  title="Eliminar material"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:hidden">
                {materialesActuales.map((material) => {
                  const materialId = material.idMaterial || material.id;

                  return (
                    <article
                      key={materialId}
                      className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
                            Material #{materialId}
                          </p>
                          <h3 className="mt-2 text-lg font-bold text-slate-900">{material.nombre}</h3>
                          <p className="mt-1 text-sm text-slate-500">
                            {material.tipoMaterialDescripcion || 'Sin tipo'}
                          </p>
                        </div>
                        <span className="rounded-full bg-sky-50 px-3 py-1 text-sm font-semibold text-sky-700">
                          {material.cantidad}
                        </span>
                      </div>

                      <dl className="mt-4 grid grid-cols-1 gap-3 text-sm text-slate-600 sm:grid-cols-2">
                        <div>
                          <dt className="font-semibold text-slate-900">Proveedor</dt>
                          <dd className="mt-1">{material.proveedor}</dd>
                        </div>
                        <div>
                          <dt className="font-semibold text-slate-900">Color</dt>
                          <dd className="mt-1">{material.colorDescripcion || 'No especificado'}</dd>
                        </div>
                        <div className="sm:col-span-2">
                          <dt className="font-semibold text-slate-900">Fecha de entrada</dt>
                          <dd className="mt-1">
                            {material.fechaEntrada
                              ? new Date(material.fechaEntrada).toLocaleDateString()
                              : 'N/A'}
                          </dd>
                        </div>
                      </dl>

                      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                        <button
                          id={`boton_editar_material_listado_stock_tarjeta_${materialId}`}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-700 transition hover:bg-sky-100 focus:outline-none focus:ring-4 focus:ring-sky-100 boton_editar_material_listado_stock_tarjeta"
                          onClick={() => navigate(`/editarMaterial/${materialId}`)}
                        >
                          <Pencil className="h-4 w-4" />
                          Editar
                        </button>
                        <button
                          id={`boton_eliminar_material_listado_stock_tarjeta_${materialId}`}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 focus:outline-none focus:ring-4 focus:ring-rose-100 boton_eliminar_material_listado_stock_tarjeta"
                          onClick={() => navigate(`/eliminarMaterial/${materialId}`)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Eliminar
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="mt-1 rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-1">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <button
                      id="boton_paginacion_anterior_listado_stock"
                      className={`${buttonBaseClass} bg-white px-4 py-2.5 text-[13px] text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-100 focus:ring-slate-200 boton_paginacion_anterior_listado_stock`}
                      onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
                      disabled={paginaActual === 1}
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                      Anterior
                    </button>

                    <span className="text-center text-[13px] font-semibold text-slate-700 sm:text-left">
                      Pagina {paginaActual} de {totalPaginas}
                    </span>

                    <button
                      id="boton_paginacion_siguiente_listado_stock"
                      className={`${buttonBaseClass} bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_100%)] px-4 py-2.5 text-[13px] text-white shadow-lg shadow-sky-500/20 focus:ring-sky-200 boton_paginacion_siguiente_listado_stock`}
                      onClick={() => setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))}
                      disabled={paginaActual === totalPaginas}
                    >
                      Siguiente
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <span className="text-[13px] text-slate-600">
                      Mostrando {materialesFiltrados.length === 0 ? 0 : indexPrimerMaterial + 1} a{' '}
                      {Math.min(indexUltimoMaterial, materialesFiltrados.length)} de{' '}
                      {materialesFiltrados.length} materiales
                    </span>

                    {totalPaginas > 1 ? (
                      <select
                        id="selector_pagina_listado_stock"
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-medium text-slate-700 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
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
              </div>
            </>
          )}

          <div className="mt-3 flex justify-center md:justify-end">
            <button
              id="boton_volver_menu_desde_listado_stock"
              className={`${buttonBaseClass} bg-slate-900 px-5 py-2.5 text-[13px] text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 focus:ring-slate-300 boton_volver_menu_desde_listado_stock`}
              onClick={() => navigate('/stock')}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Volver al Menu Stock
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ListarMaterial;
