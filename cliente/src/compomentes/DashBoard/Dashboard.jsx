import React, { useEffect, useState } from 'react';
import {
  CalendarClock,
  CheckCircle2,
  Clock3,
  PackageCheck,
  TrendingUp,
  TriangleAlert,
  Users,
} from 'lucide-react';
import { apiUrl } from '../../config/api';

const readValue = (payload, keys, fallback = null) => {
  if (!payload || typeof payload !== 'object') {
    return fallback;
  }

  for (const key of keys) {
    const match = Object.keys(payload).find((candidate) => candidate.toLowerCase() === key.toLowerCase());
    if (match) {
      return payload[match];
    }
  }

  return fallback;
};

const readArray = (payload, keys) => {
  const value = readValue(payload, keys, []);
  return Array.isArray(value) ? value : [];
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatDate = (value) => {
  if (!value) return 'Sin fecha';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Sin fecha' : date.toLocaleDateString();
};

const getDaysRemaining = (value) => {
  if (!value) return null;
  const today = new Date();
  const target = new Date(value);
  if (Number.isNaN(target.getTime())) return null;

  const diffMs = target.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0);
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

const normalizeMetricas = (payload) => {
  const pedidosPendientes = readArray(payload, ['pedidosPendientes']).map((pedido) => ({
    idPedido: readValue(pedido, ['idPedido'], 0),
    clienteNombre: readValue(pedido, ['clienteNombre'], 'Sin cliente'),
    fechaEntrega: readValue(pedido, ['fechaEntrega'], null),
    totalPedido: readValue(pedido, ['totalPedido'], 0),
    porcentajeCompletado: Number(readValue(pedido, ['porcentajeCompletado'], 0)) || 0,
  }));

  const proximoPedido =
    readValue(payload, ['proximoPedido'], null) ||
    pedidosPendientes[0] ||
    null;

  const progresoProximoPedido = readValue(payload, ['progresoProximoPedido'], null);
  const pedidosPorSemestre = readValue(payload, ['pedidosPorSemestre'], {}) || {};

  return {
    totalPedidosActivos: Number(readValue(payload, ['totalPedidosActivos'], 0)) || 0,
    totalPedidosVencidos: Number(readValue(payload, ['totalPedidosVencidos'], 0)) || 0,
    promedioCompletado: Number(readValue(payload, ['promedioCompletado'], 0)) || 0,
    pedidosPendientes,
    proximoPedido: proximoPedido
      ? {
          idPedido: readValue(proximoPedido, ['idPedido'], 0),
          clienteNombre: readValue(proximoPedido, ['clienteNombre'], 'Sin cliente'),
          fechaEntrega: readValue(proximoPedido, ['fechaEntrega'], null),
          totalPedido: readValue(proximoPedido, ['totalPedido'], 0),
          porcentajeCompletado: Number(readValue(proximoPedido, ['porcentajeCompletado'], 0)) || 0,
        }
      : null,
    progresoProximoPedido,
    pedidosPorSemestre,
  };
};

const normalizeAlertas = (payload) =>
  readArray(payload, ['alertas']).map((alerta, index) => ({
    id: readValue(alerta, ['idReferencia'], index),
    tipo: readValue(alerta, ['tipo'], 'General'),
    severidad: readValue(alerta, ['severidad'], 'Media'),
    mensaje: readValue(alerta, ['mensaje'], 'Sin mensaje'),
    fechaEntrega: readValue(alerta, ['fechaEntrega'], null),
    usuario: readValue(alerta, ['usuario'], null),
  }));

const normalizeProductividad = (payload) => {
  if (!payload || typeof payload !== 'object') return null;

  const productividad = readValue(payload, ['productividad'], {});
  const entries = productividad && typeof productividad === 'object' ? Object.entries(productividad) : [];

  return {
    promedioTareasPorUsuario: Number(readValue(payload, ['promedioTareasPorUsuario'], 0)) || 0,
    productividad: entries.map(([usuario, tareas]) => ({
      usuario,
      tareas: Number(tareas) || 0,
    })),
  };
};

const fetchJson = async (url, token, optional = false) => {
  const response = await fetch(url, {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (!response.ok) {
    if (optional) return null;
    const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
    throw new Error(errorData.message || errorData.Message || 'No se pudo cargar el dashboard');
  }

  return response.json();
};

const dashboardCardClass =
  'rounded-[14px] border border-slate-200 bg-white p-2.5 shadow-[0_10px_22px_-20px_rgba(15,23,42,0.22)]';

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [alertas, setAlertas] = useState([]);
  const [productividad, setProductividad] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const today = new Date();
    const fromDate = new Date(today);
    fromDate.setDate(today.getDate() - 30);

    const searchParams = new URLSearchParams({
      fechaInicio: fromDate.toISOString(),
      fechaFin: today.toISOString(),
    });

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError('');

        const [metricasResult, alertasResult, productividadResult] =
          await Promise.allSettled([
            fetchJson(apiUrl('/api/Dashboard/metricas'), token),
            fetchJson(apiUrl('/api/Dashboard/alertas'), token, true),
            fetchJson(
              apiUrl(`/api/Dashboard/productividad-usuarios?${searchParams.toString()}`),
              token,
              true,
            ),
          ]);

        if (metricasResult.status !== 'fulfilled') {
          throw metricasResult.reason;
        }

        setDashboard(normalizeMetricas(metricasResult.value));
        setAlertas(
          alertasResult.status === 'fulfilled' && alertasResult.value
            ? normalizeAlertas(alertasResult.value)
            : [],
        );
        setProductividad(
          productividadResult.status === 'fulfilled'
            ? normalizeProductividad(productividadResult.value)
            : null,
        );
      } catch (fetchError) {
        setError(fetchError.message || 'No se pudo cargar el dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[68rem] px-4 py-3 sm:px-6">
        <div className="rounded-[22px] border border-slate-200 bg-white p-6 text-center shadow-[0_18px_42px_-28px_rgba(15,23,42,0.3)]">
          <p className="text-xs font-medium text-slate-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="mx-auto w-full max-w-[68rem] px-4 py-3 sm:px-6">
        <div className="rounded-[22px] border border-rose-200 bg-white p-6 text-center shadow-[0_18px_42px_-28px_rgba(15,23,42,0.3)]">
          <h2 className="text-xl font-bold text-slate-900">No pudimos cargar el dashboard</h2>
          <p className="mt-2 text-xs text-rose-700">{error || 'Error desconocido'}</p>
        </div>
      </div>
    );
  }

  const proximoPedido = dashboard.proximoPedido;
  const diasRestantes = getDaysRemaining(proximoPedido?.fechaEntrega);
  const semestresOrdenados = Object.entries(dashboard.pedidosPorSemestre || {});
  const semestreMasFuerte = semestresOrdenados.reduce(
    (actual, [semestre, cantidad]) =>
      cantidad > actual.cantidad ? { semestre, cantidad } : actual,
    { semestre: 'Sin datos', cantidad: 0 },
  );
  const totalSemestres = semestresOrdenados.reduce((acc, [, cantidad]) => acc + Number(cantidad || 0), 0);

  const metricas = [
    {
      id: 'tarjeta_pedidos_activos_dashboard',
      label: 'Pedidos activos',
      value: dashboard.totalPedidosActivos,
      helper: 'Pedidos en seguimiento',
      icon: PackageCheck,
      tone: 'from-sky-500 via-blue-600 to-indigo-600',
    },
    {
      id: 'tarjeta_pedidos_vencidos_dashboard',
      label: 'Pedidos vencidos',
      value: dashboard.totalPedidosVencidos,
      helper: 'Requieren atencion inmediata',
      icon: TriangleAlert,
      tone: 'from-rose-500 via-red-500 to-orange-500',
    },
    {
      id: 'tarjeta_promedio_dashboard',
      label: 'Avance promedio',
      value: `${dashboard.promedioCompletado.toFixed(2)}%`,
      helper: 'Promedio de completado',
      icon: TrendingUp,
      tone: 'from-emerald-500 via-green-500 to-teal-500',
    },
  ];

  return (
    <div className="mx-auto w-full max-w-[100rem] px-2 pb-2 pt-8 sm:px-3 sm:pb-3 sm:pt-10 lg:px-4 lg:pt-11">
      <section className="overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_16px_40px_-28px_rgba(15,23,42,0.24)]">
        <div className="border-b border-slate-200 bg-[linear-gradient(135deg,#eff6ff_0%,#f8fafc_50%,#eef2ff_100%)] px-3 py-3 sm:px-4">
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.1fr_0.9fr] xl:items-end">
            <div className="max-w-3xl">
              <span className="inline-flex items-center rounded-full border border-sky-200 bg-white/80 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-sky-700">
                Centro operativo
              </span>
              <h1 className="mt-1.5 text-xl font-bold tracking-tight text-slate-900 sm:text-[1.65rem]">
                Dashboard de Operacion
              </h1>
              <p className="mt-1 text-[11px] leading-4 text-slate-600">
                Un resumen claro de pedidos, riesgos, ventas y productividad.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <div className="rounded-[14px] border border-slate-200 bg-white/90 p-2.5 shadow-sm">
                <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-700">
                  <CalendarClock className="h-3 w-3 text-sky-700" />
                  Proximo pedido
                </div>
                <p className="mt-1 text-[11px] font-semibold text-slate-900">
                  {proximoPedido ? `#${proximoPedido.idPedido}` : 'Sin pedido'}
                </p>
                <p className="mt-0.5 text-[10px] text-slate-500">
                  {proximoPedido ? formatDate(proximoPedido.fechaEntrega) : 'Sin fecha'}
                </p>
              </div>

              <div className="rounded-[14px] border border-slate-200 bg-white/90 p-2.5 shadow-sm">
                <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-700">
                  <Clock3 className="h-3 w-3 text-amber-600" />
                  Cuenta regresiva
                </div>
                <p className="mt-1 text-[11px] font-semibold text-slate-900">
                  {diasRestantes === null ? 'Sin dato' : `${diasRestantes} dias`}
                </p>
                <p className="mt-0.5 text-[10px] text-slate-500">Tiempo restante estimado</p>
              </div>

              <div className="rounded-[14px] border border-slate-200 bg-white/90 p-2.5 shadow-sm">
                <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-700">
                  <Users className="h-3 w-3 text-violet-700" />
                  Equipo
                </div>
                <p className="mt-1 text-[11px] font-semibold text-slate-900">
                  {productividad?.productividad?.length || 0} usuarios
                </p>
                <p className="mt-0.5 text-[10px] text-slate-500">Con productividad registrada</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-3 py-3 sm:px-4">
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3">
            {metricas.map((metrica) => {
              const Icon = metrica.icon;
              return (
                <article
                  id={metrica.id}
                  key={metrica.id}
                  className={`overflow-hidden rounded-[11px] bg-gradient-to-br ${metrica.tone} p-[1px] shadow-[0_8px_16px_-14px_rgba(37,99,235,0.18)]`}
                >
                  <div className="rounded-[10px] bg-slate-950/90 px-2 py-2 text-white">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[9px] font-medium text-slate-300">{metrica.label}</p>
                        <p className="mt-0.5 text-base font-bold tracking-tight">{metrica.value}</p>
                        <p className="mt-0.5 text-[7px] uppercase tracking-[0.1em] text-slate-400">
                          {metrica.helper}
                        </p>
                      </div>
                      <span className="rounded-md bg-white/10 p-1 text-white ring-1 ring-white/10">
                        <Icon className="h-2.5 w-2.5" />
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-2.5 grid grid-cols-1 items-start gap-2.5 xl:grid-cols-[1.12fr_0.88fr]">
            <section className={`${dashboardCardClass} self-start`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Agenda inmediata</h2>
                  <p className="mt-0.5 text-[11px] text-slate-600">
                    Pedidos pendientes con porcentaje de progreso y prioridad visual.
                  </p>
                </div>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
              </div>

              <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-3">
                <div className="rounded-[14px] border border-slate-200 bg-slate-50 p-2.5">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Avance promedio
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-900">
                    {dashboard.promedioCompletado.toFixed(2)}%
                  </p>
                </div>
                <div className="rounded-[14px] border border-slate-200 bg-slate-50 p-2.5">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Avance proximo pedido
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-900">
                    {proximoPedido?.porcentajeCompletado?.toFixed?.(0) ?? 0}%
                  </p>
                </div>
                <div className="rounded-[14px] border border-slate-200 bg-slate-50 p-2.5">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Dias restantes
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-900">
                    {diasRestantes === null ? 'Sin dato' : `${diasRestantes}`}
                  </p>
                </div>
              </div>

              <div className="mt-2.5 grid grid-cols-1 gap-2">
                {dashboard.pedidosPendientes.length === 0 ? (
                  <div className="rounded-[14px] border border-dashed border-slate-300 bg-slate-50 px-3 py-6 text-center text-[11px] text-slate-500">
                    No hay pedidos pendientes para mostrar.
                  </div>
                ) : (
                  dashboard.pedidosPendientes.slice(0, 3).map((pedido) => (
                    <article
                      key={pedido.idPedido}
                      className="rounded-[14px] border border-slate-200 bg-slate-50 p-2.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-sky-700">
                            Pedido #{pedido.idPedido}
                          </p>
                          <h3 className="mt-0.5 text-[11px] font-semibold text-slate-900">
                            {pedido.clienteNombre}
                          </h3>
                        </div>
                        <span className="rounded-full bg-white px-2 py-1 text-[9px] font-semibold text-slate-700 ring-1 ring-slate-200">
                          {pedido.porcentajeCompletado.toFixed(0)}%
                        </span>
                      </div>

                      <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-[linear-gradient(90deg,#0ea5e9_0%,#2563eb_100%)]"
                          style={{ width: `${Math.min(Math.max(pedido.porcentajeCompletado, 0), 100)}%` }}
                        />
                      </div>

                      <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-slate-600">
                        <span>{formatDate(pedido.fechaEntrega)}</span>
                        <span>{formatCurrency(pedido.totalPedido)}</span>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>

            <section className={`${dashboardCardClass} min-w-0 self-start`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Resumen de semestres</h2>
                  <p className="mt-0.5 text-[11px] text-slate-600">
                    Historial resumido y proximo pedido en una misma zona.
                  </p>
                </div>
                <span className="rounded-full bg-violet-50 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-violet-700">
                  Historico
                </span>
              </div>

              <div className="mt-2.5 grid grid-cols-1 gap-2">
                <div className="rounded-[14px] border border-slate-200 bg-slate-50 p-2.5">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Proximo pedido
                  </p>
                  <p className="mt-1 text-[11px] font-bold text-slate-900">
                    {proximoPedido ? `${proximoPedido.clienteNombre}` : 'Sin pedido'}
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-slate-600">
                    <span>{proximoPedido ? formatDate(proximoPedido.fechaEntrega) : 'Sin fecha'}</span>
                    <span>{diasRestantes === null ? 'Sin dato' : `${diasRestantes} dias`}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div className="rounded-[14px] border border-slate-200 bg-slate-50 p-2.5">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Semestre mas fuerte
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-900">{semestreMasFuerte.semestre}</p>
                    <p className="mt-0.5 text-[11px] text-slate-600">{semestreMasFuerte.cantidad} pedidos</p>
                  </div>

                  <div className="rounded-[14px] border border-slate-200 bg-slate-50 p-2.5">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Total historico
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-900">{totalSemestres}</p>
                    <p className="mt-0.5 text-[11px] text-slate-600">Pedidos visibles por semestre</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-1.5">
                  {semestresOrdenados.length === 0 ? (
                    <div className="rounded-[14px] border border-dashed border-slate-300 bg-slate-50 px-3 py-5 text-center text-[11px] text-slate-500">
                      No hay estadisticas por semestre disponibles.
                    </div>
                  ) : (
                    semestresOrdenados.slice(0, 4).map(([semestre, cantidad]) => (
                      <div
                        key={semestre}
                        className="flex items-center justify-between rounded-[12px] border border-slate-200 bg-white px-2.5 py-2"
                      >
                        <span className="text-[11px] font-semibold text-slate-900">{semestre}</span>
                        <span className="rounded-full bg-sky-50 px-2 py-1 text-[9px] font-semibold text-sky-700">
                          {cantidad} pedidos
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
          </div>

        </div>
      </section>
    </div>
  );
}

export default Dashboard;
