import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiUrl } from '../../config/api';
import { readCollection, readValue } from '../../utils/apiResponse';
import { ArrowLeft, CalendarDays, Package, RefreshCw, Save } from 'lucide-react';

const ORDER_API_URL = apiUrl('/api/Order');

const panelClass =
  'mx-auto w-full max-w-[108rem] rounded-[30px] border border-slate-200 bg-white shadow-[0_24px_80px_-32px_rgba(15,23,42,0.35)]';

const buttonBaseClass =
  'inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60';

const inputClass =
  'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100';

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
    fechaEntrega: pedido.fechaEntrega ?? pedido.FechaEntrega ?? '',
    detallesPedido: readCollection(pedido.detallesPedido ?? pedido.DetallesPedido ?? [], []).map(
      normalizeDetalle,
    ),
  };
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

const updatePedido = async (id, updatedData) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${ORDER_API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(updatedData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
    throw new Error(errorData.message || errorData.Message || 'No se pudo actualizar el pedido.');
  }

  return response.json();
};

const EditarPedido = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState(null);
  const [fechaEntrega, setFechaEntrega] = useState('');
  const [detallesPedido, setDetallesPedido] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const cargarPedido = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const pedidoCargado = await fetchPedidoDetalles(id);
      setPedido(pedidoCargado);
      setFechaEntrega(pedidoCargado.fechaEntrega ? pedidoCargado.fechaEntrega.split('T')[0] : '');
      setDetallesPedido(pedidoCargado.detallesPedido);
    } catch (fetchError) {
      setError(fetchError.message || 'No se pudo cargar el pedido.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    cargarPedido();
  }, [cargarPedido]);

  const handleCantidadChange = (index, value) => {
    const cantidad = Math.max(0, Number(value) || 0);
    setDetallesPedido((prev) =>
      prev.map((detalle, detalleIndex) =>
        detalleIndex === index ? { ...detalle, cantidad } : detalle,
      ),
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError('');

      await updatePedido(id, {
        fechaEntrega,
        detallesPedido: detallesPedido.map((detalle) => ({
          idDetallePedido: detalle.idDetallePedido,
          producto_IdProducto: detalle.producto_IdProducto,
          cantidad: detalle.cantidad,
          precioUnitario: detalle.precioUnitario,
        })),
      });

      navigate(`/detallePedido/${id}`);
    } catch (submitError) {
      setError(submitError.message || 'No se pudo actualizar el pedido.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[74rem] px-4 py-4 sm:px-6">
        <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-[0_24px_60px_-35px_rgba(15,23,42,0.35)]">
          <p className="text-base font-medium text-slate-600">Cargando pedido para editar...</p>
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
            id="boton_reintentar_edicion_pedido"
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
    <div className="mx-auto w-full max-w-[112rem] px-4 py-3 sm:px-6 lg:px-8">
      <section className={panelClass}>
        <div className="border-b border-slate-200 bg-[linear-gradient(135deg,#ecfeff_0%,#eff6ff_55%,#eef2ff_100%)] px-5 py-5 sm:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center rounded-full border border-sky-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
              Gestion comercial
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Editar Pedido #{pedido.idPedido}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
              Actualiza la fecha de entrega y las cantidades del pedido con el mismo lenguaje visual de Stock.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-5 sm:px-8">
          {error ? (
            <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {error}
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <section className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
              <label
                className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-700"
                htmlFor="campo_fecha_edicion_pedido"
              >
                <span className="rounded-lg bg-sky-100 p-1 text-sky-700">
                  <CalendarDays className="h-4 w-4" />
                </span>
                Fecha de entrega
              </label>
              <input
                id="campo_fecha_edicion_pedido"
                className={inputClass}
                type="date"
                value={fechaEntrega}
                onChange={(event) => setFechaEntrega(event.target.value)}
                required
              />
            </section>

            <section className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-sky-100 p-1 text-sky-700">
                  <Package className="h-4 w-4" />
                </span>
                <h3 className="text-lg font-bold text-slate-900">Cantidades por producto</h3>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3">
                {detallesPedido.map((detalle, index) => {
                  const detalleId =
                    detalle.idDetallePedido ?? detalle.producto_IdProducto ?? `detalle-${index}`;

                  return (
                    <div
                      key={detalleId}
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{detalle.productoNombre}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">
                            Producto del pedido
                          </p>
                        </div>
                        <div className="w-full sm:w-36">
                          <label
                            className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500"
                            htmlFor={`campo_cantidad_edicion_pedido_${detalleId}`}
                          >
                            Cantidad
                          </label>
                          <input
                            id={`campo_cantidad_edicion_pedido_${detalleId}`}
                            className={`${inputClass} text-center font-semibold`}
                            type="number"
                            min="0"
                            value={detalle.cantidad}
                            onChange={(event) => handleCantidadChange(index, event.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          <div className="mt-5 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
            <button
              id="boton_cancelar_edicion_pedido"
              className={`${buttonBaseClass} border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50 focus:ring-slate-200`}
              type="button"
              onClick={() => navigate(`/detallePedido/${id}`)}
              disabled={saving}
            >
              <ArrowLeft className="h-4 w-4" />
              Cancelar
            </button>
            <button
              id="boton_guardar_edicion_pedido"
              className={`${buttonBaseClass} bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_100%)] text-white shadow-lg shadow-sky-500/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-sky-500/25 focus:ring-sky-200`}
              type="submit"
              disabled={saving}
            >
              <Save className="h-4 w-4" />
              {saving ? 'Guardando...' : 'Actualizar pedido'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default EditarPedido;
