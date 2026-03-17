import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Eye,
  Filter,
  Pencil,
  RefreshCw,
  Search,
  UserRound,
} from 'lucide-react';
import { apiUrl } from '../../config/api';
import { readCollection, readValue } from '../../utils/apiResponse';

const ORDER_API_URL = apiUrl('/api/Order');

const panelClass =
  'mx-auto w-full max-w-[122rem] rounded-[30px] border border-slate-200 bg-white shadow-[0_24px_80px_-32px_rgba(15,23,42,0.35)]';

const buttonBaseClass =
  'inline-flex items-center justify-center gap-2 rounded-2xl text-[13px] font-semibold transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60';

const inputClass =
  'w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-[13px] text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100';

const labelClass = 'mb-1.5 inline-flex items-center gap-2 text-[13px] font-semibold text-slate-700';

const ESTADOS_PEDIDO = {
  1: { label: 'Pendiente', className: 'bg-slate-100 text-slate-700' },
  2: { label: 'En proceso', className: 'bg-sky-100 text-sky-700' },
  3: { label: 'En produccion', className: 'bg-amber-100 text-amber-700' },
  4: { label: 'Completado', className: 'bg-violet-100 text-violet-700' },
  5: { label: 'Cancelado', className: 'bg-rose-100 text-rose-700' },
  6: { label: 'Entregado', className: 'bg-emerald-100 text-emerald-700' },
};

const initialFilters = {
  clienteId: '',
  estado: '',
  fechaDesde: '',
  fechaHasta: '',
  estaVencido: '',
};

const buildQueryString = ({
  clienteId = '',
  estado = '',
  fechaDesde = '',
  fechaHasta = '',
  estaVencido = '',
  pageNumber = 1,
  pageSize = 10,
}) => {
  const params = new URLSearchParams();

  if (clienteId) params.append('ClienteId', clienteId);
  if (estado) params.append('Estado', estado);
  if (fechaDesde) params.append('FechaDesde', fechaDesde);
  if (fechaHasta) params.append('FechaHasta', fechaHasta);
  if (estaVencido !== '') params.append('EstaVencido', estaVencido);
  params.append('PageNumber', pageNumber);
  params.append('PageSize', pageSize);

  return params.toString();
};

const normalizePedido = (pedido) => ({
  idPedido: pedido.idPedido ?? pedido.IdPedido ?? 0,
  clienteNombre: pedido.clienteNombre ?? pedido.ClienteNombre ?? 'Sin cliente',
  clienteEmail: pedido.clienteEmail ?? pedido.ClienteEmail ?? 'Sin correo',
  fechaRegistro: pedido.fechaRegistro ?? pedido.FechaRegistro ?? null,
  fechaEntrega: pedido.fechaEntrega ?? pedido.FechaEntrega ?? null,
  estado: pedido.estado ?? pedido.Estado ?? 0,
  estadoDescripcion:
    pedido.estadoDescripcion ??
    pedido.EstadoDescripcion ??
    ESTADOS_PEDIDO[pedido.estado ?? pedido.Estado]?.label ??
    'Sin estado',
  totalPedido: pedido.totalPedido ?? pedido.TotalPedido ?? 0,
  totalItems: pedido.totalItems ?? pedido.TotalItems ?? 0,
  estaVencido: pedido.estaVencido ?? pedido.EstaVencido ?? false,
});

const formatDate = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const getEstadoBadge = (estadoId, estadoDescripcion) => {
  const stateConfig = ESTADOS_PEDIDO[estadoId] ?? {
    label: estadoDescripcion || 'Sin estado',
    className: 'bg-slate-100 text-slate-700',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${stateConfig.className}`}
    >
      {estadoDescripcion || stateConfig.label}
    </span>
  );
};

const FieldLabel = ({ htmlFor, icon: Icon, children }) => (
  <label className={labelClass} htmlFor={htmlFor}>
    <span className="rounded-lg bg-sky-100 p-1 text-sky-700">
      <Icon className="h-3.5 w-3.5" />
    </span>
    {children}
  </label>
);

const ConsultarPedido = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ ...initialFilters });
  const [appliedFilters, setAppliedFilters] = useState({ ...initialFilters });
  const [currentPage, setCurrentPage] = useState(1);
  const [pedidos, setPedidos] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const pedidosPorPagina = 3;
  const totalPaginas = Math.max(1, Math.ceil(totalCount / pedidosPorPagina));
  const inicio = totalCount === 0 ? 0 : (currentPage - 1) * pedidosPorPagina + 1;
  const fin = totalCount === 0 ? 0 : Math.min(currentPage * pedidosPorPagina, totalCount);

  const fetchPedidos = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      const queryString = buildQueryString({
        ...appliedFilters,
        pageNumber: currentPage,
        pageSize: pedidosPorPagina,
      });

      const response = await fetch(`${ORDER_API_URL}?${queryString}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: 'Error desconocido del servidor' }));
        throw new Error(errorData.message || errorData.Message || 'Error al obtener los pedidos');
      }

      const data = await response.json();
      const fetchedPedidos = readCollection(data, ['pedidos', 'orders', 'items', 'data'])
        .map(normalizePedido)
        .sort((pedidoA, pedidoB) => pedidoB.idPedido - pedidoA.idPedido);

      setPedidos(fetchedPedidos);
      setTotalCount(Number(readValue(data, ['totalCount', 'TotalCount'], 0)) || 0);
    } catch (fetchError) {
      setError(fetchError.message || 'No se pudieron cargar los pedidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedFilters, currentPage]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const aplicarFiltros = () => {
    setCurrentPage(1);
    setAppliedFilters({ ...filters });
  };

  const limpiarFiltros = () => {
    setFilters({ ...initialFilters });
    setCurrentPage(1);
    setAppliedFilters({ ...initialFilters });
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[74rem] px-4 py-4 sm:px-6">
        <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-[0_24px_60px_-35px_rgba(15,23,42,0.35)]">
          <p className="text-base font-medium text-slate-600">Cargando pedidos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-[74rem] px-4 py-4 sm:px-6">
        <div className="rounded-[28px] border border-rose-200 bg-white p-8 text-center shadow-[0_24px_60px_-35px_rgba(15,23,42,0.35)]">
          <h2 className="text-2xl font-bold text-slate-900">No pudimos cargar los pedidos</h2>
          <p className="mt-3 text-sm text-rose-700">{error}</p>
          <button
            id="boton_reintentar_consulta_pedido"
            className={`${buttonBaseClass} mt-6 bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_100%)] px-5 py-3 text-white shadow-lg shadow-sky-500/20 focus:ring-sky-200`}
            onClick={fetchPedidos}
          >
            <RefreshCw className="h-4 w-4" />
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[122rem] px-4 py-2 sm:px-6 lg:px-8">
      <section className={panelClass}>
        <div className="border-b border-slate-200 bg-[linear-gradient(135deg,#eff6ff_0%,#f8fafc_50%,#eef2ff_100%)] px-5 py-2.5 sm:px-8">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <span className="inline-flex items-center rounded-full border border-sky-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
                Gestion comercial
              </span>
              <h2 className="mt-2 text-[1.75rem] font-bold tracking-tight text-slate-900 sm:text-[2rem]">
                Lista de Pedidos
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-600 sm:text-[15px]">
                Consulta pedidos, aplica filtros.
              </p>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white/90 p-3 shadow-sm">
              <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 xl:grid-cols-5">
                <div>
                  <FieldLabel htmlFor="campo_filtro_cliente_pedido" icon={UserRound}>
                    ID Cliente
                  </FieldLabel>
                  <input
                    id="campo_filtro_cliente_pedido"
                    className={inputClass}
                    type="text"
                    name="clienteId"
                    placeholder="Ej: 12"
                    value={filters.clienteId}
                    onChange={handleFilterChange}
                  />
                </div>

                <div>
                  <FieldLabel htmlFor="campo_filtro_estado_pedido" icon={Filter}>
                    Estado
                  </FieldLabel>
                  <select
                    id="campo_filtro_estado_pedido"
                    className={inputClass}
                    name="estado"
                    value={filters.estado}
                    onChange={handleFilterChange}
                  >
                    <option value="">Todos los estados</option>
                    <option value="1">Pendiente</option>
                    <option value="2">En proceso</option>
                    <option value="3">En produccion</option>
                    <option value="4">Completado</option>
                    <option value="5">Cancelado</option>
                    <option value="6">Entregado</option>
                  </select>
                </div>

                <div>
                  <FieldLabel htmlFor="campo_filtro_fecha_desde_pedido" icon={CalendarDays}>
                    Fecha desde
                  </FieldLabel>
                  <input
                    id="campo_filtro_fecha_desde_pedido"
                    className={inputClass}
                    type="date"
                    name="fechaDesde"
                    value={filters.fechaDesde}
                    onChange={handleFilterChange}
                  />
                </div>

                <div>
                  <FieldLabel htmlFor="campo_filtro_fecha_hasta_pedido" icon={CalendarDays}>
                    Fecha hasta
                  </FieldLabel>
                  <input
                    id="campo_filtro_fecha_hasta_pedido"
                    className={inputClass}
                    type="date"
                    name="fechaHasta"
                    value={filters.fechaHasta}
                    onChange={handleFilterChange}
                  />
                </div>

                <div>
                  <FieldLabel htmlFor="campo_filtro_vencido_pedido" icon={AlertTriangle}>
                    Vencimiento
                  </FieldLabel>
                  <select
                    id="campo_filtro_vencido_pedido"
                    className={inputClass}
                    name="estaVencido"
                    value={filters.estaVencido}
                    onChange={handleFilterChange}
                  >
                    <option value="">Todos</option>
                    <option value="true">Solo vencidos</option>
                    <option value="false">Solo no vencidos</option>
                  </select>
                </div>
              </div>

              <div className="mt-2.5 flex flex-col gap-2.5 sm:flex-row sm:justify-end">
                <button
                  id="boton_limpiar_filtros_pedido"
                  className={`${buttonBaseClass} border border-slate-300 bg-white px-4 py-2.5 text-slate-700 hover:border-slate-400 hover:bg-slate-50 focus:ring-slate-200`}
                  onClick={limpiarFiltros}
                  type="button"
                >
                  <RefreshCw className="h-4 w-4" />
                  Limpiar filtros
                </button>
                <button
                  id="boton_aplicar_filtros_pedido"
                  className={`${buttonBaseClass} bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_100%)] px-4 py-2.5 text-white shadow-lg shadow-sky-500/20 focus:ring-sky-200`}
                  onClick={aplicarFiltros}
                  type="button"
                >
                  <Search className="h-4 w-4" />
                  Aplicar filtros
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 py-2.5 sm:px-8 sm:py-3">
          {pedidos.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sky-100 text-sky-700">
                <ClipboardList className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-slate-900">No se encontraron pedidos</h3>
              <p className="mt-3 text-sm text-slate-600">
                Ajusta los filtros o revisa si hay pedidos registrados en la API.
              </p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-hidden rounded-[24px] border border-slate-200 md:block">
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse">
                    <thead className="bg-slate-100">
                      <tr className="text-left text-[13px] font-semibold text-slate-700">
                        <th className="px-4 py-3">ID</th>
                        <th className="px-4 py-3">Cliente</th>
                        <th className="px-4 py-3">Correo</th>
                        <th className="px-4 py-3">Registro</th>
                        <th className="px-4 py-3">Entrega</th>
                        <th className="px-4 py-3">Estado</th>
                        <th className="px-4 py-3">Total</th>
                        <th className="px-4 py-3">Items</th>
                        <th className="px-4 py-3">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white text-[13px] text-slate-700">
                      {pedidos.map((pedido, index) => (
                        <tr
                          key={pedido.idPedido}
                          className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}
                        >
                          <td className="px-4 py-3 font-semibold text-slate-900">#{pedido.idPedido}</td>
                          <td className="px-4 py-3">{pedido.clienteNombre}</td>
                          <td className="px-4 py-3">{pedido.clienteEmail}</td>
                          <td className="px-4 py-3">{formatDate(pedido.fechaRegistro)}</td>
                          <td className="px-4 py-3">{formatDate(pedido.fechaEntrega)}</td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap items-center gap-2">
                              {getEstadoBadge(pedido.estado, pedido.estadoDescripcion)}
                              {pedido.estaVencido ? (
                                <span className="rounded-full bg-rose-50 px-3 py-1 text-[11px] font-semibold text-rose-700">
                                  Vencido
                                </span>
                              ) : null}
                            </div>
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-900">
                            {formatCurrency(pedido.totalPedido)}
                          </td>
                          <td className="px-4 py-3">{pedido.totalItems}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                id={`boton_detalle_pedido_tabla_${pedido.idPedido}`}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-sky-200 bg-sky-50 text-sky-700 transition hover:bg-sky-100 focus:outline-none focus:ring-4 focus:ring-sky-100"
                                onClick={() => navigate(`/detallePedido/${pedido.idPedido}`)}
                                title="Ver detalle"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                              <button
                                id={`boton_editar_pedido_tabla_${pedido.idPedido}`}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-700 transition hover:bg-amber-100 focus:outline-none focus:ring-4 focus:ring-amber-100"
                                onClick={() => navigate(`/editarPedido/${pedido.idPedido}`)}
                                title="Editar pedido"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:hidden">
                {pedidos.map((pedido) => (
                  <article
                    key={pedido.idPedido}
                    className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
                          Pedido #{pedido.idPedido}
                        </p>
                        <h3 className="mt-2 text-lg font-bold text-slate-900">{pedido.clienteNombre}</h3>
                        <p className="mt-1 text-sm text-slate-500">{pedido.clienteEmail}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getEstadoBadge(pedido.estado, pedido.estadoDescripcion)}
                        {pedido.estaVencido ? (
                          <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                            Vencido
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <dl className="mt-4 grid grid-cols-1 gap-3 text-sm text-slate-600 sm:grid-cols-2">
                      <div>
                        <dt className="font-semibold text-slate-900">Fecha registro</dt>
                        <dd className="mt-1">{formatDate(pedido.fechaRegistro)}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-slate-900">Fecha entrega</dt>
                        <dd className="mt-1">{formatDate(pedido.fechaEntrega)}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-slate-900">Total</dt>
                        <dd className="mt-1">{formatCurrency(pedido.totalPedido)}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-slate-900">Items</dt>
                        <dd className="mt-1">{pedido.totalItems}</dd>
                      </div>
                    </dl>

                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                      <button
                        id={`boton_detalle_pedido_tarjeta_${pedido.idPedido}`}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-700 transition hover:bg-sky-100 focus:outline-none focus:ring-4 focus:ring-sky-100"
                        onClick={() => navigate(`/detallePedido/${pedido.idPedido}`)}
                      >
                        <Eye className="h-4 w-4" />
                        Ver detalle
                      </button>
                      <button
                        id={`boton_editar_pedido_tarjeta_${pedido.idPedido}`}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-100 focus:outline-none focus:ring-4 focus:ring-amber-100"
                        onClick={() => navigate(`/editarPedido/${pedido.idPedido}`)}
                      >
                        <Pencil className="h-4 w-4" />
                        Editar
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-2.5 rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-2.5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <button
                      id="boton_paginacion_anterior_pedido"
                      className={`${buttonBaseClass} bg-white px-4 py-2.5 text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-100 focus:ring-slate-200`}
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                      Anterior
                    </button>

                    <span className="text-center text-sm font-semibold text-slate-700 sm:text-left">
                      Pagina {currentPage} de {totalPaginas}
                    </span>

                    <button
                      id="boton_paginacion_siguiente_pedido"
                      className={`${buttonBaseClass} bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_100%)] px-4 py-2.5 text-white shadow-lg shadow-sky-500/20 focus:ring-sky-200`}
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPaginas))}
                      disabled={currentPage === totalPaginas}
                    >
                      Siguiente
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <span className="text-sm text-slate-600">
                      Mostrando {inicio} a {fin} de {totalCount} pedidos
                    </span>

                    {totalPaginas > 1 ? (
                      <select
                        id="selector_pagina_pedido"
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
              id="boton_volver_menu_desde_consulta_pedido"
              className={`${buttonBaseClass} bg-slate-900 px-5 py-2.5 text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 focus:ring-slate-300`}
              onClick={() => navigate('/pedidos')}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Volver al Menu Pedidos
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ConsultarPedido;
