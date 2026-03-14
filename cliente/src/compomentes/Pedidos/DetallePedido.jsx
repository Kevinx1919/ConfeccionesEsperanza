import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Package,
  RefreshCw,
  Truck,
  UserRound,
} from 'lucide-react';
import { apiUrl } from '../../config/api';
import { readCollection, readValue } from '../../utils/apiResponse';

const ORDER_API_URL = apiUrl('/api/Order');

const ESTADOS = {
  PENDIENTE: 1,
  EN_PROCESO: 2,
  EN_PRODUCCION: 3,
  COMPLETADO: 4,
  CANCELADO: 5,
  ENTREGADO: 6,
};

const ACCION_A_ESTADO = {
  iniciar: ESTADOS.EN_PROCESO,
  producir: ESTADOS.EN_PRODUCCION,
  completar: ESTADOS.COMPLETADO,
  cancelar: ESTADOS.CANCELADO,
  entregar: ESTADOS.ENTREGADO,
};

const ESTADO_STYLES = {
  1: 'bg-slate-100 text-slate-700',
  2: 'bg-sky-100 text-sky-700',
  3: 'bg-amber-100 text-amber-700',
  4: 'bg-violet-100 text-violet-700',
  5: 'bg-rose-100 text-rose-700',
  6: 'bg-emerald-100 text-emerald-700',
};

const panelClass =
  'mx-auto w-full max-w-[128rem] rounded-[30px] border border-slate-200 bg-white shadow-[0_24px_80px_-32px_rgba(15,23,42,0.35)]';

const buttonBaseClass =
  'inline-flex items-center justify-center gap-1.5 rounded-2xl px-3 py-1.5 text-[10px] font-semibold transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60';

const formatDate = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
};

const formatDateTime = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'N/A' : date.toLocaleString();
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const normalizeDetalle = (detalle) => ({
  idDetallePedido: detalle.idDetallePedido ?? detalle.IdDetallePedido ?? null,
  producto_IdProducto: detalle.producto_IdProducto ?? detalle.Producto_IdProducto ?? null,
  productoNombre: detalle.productoNombre ?? detalle.ProductoNombre ?? 'Producto',
  cantidad: detalle.cantidad ?? detalle.Cantidad ?? 0,
  precioUnitario: detalle.precioUnitario ?? detalle.PrecioUnitario ?? 0,
});

const normalizePedido = (payload) => {
  const pedido = readValue(payload, ['pedido', 'Pedido'], payload) || {};

  return {
    idPedido: pedido.idPedido ?? pedido.IdPedido ?? 0,
    clienteNombre: pedido.clienteNombre ?? pedido.ClienteNombre ?? 'Sin cliente',
    clienteEmail: pedido.clienteEmail ?? pedido.ClienteEmail ?? 'Sin correo',
    fechaRegistro: pedido.fechaRegistro ?? pedido.FechaRegistro ?? null,
    fechaEntrega: pedido.fechaEntrega ?? pedido.FechaEntrega ?? null,
    fechaActualizacion: pedido.fechaActualizacion ?? pedido.FechaActualizacion ?? null,
    estado: pedido.estado ?? pedido.Estado ?? 0,
    estadoDescripcion: pedido.estadoDescripcion ?? pedido.EstadoDescripcion ?? 'Sin estado',
    totalPedido: pedido.totalPedido ?? pedido.TotalPedido ?? 0,
    totalItems: pedido.totalItems ?? pedido.TotalItems ?? 0,
    estaVencido: pedido.estaVencido ?? pedido.EstaVencido ?? false,
    detallesPedido: readCollection(pedido.detallesPedido ?? pedido.DetallesPedido ?? [], []).map(
      normalizeDetalle,
    ),
  };
};

const canTransition = (currentStatus, targetStatus) => {
  if (currentStatus === ESTADOS.ENTREGADO || currentStatus === ESTADOS.CANCELADO) return false;
  if (currentStatus === targetStatus) return false;

  switch (targetStatus) {
    case ESTADOS.EN_PROCESO:
      return currentStatus === ESTADOS.PENDIENTE;
    case ESTADOS.EN_PRODUCCION:
      return currentStatus === ESTADOS.EN_PROCESO;
    case ESTADOS.COMPLETADO:
      return currentStatus === ESTADOS.EN_PRODUCCION;
    case ESTADOS.ENTREGADO:
      return currentStatus === ESTADOS.COMPLETADO;
    case ESTADOS.CANCELADO:
      return currentStatus < ESTADOS.CANCELADO;
    default:
      return false;
  }
};

const fetchPedidoDetalles = async (id) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${ORDER_API_URL}/${id}`, {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (response.status === 404) {
    throw new Error('Pedido no encontrado. Verifica el identificador.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
    throw new Error(errorData.message || errorData.Message || 'No se pudo cargar el pedido.');
  }

  return normalizePedido(await response.json());
};

const updatePedidoStatus = async (id, action) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${ORDER_API_URL}/${id}/${action}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok || !(result.isSuccess || result.IsSuccess)) {
    throw new Error(result.message || result.Message || 'No se pudo actualizar el estado.');
  }

  return normalizePedido(result);
};

const StatusButton = ({ id, label, tone, disabled, onClick }) => {
  const toneClass =
    tone === 'sky'
      ? 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100 focus:ring-sky-100'
      : tone === 'amber'
        ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 focus:ring-amber-100'
        : tone === 'violet'
          ? 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100 focus:ring-violet-100'
          : tone === 'emerald'
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 focus:ring-emerald-100'
            : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 focus:ring-rose-100';

  return (
    <button
      id={id}
      className={`${buttonBaseClass} border ${toneClass}`}
      type="button"
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </button>
  );
};

const DetallePedido = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const cargarPedido = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      setStatusMessage('');
      const pedidoCargado = await fetchPedidoDetalles(id);
      setPedido(pedidoCargado);
    } catch (fetchError) {
      setError(fetchError.message || 'No se pudo cargar el pedido.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    cargarPedido();
  }, [cargarPedido]);

  const handleEstadoChange = async (actionKey) => {
    if (!pedido) return;

    const nuevoEstadoId = ACCION_A_ESTADO[actionKey];
    if (!canTransition(pedido.estado, nuevoEstadoId)) {
      setError(`No se permite cambiar de ${pedido.estadoDescripcion} a la accion seleccionada.`);
      return;
    }

    try {
      setLoading(true);
      setError('');
      setStatusMessage('');
      const pedidoActualizado = await updatePedidoStatus(id, actionKey);
      setPedido(pedidoActualizado);
      setStatusMessage(`Estado actualizado a: ${pedidoActualizado.estadoDescripcion}`);
    } catch (updateError) {
      setError(updateError.message || 'No se pudo actualizar el estado del pedido.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !pedido) {
    return (
      <div className="mx-auto w-full max-w-[74rem] px-4 py-4 sm:px-6">
        <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-[0_24px_60px_-35px_rgba(15,23,42,0.35)]">
          <p className="text-base font-medium text-slate-600">Cargando detalle del pedido...</p>
        </div>
      </div>
    );
  }

  if (error && !pedido) {
    return (
      <div className="mx-auto w-full max-w-[74rem] px-4 py-4 sm:px-6">
        <div className="rounded-[28px] border border-rose-200 bg-white p-8 text-center shadow-[0_24px_60px_-35px_rgba(15,23,42,0.35)]">
          <h2 className="text-2xl font-bold text-slate-900">No pudimos cargar el pedido</h2>
          <p className="mt-3 text-sm text-rose-700">{error}</p>
          <button
            id="boton_reintentar_detalle_pedido"
            className={`${buttonBaseClass} mt-6 bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_100%)] text-white shadow-lg shadow-sky-500/20 focus:ring-sky-200`}
            onClick={cargarPedido}
          >
            <RefreshCw className="h-4 w-4" />
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!pedido) {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-[128rem] px-4 py-1 sm:px-6 lg:px-8">
      <section className={panelClass}>
        <div className="border-b border-slate-200 bg-[linear-gradient(135deg,#eff6ff_0%,#f8fafc_50%,#eef2ff_100%)] px-5 py-2 sm:px-8">
          <div className="flex flex-col gap-1.5 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <span className="inline-flex items-center rounded-full border border-sky-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
                Gestion comercial
              </span>
              <h2 className="mt-1 text-[1.62rem] font-bold tracking-tight text-slate-900 sm:text-[1.82rem]">
                Pedido #{pedido.idPedido}
              </h2>
              <p className="mt-0.5 text-[11px] leading-5 text-slate-600 sm:text-[12px]">
                Revisa la informacion completa del pedido.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.18em] ${
                  ESTADO_STYLES[pedido.estado] ?? 'bg-slate-100 text-slate-700'
                }`}
              >
                {pedido.estadoDescripcion}
              </span>
              {pedido.estaVencido ? (
                <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.18em] text-rose-700">
                  Vencido
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="px-5 py-2.5 sm:px-8">
          {statusMessage ? (
            <div className="mb-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-[10px] font-medium text-emerald-700">
              {statusMessage}
            </div>
          ) : null}

          {error ? (
            <div className="mb-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-1.5 text-[10px] font-medium text-rose-700">
              {error}
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-1.5 xl:grid-cols-[1.4fr_0.92fr]">
            <section className="rounded-[24px] border border-slate-200 bg-slate-50 p-2.5">
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-sky-100 p-1 text-sky-700">
                  <ClipboardList className="h-3 w-3" />
                </span>
                <h3 className="text-[13px] font-bold text-slate-900">Informacion general</h3>
              </div>

              <div className="mt-1.5 grid grid-cols-1 gap-1.5 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-2">
                  <div className="flex items-center gap-2 text-[12px] font-semibold text-slate-700">
                    <UserRound className="h-3 w-3 text-sky-700" />
                    Cliente
                  </div>
                  <p className="mt-0.5 text-[12px] font-semibold text-slate-900">{pedido.clienteNombre}</p>
                  <p className="mt-0.5 text-[11px] text-slate-500">{pedido.clienteEmail}</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-2">
                  <div className="flex items-center gap-2 text-[12px] font-semibold text-slate-700">
                    <Package className="h-3 w-3 text-sky-700" />
                    Totales
                  </div>
                  <p className="mt-0.5 text-[12px] font-semibold text-slate-900">
                    {formatCurrency(pedido.totalPedido)}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-500">{pedido.totalItems} items</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-2">
                  <div className="flex items-center gap-2 text-[12px] font-semibold text-slate-700">
                    <CalendarDays className="h-3 w-3 text-sky-700" />
                    Fechas
                  </div>
                  <p className="mt-0.5 text-[10px] text-slate-700">Registro: {formatDate(pedido.fechaRegistro)}</p>
                  <p className="mt-0.5 text-[10px] text-slate-700">Entrega: {formatDate(pedido.fechaEntrega)}</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-2">
                  <div className="flex items-center gap-2 text-[12px] font-semibold text-slate-700">
                    <Truck className="h-3 w-3 text-sky-700" />
                    Actualizacion
                  </div>
                  <p className="mt-0.5 text-[10px] text-slate-700">{formatDateTime(pedido.fechaActualizacion)}</p>
                </div>
              </div>
            </section>

            <section className="rounded-[24px] border border-slate-200 bg-slate-50 p-2.5">
              <h3 className="text-[13px] font-bold text-slate-900">Gestion de estado</h3>
              <p className="mt-0.5 text-[11px] text-slate-600">
                Los botones solo se habilitan cuando la transicion es valida segun el estado actual.
              </p>

              <div className="mt-1.5 grid grid-cols-1 gap-1.5">
                <StatusButton
                  id="boton_estado_iniciar_pedido"
                  label="Pasar a En proceso"
                  tone="sky"
                  disabled={loading || !canTransition(pedido.estado, ACCION_A_ESTADO.iniciar)}
                  onClick={() => handleEstadoChange('iniciar')}
                />
                <StatusButton
                  id="boton_estado_producir_pedido"
                  label="Pasar a En produccion"
                  tone="amber"
                  disabled={loading || !canTransition(pedido.estado, ACCION_A_ESTADO.producir)}
                  onClick={() => handleEstadoChange('producir')}
                />
                <StatusButton
                  id="boton_estado_completar_pedido"
                  label="Marcar completado"
                  tone="violet"
                  disabled={loading || !canTransition(pedido.estado, ACCION_A_ESTADO.completar)}
                  onClick={() => handleEstadoChange('completar')}
                />
                <StatusButton
                  id="boton_estado_cancelar_pedido"
                  label="Cancelar pedido"
                  tone="rose"
                  disabled={loading || !canTransition(pedido.estado, ACCION_A_ESTADO.cancelar)}
                  onClick={() => handleEstadoChange('cancelar')}
                />
                <StatusButton
                  id="boton_estado_entregar_pedido"
                  label="Marcar entregado"
                  tone="emerald"
                  disabled={loading || !canTransition(pedido.estado, ACCION_A_ESTADO.entregar)}
                  onClick={() => handleEstadoChange('entregar')}
                />
              </div>
            </section>
          </div>

          <section className="mt-2.5 rounded-[24px] border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-5 py-2">
              <h3 className="text-[13px] font-bold text-slate-900">Productos solicitados</h3>
              <p className="mt-0.5 text-[11px] text-slate-600">
                Detalle de los items incluidos en este pedido.
              </p>
            </div>

            {pedido.detallesPedido.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-slate-500">
                Este pedido no tiene detalles cargados.
              </div>
            ) : (
              <>
                <div className="hidden overflow-x-auto md:block">
                  <table className="min-w-full border-collapse">
                    <thead className="bg-slate-100">
                      <tr className="text-left text-[10px] font-semibold text-slate-700">
                        <th className="px-4 py-2">Producto</th>
                        <th className="px-4 py-2">Cantidad</th>
                        <th className="px-4 py-2">Precio unitario</th>
                        <th className="px-4 py-2">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white text-[10px] text-slate-700">
                      {pedido.detallesPedido.map((detalle, index) => (
                        <tr key={detalle.idDetallePedido ?? `${detalle.producto_IdProducto}-${index}`}>
                          <td className="px-4 py-2 font-medium text-slate-900">{detalle.productoNombre}</td>
                          <td className="px-4 py-2">{detalle.cantidad}</td>
                          <td className="px-4 py-2">{formatCurrency(detalle.precioUnitario)}</td>
                          <td className="px-4 py-2 font-semibold text-slate-900">
                            {formatCurrency(detalle.cantidad * detalle.precioUnitario)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-1 gap-1.5 p-3 md:hidden">
                  {pedido.detallesPedido.map((detalle, index) => (
                    <article
                      key={detalle.idDetallePedido ?? `${detalle.producto_IdProducto}-${index}`}
                      className="rounded-[20px] border border-slate-200 bg-slate-50 p-2"
                    >
                      <h4 className="text-[12px] font-semibold text-slate-900">{detalle.productoNombre}</h4>
                      <dl className="mt-1 grid grid-cols-1 gap-1 text-[10px] text-slate-600">
                        <div className="flex items-center justify-between gap-3">
                          <dt className="font-semibold text-slate-900">Cantidad</dt>
                          <dd>{detalle.cantidad}</dd>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <dt className="font-semibold text-slate-900">Precio unitario</dt>
                          <dd>{formatCurrency(detalle.precioUnitario)}</dd>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <dt className="font-semibold text-slate-900">Subtotal</dt>
                          <dd className="font-semibold text-slate-900">
                            {formatCurrency(detalle.cantidad * detalle.precioUnitario)}
                          </dd>
                        </div>
                      </dl>
                    </article>
                  ))}
                </div>
              </>
            )}
          </section>

          <div className="mt-2.5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              id="boton_volver_detalle_pedido"
              className={`${buttonBaseClass} border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50 focus:ring-slate-200`}
              type="button"
              onClick={() => navigate('/consultarPedido')}
            >
              <ArrowLeft className="h-3 w-3" />
              Volver a consultar
            </button>
            <button
              id="boton_editar_desde_detalle_pedido"
              className={`${buttonBaseClass} bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_100%)] text-white shadow-lg shadow-sky-500/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-sky-500/25 focus:ring-sky-200`}
              type="button"
              onClick={() => navigate(`/editarPedido/${pedido.idPedido}`)}
            >
              <CheckCircle2 className="h-3 w-3" />
              Editar pedido
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DetallePedido;
