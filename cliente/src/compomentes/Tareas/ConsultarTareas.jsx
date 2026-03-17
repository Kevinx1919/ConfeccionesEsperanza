import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Edit3,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-react';
import { apiUrl } from '../../config/api';
import { readCollection } from '../../utils/apiResponse';

const TASK_API_URL = apiUrl('/api/Task');

const buttonBaseClass =
  'inline-flex items-center justify-center gap-2 rounded-2xl text-sm font-semibold transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60';

const inputClass =
  'w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100';

const normalizeTarea = (tarea) => ({
  idTarea: tarea.idTarea ?? tarea.IdTarea ?? 0,
  nombreTarea: tarea.nombreTarea ?? tarea.NombreTarea ?? 'Sin nombre',
  descripcion: tarea.descripcion ?? tarea.Descripcion ?? 'Sin descripcion',
  fechaCreacion: tarea.fechaCreacion ?? tarea.FechaCreacion ?? null,
  fechaActualizacion: tarea.fechaActualizacion ?? tarea.FechaActualizacion ?? null,
  asignacionesActivas: tarea.asignacionesActivas ?? tarea.AsignacionesActivas ?? 0,
  asignacionesCompletadas: tarea.asignacionesCompletadas ?? tarea.AsignacionesCompletadas ?? 0,
});

const formatDate = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
};

function ConsultarTareas() {
  const navigate = useNavigate();
  const [tareas, setTareas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const tareasPorPagina = 4;

  const fetchTareas = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');

      const response = await fetch(TASK_API_URL, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error('No se pudieron cargar las tareas');
      }

      const data = await response.json();
      const collection = readCollection(data, ['tareas', 'items', 'data']).map(normalizeTarea);
      setTareas(collection);
    } catch (fetchError) {
      setError(fetchError.message || 'No se pudieron cargar las tareas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTareas();
  }, []);

  const tareasFiltradas = useMemo(() => {
    if (!searchTerm.trim()) {
      return tareas;
    }

    const normalizedTerm = searchTerm.toLowerCase();
    return tareas.filter((tarea) => {
      const idValue = String(tarea.idTarea);
      return (
        tarea.nombreTarea.toLowerCase().includes(normalizedTerm) ||
        tarea.descripcion.toLowerCase().includes(normalizedTerm) ||
        idValue.includes(normalizedTerm)
      );
    });
  }, [searchTerm, tareas]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPaginas = Math.max(1, Math.ceil(tareasFiltradas.length / tareasPorPagina));
  const indexOfLast = currentPage * tareasPorPagina;
  const indexOfFirst = indexOfLast - tareasPorPagina;
  const tareasActuales = tareasFiltradas.slice(indexOfFirst, indexOfLast);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[74rem] px-4 py-4 sm:px-6">
        <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-[0_24px_60px_-35px_rgba(15,23,42,0.35)]">
          <p className="text-base font-medium text-slate-600">Cargando tareas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-[74rem] px-4 py-4 sm:px-6">
        <div className="rounded-[28px] border border-rose-200 bg-white p-8 text-center shadow-[0_24px_60px_-35px_rgba(15,23,42,0.35)]">
          <h2 className="text-2xl font-bold text-slate-900">No pudimos cargar las tareas</h2>
          <p className="mt-3 text-sm text-rose-700">{error}</p>
          <button
            id="boton_reintentar_consulta_tarea"
            className={`${buttonBaseClass} mt-6 bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_100%)] px-5 py-3 text-white shadow-lg shadow-sky-500/20 focus:ring-sky-200 boton_reintentar_consulta_tarea`}
            onClick={fetchTareas}
          >
            <RefreshCw className="h-4 w-4" />
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[116rem] px-4 py-1.5 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_24px_80px_-32px_rgba(15,23,42,0.35)]">
        <div className="border-b border-slate-200 bg-[linear-gradient(135deg,#eff6ff_0%,#f8fafc_50%,#eef2ff_100%)] px-5 py-3 sm:px-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center rounded-full border border-sky-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
                Seguimiento operativo
              </span>
              <h2 className="mt-2.5 text-[1.9rem] font-bold tracking-tight text-slate-900 sm:text-[2.35rem]">
                Lista de Tareas
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Revisa tareas, su avance general y las acciones disponibles.
              </p>
            </div>

            <div className="w-full xl:max-w-md">
              <label
                className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-700"
                htmlFor="campo_busqueda_tarea"
              >
                <span className="rounded-lg bg-sky-100 p-1 text-sky-700">
                  <Search className="h-4 w-4" />
                </span>
                Buscar tarea
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="campo_busqueda_tarea"
                  className={inputClass}
                  type="text"
                  placeholder="Nombre, descripcion o ID"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 py-2.5 sm:px-8 sm:py-3">
          {tareasActuales.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sky-100 text-sky-700">
                <ClipboardList className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-slate-900">No se encontraron tareas</h3>
              <p className="mt-3 text-sm text-slate-600">
                {searchTerm
                  ? 'Prueba con otra busqueda para encontrar coincidencias.'
                  : 'No hay tareas registradas en este momento.'}
              </p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-hidden rounded-[24px] border border-slate-200 lg:block">
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse">
                    <thead className="bg-slate-100">
                      <tr className="text-left text-sm font-semibold text-slate-700">
                        <th className="px-4 py-3.5">ID</th>
                        <th className="px-4 py-3.5">Nombre</th>
                        <th className="px-4 py-3.5">Descripcion</th>
                        <th className="px-4 py-3.5">Creacion</th>
                        <th className="px-4 py-3.5">Actualizacion</th>
                        <th className="px-4 py-3.5">Activas</th>
                        <th className="px-4 py-3.5">Completadas</th>
                        <th className="px-4 py-3.5">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white text-sm text-slate-700">
                      {tareasActuales.map((tarea, index) => (
                        <tr key={tarea.idTarea} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                          <td className="px-4 py-3.5 font-semibold text-slate-900">#{tarea.idTarea}</td>
                          <td className="px-4 py-3.5">
                            <div className="min-w-[11rem]">
                              <p className="font-semibold text-slate-900">{tarea.nombreTarea}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 max-w-[22rem]">
                            <p className="line-clamp-2">{tarea.descripcion}</p>
                          </td>
                          <td className="px-4 py-3.5">{formatDate(tarea.fechaCreacion)}</td>
                          <td className="px-4 py-3.5">{formatDate(tarea.fechaActualizacion)}</td>
                          <td className="px-4 py-3.5">{tarea.asignacionesActivas}</td>
                          <td className="px-4 py-3.5">{tarea.asignacionesCompletadas}</td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <button
                                id={`boton_editar_tarea_tabla_${tarea.idTarea}`}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-sky-200 bg-sky-50 text-sky-700 transition hover:bg-sky-100 focus:outline-none focus:ring-4 focus:ring-sky-100 boton_editar_tarea_tabla"
                                onClick={() => navigate(`/editarTarea/${tarea.idTarea}`)}
                                title="Editar tarea"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                id={`boton_eliminar_tarea_tabla_${tarea.idTarea}`}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-700 transition hover:bg-rose-100 focus:outline-none focus:ring-4 focus:ring-rose-100 boton_eliminar_tarea_tabla"
                                onClick={() => navigate(`/eliminarTarea/${tarea.idTarea}`)}
                                title="Eliminar tarea"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:hidden">
                {tareasActuales.map((tarea) => (
                  <article
                    key={tarea.idTarea}
                    className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
                          Tarea #{tarea.idTarea}
                        </p>
                        <h3 className="mt-2 text-lg font-bold text-slate-900">{tarea.nombreTarea}</h3>
                      </div>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-slate-600">{tarea.descripcion}</p>

                    <dl className="mt-4 grid grid-cols-1 gap-3 text-sm text-slate-600 sm:grid-cols-2">
                      <div>
                        <dt className="font-semibold text-slate-900">Creacion</dt>
                        <dd className="mt-1">{formatDate(tarea.fechaCreacion)}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-slate-900">Actualizacion</dt>
                        <dd className="mt-1">{formatDate(tarea.fechaActualizacion)}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-slate-900">Asignaciones activas</dt>
                        <dd className="mt-1">{tarea.asignacionesActivas}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-slate-900">Asignaciones completadas</dt>
                        <dd className="mt-1">{tarea.asignacionesCompletadas}</dd>
                      </div>
                    </dl>

                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                      <button
                        id={`boton_editar_tarea_tarjeta_${tarea.idTarea}`}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-700 transition hover:bg-sky-100 focus:outline-none focus:ring-4 focus:ring-sky-100 boton_editar_tarea_tarjeta"
                        onClick={() => navigate(`/editarTarea/${tarea.idTarea}`)}
                      >
                        <Edit3 className="h-4 w-4" />
                        Editar
                      </button>
                      <button
                        id={`boton_eliminar_tarea_tarjeta_${tarea.idTarea}`}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 focus:outline-none focus:ring-4 focus:ring-rose-100 boton_eliminar_tarea_tarjeta"
                        onClick={() => navigate(`/eliminarTarea/${tarea.idTarea}`)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Eliminar
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-3 rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <button
                      id="boton_paginacion_anterior_tarea"
                      className={`${buttonBaseClass} bg-white px-4 py-3 text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-100 focus:ring-slate-200 boton_paginacion_anterior_tarea`}
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </button>

                    <span className="text-center text-sm font-semibold text-slate-700 sm:text-left">
                      Pagina {currentPage} de {totalPaginas}
                    </span>

                    <button
                      id="boton_paginacion_siguiente_tarea"
                      className={`${buttonBaseClass} bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_100%)] px-4 py-3 text-white shadow-lg shadow-sky-500/20 focus:ring-sky-200 boton_paginacion_siguiente_tarea`}
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPaginas))}
                      disabled={currentPage === totalPaginas}
                    >
                      Siguiente
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <span className="text-sm text-slate-600">
                      Mostrando {tareasFiltradas.length === 0 ? 0 : indexOfFirst + 1} a{' '}
                      {Math.min(indexOfLast, tareasFiltradas.length)} de {tareasFiltradas.length} tareas
                    </span>

                    {totalPaginas > 1 ? (
                      <select
                        id="selector_pagina_tarea"
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                        value={currentPage}
                        onChange={(event) => setCurrentPage(Number(event.target.value))}
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

          <div className="mt-4 flex justify-center md:justify-end">
            <button
              id="boton_volver_menu_tarea_desde_listado"
              className={`${buttonBaseClass} bg-slate-900 px-5 py-3 text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 focus:ring-slate-300 boton_volver_menu_tarea_desde_listado`}
              onClick={() => navigate('/tareas')}
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al Menu Tareas
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ConsultarTareas;
