import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  PauseCircle,
  PlayCircle,
  RefreshCw,
  Search,
  ShieldAlert,
  UserRound,
} from 'lucide-react';
import { apiUrl } from '../../config/api';
import { readCollection } from '../../utils/apiResponse';

const TASK_ASSIGNMENT_API_URL = apiUrl('/api/Task/asignaciones');

const buttonBaseClass =
  'inline-flex items-center justify-center gap-2 rounded-2xl text-sm font-semibold transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60';

const inputClass =
  'w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100';

const selectClass =
  'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100';

const normalizeAsignacion = (asignacion) => ({
  id: asignacion.id ?? asignacion.Id ?? 0,
  usuarioId: asignacion.usuario_IdUsuario ?? asignacion.Usuario_IdUsuario ?? '',
  usuarioNombre: asignacion.usuarioNombre ?? asignacion.UsuarioNombre ?? 'Sin responsable',
  usuarioEmail: asignacion.usuarioEmail ?? asignacion.UsuarioEmail ?? 'Sin correo',
  productoNombre: asignacion.productoNombre ?? asignacion.ProductoNombre ?? 'Sin producto',
  tareaNombre: asignacion.tareaNombre ?? asignacion.TareaNombre ?? 'Sin tarea',
  fechaInicio: asignacion.fechaInicio ?? asignacion.FechaInicio ?? null,
  fechaFin: asignacion.fechaFin ?? asignacion.FechaFin ?? null,
  estado: Number(asignacion.estado ?? asignacion.Estado ?? 0),
  estadoDescripcion:
    asignacion.estadoDescripcion ?? asignacion.EstadoDescripcion ?? 'Sin estado',
  estaVencida: Boolean(asignacion.estaVencida ?? asignacion.EstaVencida ?? false),
});

const formatDateTime = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'N/A'
    : date.toLocaleString('es-CO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
};

const getEstadoTheme = (estado) => {
  switch (estado) {
    case 2:
      return 'border-sky-200 bg-sky-50 text-sky-700';
    case 3:
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    case 5:
      return 'border-amber-200 bg-amber-50 text-amber-700';
    case 4:
      return 'border-rose-200 bg-rose-50 text-rose-700';
    default:
      return 'border-slate-200 bg-slate-100 text-slate-700';
  }
};

function ConsultarAsignacionesTarea() {
  const navigate = useNavigate();
  const [asignaciones, setAsignaciones] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const asignacionesPorPagina = 4;

  const fetchAsignaciones = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const response = await fetch(TASK_ASSIGNMENT_API_URL, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error('No se pudieron cargar las asignaciones');
      }

      const data = await response.json();
      const collection = readCollection(data, ['asignaciones', 'items', 'data']).map(normalizeAsignacion);
      setAsignaciones(collection);
    } catch (fetchError) {
      setError(fetchError.message || 'No se pudieron cargar las asignaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAsignaciones();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, estadoFiltro]);

  const asignacionesFiltradas = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase();

    return asignaciones.filter((asignacion) => {
      const matchesSearch =
        !normalizedTerm ||
        String(asignacion.id).includes(normalizedTerm) ||
        asignacion.usuarioNombre.toLowerCase().includes(normalizedTerm) ||
        asignacion.usuarioEmail.toLowerCase().includes(normalizedTerm) ||
        asignacion.productoNombre.toLowerCase().includes(normalizedTerm) ||
        asignacion.tareaNombre.toLowerCase().includes(normalizedTerm);

      const matchesEstado =
        estadoFiltro === 'todos' || String(asignacion.estado) === estadoFiltro;

      return matchesSearch && matchesEstado;
    });
  }, [asignaciones, searchTerm, estadoFiltro]);

  const totalPaginas = Math.max(1, Math.ceil(asignacionesFiltradas.length / asignacionesPorPagina));
  const indexOfLast = currentPage * asignacionesPorPagina;
  const indexOfFirst = indexOfLast - asignacionesPorPagina;
  const asignacionesActuales = asignacionesFiltradas.slice(indexOfFirst, indexOfLast);

  const handleAction = async (id, action) => {
    try {
      setActionLoadingId(id);
      setError('');
      setSuccessMessage('');
      const token = localStorage.getItem('token');
      const response = await fetch(apiUrl(`/api/Task/asignaciones/${id}/${action}`), {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          payload?.message ||
            payload?.Message ||
            `No se pudo ${action} la asignacion`,
        );
      }

      const successLabel =
        action === 'iniciar'
          ? 'La tarea fue iniciada.'
          : action === 'pausar'
            ? 'La tarea fue pausada.'
            : 'La tarea fue completada.';

      setSuccessMessage(successLabel);
      await fetchAsignaciones();
    } catch (actionError) {
      setError(actionError.message || 'No se pudo actualizar la asignacion');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[74rem] px-4 py-4 sm:px-6">
        <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-[0_24px_60px_-35px_rgba(15,23,42,0.35)]">
          <p className="text-base font-medium text-slate-600">Cargando asignaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[118rem] px-4 py-1.5 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_24px_80px_-32px_rgba(15,23,42,0.35)]">
        <div className="border-b border-slate-200 bg-[linear-gradient(135deg,#eff6ff_0%,#f8fafc_50%,#eef2ff_100%)] px-5 py-3 sm:px-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center rounded-full border border-sky-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
                Avance de produccion
              </span>
              <h2 className="mt-2.5 text-[1.9rem] font-bold tracking-tight text-slate-900 sm:text-[2.35rem]">
                Asignaciones de tareas
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Supervisa las tareas asignadas y cambia su estado operativo en el momento adecuado.
              </p>
            </div>

            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 xl:max-w-2xl">
              <div>
                <label
                  className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-700"
                  htmlFor="campo_busqueda_asignacion_tarea"
                >
                  <span className="rounded-lg bg-sky-100 p-1 text-sky-700">
                    <Search className="h-4 w-4" />
                  </span>
                  Buscar asignacion
                </label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="campo_busqueda_asignacion_tarea"
                    className={inputClass}
                    type="text"
                    placeholder="Responsable, tarea, producto o ID"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                  />
                </div>
              </div>

              <div>
                <label
                  className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-700"
                  htmlFor="selector_estado_asignacion_tarea_consulta"
                >
                  <span className="rounded-lg bg-indigo-100 p-1 text-indigo-700">
                    <ClipboardCheck className="h-4 w-4" />
                  </span>
                  Estado
                </label>
                <select
                  id="selector_estado_asignacion_tarea_consulta"
                  className={selectClass}
                  value={estadoFiltro}
                  onChange={(event) => setEstadoFiltro(event.target.value)}
                >
                  <option value="todos">Todos los estados</option>
                  <option value="1">Pendiente</option>
                  <option value="2">En proceso</option>
                  <option value="5">En pausa</option>
                  <option value="3">Completada</option>
                  <option value="4">Cancelada</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 py-2.5 sm:px-8 sm:py-3">
          {error ? (
            <div className="mb-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {error}
            </div>
          ) : null}

          {successMessage ? (
            <div className="mb-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              {successMessage}
            </div>
          ) : null}

          {asignacionesActuales.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sky-100 text-sky-700">
                <ClipboardCheck className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-slate-900">No se encontraron asignaciones</h3>
              <p className="mt-3 text-sm text-slate-600">
                {searchTerm || estadoFiltro !== 'todos'
                  ? 'Prueba con otro filtro para localizar la asignacion.'
                  : 'Aun no hay asignaciones registradas en el sistema.'}
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
                        <th className="px-4 py-3.5">Responsable</th>
                        <th className="px-4 py-3.5">Tarea</th>
                        <th className="px-4 py-3.5">Producto</th>
                        <th className="px-4 py-3.5">Inicio</th>
                        <th className="px-4 py-3.5">Fin</th>
                        <th className="px-4 py-3.5">Estado</th>
                        <th className="px-4 py-3.5">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white text-sm text-slate-700">
                      {asignacionesActuales.map((asignacion, index) => {
                        const canStart = asignacion.estado === 1 || asignacion.estado === 5;
                        const canPause = asignacion.estado === 2;
                        const canComplete = asignacion.estado === 2;

                        return (
                          <tr
                            key={asignacion.id}
                            className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}
                          >
                            <td className="px-4 py-3.5 font-semibold text-slate-900">#{asignacion.id}</td>
                            <td className="px-4 py-3.5">
                              <div className="min-w-[12rem]">
                                <p className="font-semibold text-slate-900">{asignacion.usuarioNombre}</p>
                                <p className="text-xs text-slate-500">{asignacion.usuarioEmail}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 font-medium text-slate-900">
                              {asignacion.tareaNombre}
                            </td>
                            <td className="px-4 py-3.5">{asignacion.productoNombre}</td>
                            <td className="px-4 py-3.5">{formatDateTime(asignacion.fechaInicio)}</td>
                            <td className="px-4 py-3.5">{formatDateTime(asignacion.fechaFin)}</td>
                            <td className="px-4 py-3.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${getEstadoTheme(asignacion.estado)}`}
                                >
                                  {asignacion.estadoDescripcion}
                                </span>
                                {asignacion.estaVencida ? (
                                  <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                                    <ShieldAlert className="h-3.5 w-3.5" />
                                    Vencida
                                  </span>
                                ) : null}
                              </div>
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <button
                                  id={`boton_iniciar_asignacion_tarea_tabla_${asignacion.id}`}
                                  className="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 transition hover:bg-sky-100 focus:outline-none focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:opacity-50"
                                  onClick={() => handleAction(asignacion.id, 'iniciar')}
                                  disabled={!canStart || actionLoadingId === asignacion.id}
                                >
                                  <PlayCircle className="h-4 w-4" />
                                  Iniciar
                                </button>
                                <button
                                  id={`boton_pausar_asignacion_tarea_tabla_${asignacion.id}`}
                                  className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-100 focus:outline-none focus:ring-4 focus:ring-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                                  onClick={() => handleAction(asignacion.id, 'pausar')}
                                  disabled={!canPause || actionLoadingId === asignacion.id}
                                >
                                  <PauseCircle className="h-4 w-4" />
                                  Pausar
                                </button>
                                <button
                                  id={`boton_completar_asignacion_tarea_tabla_${asignacion.id}`}
                                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 focus:outline-none focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                                  onClick={() => handleAction(asignacion.id, 'completar')}
                                  disabled={!canComplete || actionLoadingId === asignacion.id}
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                  Completar
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

              <div className="grid grid-cols-1 gap-4 lg:hidden">
                {asignacionesActuales.map((asignacion) => {
                  const canStart = asignacion.estado === 1 || asignacion.estado === 5;
                  const canPause = asignacion.estado === 2;
                  const canComplete = asignacion.estado === 2;

                  return (
                    <article
                      key={asignacion.id}
                      className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
                            Asignacion #{asignacion.id}
                          </p>
                          <h3 className="mt-2 text-lg font-bold text-slate-900">{asignacion.tareaNombre}</h3>
                        </div>
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${getEstadoTheme(asignacion.estado)}`}
                        >
                          {asignacion.estadoDescripcion}
                        </span>
                      </div>

                      <dl className="mt-4 grid grid-cols-1 gap-3 text-sm text-slate-600 sm:grid-cols-2">
                        <div>
                          <dt className="inline-flex items-center gap-2 font-semibold text-slate-900">
                            <UserRound className="h-4 w-4 text-sky-700" />
                            Responsable
                          </dt>
                          <dd className="mt-1">{asignacion.usuarioNombre}</dd>
                        </div>
                        <div>
                          <dt className="font-semibold text-slate-900">Producto</dt>
                          <dd className="mt-1">{asignacion.productoNombre}</dd>
                        </div>
                        <div>
                          <dt className="inline-flex items-center gap-2 font-semibold text-slate-900">
                            <Clock3 className="h-4 w-4 text-sky-700" />
                            Inicio
                          </dt>
                          <dd className="mt-1">{formatDateTime(asignacion.fechaInicio)}</dd>
                        </div>
                        <div>
                          <dt className="font-semibold text-slate-900">Fin</dt>
                          <dd className="mt-1">{formatDateTime(asignacion.fechaFin)}</dd>
                        </div>
                      </dl>

                      {asignacion.estaVencida ? (
                        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                          <ShieldAlert className="h-3.5 w-3.5" />
                          Asignacion vencida
                        </div>
                      ) : null}

                      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <button
                          id={`boton_iniciar_asignacion_tarea_tarjeta_${asignacion.id}`}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-700 transition hover:bg-sky-100 focus:outline-none focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:opacity-50"
                          onClick={() => handleAction(asignacion.id, 'iniciar')}
                          disabled={!canStart || actionLoadingId === asignacion.id}
                        >
                          <PlayCircle className="h-4 w-4" />
                          Iniciar
                        </button>
                        <button
                          id={`boton_pausar_asignacion_tarea_tarjeta_${asignacion.id}`}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-100 focus:outline-none focus:ring-4 focus:ring-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                          onClick={() => handleAction(asignacion.id, 'pausar')}
                          disabled={!canPause || actionLoadingId === asignacion.id}
                        >
                          <PauseCircle className="h-4 w-4" />
                          Pausar
                        </button>
                        <button
                          id={`boton_completar_asignacion_tarea_tarjeta_${asignacion.id}`}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 focus:outline-none focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                          onClick={() => handleAction(asignacion.id, 'completar')}
                          disabled={!canComplete || actionLoadingId === asignacion.id}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Completar
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="mt-3 rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <button
                      id="boton_paginacion_anterior_asignacion_tarea"
                      className={`${buttonBaseClass} bg-white px-4 py-3 text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-100 focus:ring-slate-200 boton_paginacion_anterior_asignacion_tarea`}
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
                      id="boton_paginacion_siguiente_asignacion_tarea"
                      className={`${buttonBaseClass} bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_100%)] px-4 py-3 text-white shadow-lg shadow-sky-500/20 focus:ring-sky-200 boton_paginacion_siguiente_asignacion_tarea`}
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPaginas))}
                      disabled={currentPage === totalPaginas}
                    >
                      Siguiente
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <span className="text-sm text-slate-600">
                      Mostrando {asignacionesFiltradas.length === 0 ? 0 : indexOfFirst + 1} a{' '}
                      {Math.min(indexOfLast, asignacionesFiltradas.length)} de {asignacionesFiltradas.length} asignaciones
                    </span>

                    <button
                      id="boton_recargar_asignaciones_tarea"
                      className={`${buttonBaseClass} bg-white px-4 py-3 text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-100 focus:ring-slate-200 boton_recargar_asignaciones_tarea`}
                      onClick={fetchAsignaciones}
                    >
                      <RefreshCw className="h-4 w-4" />
                      Recargar
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="mt-4 flex justify-center md:justify-end">
            <button
              id="boton_volver_menu_tarea_desde_asignaciones"
              className={`${buttonBaseClass} bg-slate-900 px-5 py-3 text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 focus:ring-slate-300 boton_volver_menu_tarea_desde_asignaciones`}
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

export default ConsultarAsignacionesTarea;
