import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Pencil,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  Users,
} from 'lucide-react';
import { apiUrl } from '../../config/api';
import { readCollection } from '../../utils/apiResponse';

const buttonBaseClass =
  'inline-flex items-center justify-center gap-2 rounded-2xl text-sm font-semibold transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60';

function ListarEmpleados() {
  const navigate = useNavigate();
  const [empleados, setEmpleados] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const empleadosPorPagina = 4;

  const fetchEmpleados = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');

      const response = await fetch(apiUrl('/api/User'), {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('No se pudieron cargar los empleados');
      }

      const data = await response.json();
      const usuarios = readCollection(data, ['users', 'items', 'data']);
      setEmpleados(usuarios);
    } catch (fetchError) {
      setError(fetchError.message || 'No se pudieron cargar los empleados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmpleados();
  }, []);

  const uniqueRoles = useMemo(
    () => [...new Set(empleados.flatMap((empleado) => empleado.roles || []))],
    [empleados],
  );

  const empleadosFiltrados = useMemo(() => {
    let filtered = [...empleados];

    if (searchTerm.trim()) {
      const normalizedTerm = searchTerm.toLowerCase();
      filtered = filtered.filter((empleado) => {
        const userName = empleado.userName?.toLowerCase() || '';
        const email = empleado.email?.toLowerCase() || '';
        const phoneNumber = empleado.phoneNumber?.toLowerCase() || '';
        return (
          userName.includes(normalizedTerm) ||
          email.includes(normalizedTerm) ||
          phoneNumber.includes(normalizedTerm)
        );
      });
    }

    if (roleFilter) {
      filtered = filtered.filter((empleado) =>
        (empleado.roles || []).some((role) => role.toLowerCase() === roleFilter.toLowerCase()),
      );
    }

    if (statusFilter) {
      filtered = filtered.filter((empleado) => {
        if (statusFilter === 'activo') return !empleado.lockoutEnabled;
        if (statusFilter === 'bloqueado') return empleado.lockoutEnabled;
        if (statusFilter === 'email_confirmado') return empleado.emailConfirmed;
        if (statusFilter === 'email_pendiente') return !empleado.emailConfirmed;
        if (statusFilter === 'dos_factor') return empleado.twoFactorEnabled;
        return true;
      });
    }

    return filtered;
  }, [empleados, roleFilter, searchTerm, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, statusFilter]);

  const totalPaginas = Math.max(1, Math.ceil(empleadosFiltrados.length / empleadosPorPagina));
  const indexOfLastEmpleado = currentPage * empleadosPorPagina;
  const indexOfFirstEmpleado = indexOfLastEmpleado - empleadosPorPagina;
  const empleadosActuales = empleadosFiltrados.slice(indexOfFirstEmpleado, indexOfLastEmpleado);

  const getEstadoBadgeClass = (empleado) =>
    empleado.lockoutEnabled
      ? 'bg-amber-100 text-amber-800'
      : 'bg-emerald-100 text-emerald-800';

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[74rem] px-4 py-4 sm:px-6">
        <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-[0_24px_60px_-35px_rgba(15,23,42,0.35)]">
          <p className="text-base font-medium text-slate-600">Cargando empleados...</p>
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
            id="boton_reintentar_listado_empleado"
            className={`${buttonBaseClass} mt-6 bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_100%)] px-5 py-3 text-white shadow-lg shadow-sky-500/20 focus:ring-sky-200 boton_reintentar_listado_empleado`}
            onClick={fetchEmpleados}
          >
            <RefreshCw className="h-4 w-4" />
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[132rem] px-4 py-0 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_80px_-32px_rgba(15,23,42,0.35)]">
        <div className="border-b border-slate-200 bg-[linear-gradient(135deg,#eff6ff_0%,#f8fafc_50%,#eef2ff_100%)] px-5 py-1.5 sm:px-8">
          <div className="flex flex-col gap-2 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center rounded-full border border-sky-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
                Gestion de personal
              </span>
              <h2 className="mt-1 text-[1.45rem] font-bold tracking-tight text-slate-900 sm:text-[1.8rem]">
                Lista de Empleados
              </h2>
              <p className="mt-0.5 text-[12px] leading-[1.15rem] text-slate-600">
                Consulta usuarios, revisa sus estados y administra el equipo.
              </p>
            </div>

            <div className="grid w-full gap-1 md:grid-cols-2 xl:max-w-[76rem] xl:grid-cols-4">
              <div className="xl:col-span-2">
                <label
                  className="mb-1.5 inline-flex items-center gap-2 text-[13px] font-semibold text-slate-700"
                  htmlFor="campo_busqueda_empleado"
                >
                  <span className="rounded-lg bg-sky-100 p-1 text-sky-700">
                    <Search className="h-3.5 w-3.5" />
                  </span>
                  Buscar empleado
                </label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <input
                    id="campo_busqueda_empleado"
                    className="w-full rounded-2xl border border-slate-200 bg-white py-1.5 pl-10 pr-4 text-[13px] text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                    type="text"
                    placeholder="Nombre, correo o telefono"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                  />
                </div>
              </div>

              <div>
                <label
                  className="mb-1.5 inline-flex items-center gap-2 text-[13px] font-semibold text-slate-700"
                  htmlFor="selector_rol_empleado"
                >
                  <span className="rounded-lg bg-sky-100 p-1 text-sky-700">
                    <Users className="h-3.5 w-3.5" />
                  </span>
                  Rol
                </label>
                <select
                  id="selector_rol_empleado"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-1.5 text-[13px] text-slate-700 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                  value={roleFilter}
                  onChange={(event) => setRoleFilter(event.target.value)}
                >
                  <option value="">Todos los roles</option>
                  {uniqueRoles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className="mb-1.5 inline-flex items-center gap-2 text-[13px] font-semibold text-slate-700"
                  htmlFor="selector_estado_empleado"
                >
                  <span className="rounded-lg bg-sky-100 p-1 text-sky-700">
                    <ShieldCheck className="h-3.5 w-3.5" />
                  </span>
                  Estado
                </label>
                <select
                  id="selector_estado_empleado"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-1.5 text-[13px] text-slate-700 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="activo">Activos</option>
                  <option value="bloqueado">Bloqueados</option>
                  <option value="email_confirmado">Email confirmado</option>
                  <option value="email_pendiente">Email pendiente</option>
                  <option value="dos_factor">Con 2FA</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 py-1 sm:px-8 sm:py-1">
          {(searchTerm || roleFilter || statusFilter) && (
            <div className="mb-2 flex justify-end">
              <button
                id="boton_limpiar_filtros_empleado"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200 boton_limpiar_filtros_empleado"
                onClick={() => {
                  setSearchTerm('');
                  setRoleFilter('');
                  setStatusFilter('');
                }}
                type="button"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Limpiar filtros
              </button>
            </div>
          )}

          {empleadosActuales.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
              <h3 className="text-xl font-semibold text-slate-900">No se encontraron empleados</h3>
              <p className="mt-3 text-sm text-slate-600">
                {searchTerm || roleFilter || statusFilter
                  ? 'Intenta ajustar los filtros para encontrar coincidencias.'
                  : 'No hay empleados registrados en este momento.'}
              </p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-hidden rounded-[22px] border border-slate-200 xl:block">
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse">
                    <thead className="bg-slate-100">
                      <tr className="text-left text-[11px] font-semibold text-slate-700">
                        <th className="px-4 py-1.5">Usuario</th>
                        <th className="px-4 py-1.5">Correo</th>
                        <th className="px-4 py-1.5">Telefono</th>
                        <th className="px-4 py-1.5">Roles</th>
                        <th className="px-4 py-1.5">Email</th>
                        <th className="px-4 py-1.5">2FA</th>
                        <th className="px-4 py-1.5">Estado</th>
                        <th className="px-4 py-1.5">Intentos</th>
                        <th className="px-4 py-1.5">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white text-[11px] text-slate-700">
                      {empleadosActuales.map((empleado, index) => (
                        <tr key={empleado.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                          <td className="px-4 py-1.5">
                            <div className="min-w-[11rem]">
                              <p className="font-semibold text-slate-900">{empleado.userName}</p>
                              <p className="mt-0.5 text-[10px] text-slate-500">
                                ID {empleado.id?.slice?.(0, 8) || 'N/A'}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-1.5">{empleado.email}</td>
                          <td className="px-4 py-1.5">{empleado.phoneNumber || 'No registrado'}</td>
                          <td className="px-4 py-1.5">
                            <div className="flex flex-wrap gap-1.5">
                              {(empleado.roles || []).length > 0 ? (
                                (empleado.roles || []).map((role) => (
                                  <span
                                    key={`${empleado.id}-${role}`}
                                    className="rounded-full bg-sky-50 px-2.5 py-0.5 text-[10px] font-semibold text-sky-700"
                                  >
                                    {role}
                                  </span>
                                ))
                              ) : (
                                <span className="text-slate-500">Sin roles</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-1.5">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                                empleado.emailConfirmed
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-rose-100 text-rose-700'
                              }`}
                            >
                              {empleado.emailConfirmed ? 'Confirmado' : 'Pendiente'}
                            </span>
                          </td>
                          <td className="px-4 py-1.5">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                                empleado.twoFactorEnabled
                                  ? 'bg-violet-100 text-violet-700'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {empleado.twoFactorEnabled ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="px-4 py-1.5">
                            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${getEstadoBadgeClass(empleado)}`}>
                              {empleado.lockoutEnabled ? 'Bloqueado' : 'Activo'}
                            </span>
                          </td>
                          <td className="px-4 py-1.5">{empleado.accessFailedCount || 0}</td>
                          <td className="px-4 py-1.5">
                            <div className="flex items-center gap-2">
                              <button
                                id={`boton_editar_listado_empleado_tabla_${empleado.id}`}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-sky-200 bg-sky-50 text-sky-700 transition hover:bg-sky-100 focus:outline-none focus:ring-4 focus:ring-sky-100 boton_editar_listado_empleado_tabla"
                                onClick={() => navigate(`/editarEmpleado/${empleado.id}`)}
                                title="Editar empleado"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                id={`boton_eliminar_listado_empleado_tabla_${empleado.id}`}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-700 transition hover:bg-rose-100 focus:outline-none focus:ring-4 focus:ring-rose-100 boton_eliminar_listado_empleado_tabla"
                                onClick={() => navigate(`/eliminarEmpleado/${empleado.id}`)}
                                title="Eliminar empleado"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 xl:hidden">
                {empleadosActuales.map((empleado) => (
                  <article
                    key={empleado.id}
                    className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
                          Empleado
                        </p>
                        <h3 className="mt-2 text-lg font-bold text-slate-900">{empleado.userName}</h3>
                        <p className="mt-1 text-sm text-slate-500">{empleado.email}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getEstadoBadgeClass(empleado)}`}>
                        {empleado.lockoutEnabled ? 'Bloqueado' : 'Activo'}
                      </span>
                    </div>

                    <dl className="mt-4 grid grid-cols-1 gap-3 text-sm text-slate-600 sm:grid-cols-2">
                      <div>
                        <dt className="font-semibold text-slate-900">Telefono</dt>
                        <dd className="mt-1">{empleado.phoneNumber || 'No registrado'}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-slate-900">Intentos fallidos</dt>
                        <dd className="mt-1">{empleado.accessFailedCount || 0}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-slate-900">Email</dt>
                        <dd className="mt-1">{empleado.emailConfirmed ? 'Confirmado' : 'Pendiente'}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-slate-900">2FA</dt>
                        <dd className="mt-1">{empleado.twoFactorEnabled ? 'Activo' : 'Inactivo'}</dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="font-semibold text-slate-900">Roles</dt>
                        <dd className="mt-2 flex flex-wrap gap-2">
                          {(empleado.roles || []).length > 0 ? (
                            (empleado.roles || []).map((role) => (
                              <span
                                key={`${empleado.id}-card-${role}`}
                                className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700"
                              >
                                {role}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-500">Sin roles</span>
                          )}
                        </dd>
                      </div>
                    </dl>

                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                      <button
                        id={`boton_editar_listado_empleado_tarjeta_${empleado.id}`}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-700 transition hover:bg-sky-100 focus:outline-none focus:ring-4 focus:ring-sky-100 boton_editar_listado_empleado_tarjeta"
                        onClick={() => navigate(`/editarEmpleado/${empleado.id}`)}
                      >
                        <Pencil className="h-4 w-4" />
                        Editar
                      </button>
                      <button
                        id={`boton_eliminar_listado_empleado_tarjeta_${empleado.id}`}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 focus:outline-none focus:ring-4 focus:ring-rose-100 boton_eliminar_listado_empleado_tarjeta"
                        onClick={() => navigate(`/eliminarEmpleado/${empleado.id}`)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Eliminar
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-1 rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-1">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <button
                      id="boton_paginacion_anterior_empleado"
                      className={`${buttonBaseClass} bg-white px-4 py-2.5 text-[13px] text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-100 focus:ring-slate-200 boton_paginacion_anterior_empleado`}
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                      Anterior
                    </button>

                    <span className="text-center text-[13px] font-semibold text-slate-700 sm:text-left">
                      Pagina {currentPage} de {totalPaginas}
                    </span>

                    <button
                      id="boton_paginacion_siguiente_empleado"
                      className={`${buttonBaseClass} bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_100%)] px-4 py-2.5 text-[13px] text-white shadow-lg shadow-sky-500/20 focus:ring-sky-200 boton_paginacion_siguiente_empleado`}
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPaginas))}
                      disabled={currentPage === totalPaginas}
                    >
                      Siguiente
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <span className="text-[13px] text-slate-600">
                      Mostrando {empleadosFiltrados.length === 0 ? 0 : indexOfFirstEmpleado + 1} a{' '}
                      {Math.min(indexOfLastEmpleado, empleadosFiltrados.length)} de{' '}
                      {empleadosFiltrados.length} empleados
                    </span>

                    {totalPaginas > 1 ? (
                      <select
                        id="selector_pagina_empleado"
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-medium text-slate-700 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
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

          <div className="mt-3 flex justify-center md:justify-end">
            <button
              id="boton_volver_menu_empleado_desde_listado"
              className={`${buttonBaseClass} bg-slate-900 px-5 py-2.5 text-[13px] text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 focus:ring-slate-300 boton_volver_menu_empleado_desde_listado`}
              onClick={() => navigate('/empleados')}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Volver al Menu Empleados
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ListarEmpleados;
