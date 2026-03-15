import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  Package,
  Plus,
  Save,
  ShoppingBag,
  UserRound,
  Wallet,
  Minus,
} from 'lucide-react';
import { apiUrl } from '../../config/api';
import { readCollection } from '../../utils/apiResponse';

const ORDER_API_URL = apiUrl('/api/Order');
const CUSTOMER_API_URL = apiUrl('/api/Customer');
const PRODUCT_API_URL = apiUrl('/api/Product');

const initialPedidoState = {
  cliente_IdCliente: '',
  fechaEntrega: '',
  estado: 1,
  detallesPedido: [],
};

const initialDetalleState = {
  producto_IdProducto: '',
  cantidad: '',
  precioUnitario: '',
};

const PRODUCTOS_FIJOS = [
  { idProducto: 1, nombreProducto: 'Camiseta Premium Algodon' },
  { idProducto: 2, nombreProducto: 'Pantalon Cargo Ajustado' },
  { idProducto: 3, nombreProducto: 'Chaqueta Denim Clasica' },
  { idProducto: 4, nombreProducto: 'Vestido Midi Floral' },
  { idProducto: 5, nombreProducto: 'Sudadera con Capucha Gris' },
  { idProducto: 6, nombreProducto: 'Zapatillas Deportivas' },
  { idProducto: 7, nombreProducto: 'Falda Plisada Negra' },
  { idProducto: 8, nombreProducto: 'Bufanda de Lana Tejida' },
  { idProducto: 9, nombreProducto: 'Cinturon de Cuero' },
  { idProducto: 10, nombreProducto: 'Calcetines Tobilleros Pack' },
];

const formFieldClass =
  'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100';

const actionButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60';

const FieldLabel = ({ htmlFor, icon: Icon, children }) => (
  <label
    className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-700"
    htmlFor={htmlFor}
  >
    <span className="rounded-lg bg-sky-100 p-1 text-sky-700">
      <Icon className="h-4 w-4" />
    </span>
    {children}
  </label>
);

function RegistrarPedido() {
  const navigate = useNavigate();
  const [pedido, setPedido] = useState({ ...initialPedidoState });
  const [nuevoDetalle, setNuevoDetalle] = useState({ ...initialDetalleState });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(CUSTOMER_API_URL, {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
        const data = await res.json();
        setClientes(readCollection(data, ['clientes', 'customers', 'data']));
      } catch (fetchError) {
        console.error('Error al cargar clientes:', fetchError);
      }
    };
    fetchClientes();
  }, []);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(PRODUCT_API_URL, {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
        const data = await res.json();
        setProductos(readCollection(data, ['productos', 'products', 'data']));
      } catch (fetchError) {
        console.error('Error al cargar productos:', fetchError);
      }
    };
    fetchProductos();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setPedido((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleDetalleChange = (event) => {
    const { name, value } = event.target;
    setNuevoDetalle((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const incrementarCantidad = () => {
    setNuevoDetalle((prev) => ({
      ...prev,
      cantidad: prev.cantidad ? (parseFloat(prev.cantidad) + 1).toString() : '1',
    }));
  };

  const decrementarCantidad = () => {
    setNuevoDetalle((prev) => ({
      ...prev,
      cantidad:
        prev.cantidad && parseFloat(prev.cantidad) > 0
          ? (parseFloat(prev.cantidad) - 1).toString()
          : '0',
    }));
  };

  const handleAddDetalle = () => {
    if (!nuevoDetalle.producto_IdProducto || !nuevoDetalle.cantidad || !nuevoDetalle.precioUnitario) {
      setError('Completa todos los campos del detalle antes de agregar.');
      return;
    }

    const catalogoProductos = productos.length > 0 ? productos : PRODUCTOS_FIJOS;
    const productoSeleccionado = catalogoProductos.find(
      (producto) =>
        Number(producto.idProducto ?? producto.IdProducto) ===
        parseInt(nuevoDetalle.producto_IdProducto, 10),
    );
    const nombreProducto =
      productoSeleccionado?.nombreProducto ||
      productoSeleccionado?.NombreProducto ||
      productoSeleccionado?.nombre ||
      productoSeleccionado?.Nombre ||
      'Producto desconocido';

    setPedido((prev) => ({
      ...prev,
      detallesPedido: [
        ...prev.detallesPedido,
        {
          ...nuevoDetalle,
          nombreProducto,
        },
      ],
    }));
    setNuevoDetalle({ ...initialDetalleState });
    setError('');
  };

  const validateForm = () => {
    if (!pedido.cliente_IdCliente || !pedido.fechaEntrega || pedido.detallesPedido.length === 0) {
      setError('Cliente, fecha de entrega y al menos un detalle son obligatorios.');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const pedidoToSend = {
        ...pedido,
        fechaEntrega: new Date(pedido.fechaEntrega).toISOString(),
      };
      const res = await fetch(ORDER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(pedidoToSend),
      });
      const response = await res.json();
      if (response.isSuccess || response.IsSuccess) {
        alert('Pedido registrado exitosamente!');
        navigate('/pedidos');
      } else {
        setError(response.message || response.Message || 'Error al registrar pedido.');
      }
    } catch (submitError) {
      setError('Ocurrio un error al guardar el pedido. Por favor, intentelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[120rem] px-4 py-1 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_24px_80px_-32px_rgba(15,23,42,0.35)]">
        <div className="border-b border-slate-200 bg-[linear-gradient(135deg,#ecfeff_0%,#eff6ff_55%,#eef2ff_100%)] px-5 py-2.5 sm:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center rounded-full border border-sky-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
              Gestion comercial
            </span>
            <h2 className="mt-2 text-[1.75rem] font-bold tracking-tight text-slate-900 sm:text-[2.05rem]">
              Registrar Pedido
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Completa la informacion del pedido.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-2 sm:px-8 sm:py-2.5">
          {error ? (
            <div className="mb-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {error}
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-1.5 md:grid-cols-2 xl:grid-cols-3">
            <div className="md:col-span-2 xl:col-span-3">
              <FieldLabel htmlFor="campo_cliente_pedido" icon={UserRound}>
                Cliente
              </FieldLabel>
              <select
                id="campo_cliente_pedido"
                className={formFieldClass}
                name="cliente_IdCliente"
                value={pedido.cliente_IdCliente}
                onChange={handleChange}
                required
                disabled={loading}
              >
                <option value="">Seleccione un cliente</option>
                {clientes.map((cliente) => (
                  <option
                    key={cliente.idCliente ?? cliente.IdCliente}
                    value={cliente.idCliente ?? cliente.IdCliente}
                  >
                    {cliente.nombreCliente ?? cliente.NombreCliente}{' '}
                    {cliente.apellidoCliente ?? cliente.ApellidoCliente}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <FieldLabel htmlFor="campo_fecha_entrega_pedido" icon={CalendarDays}>
                Fecha de Entrega
              </FieldLabel>
              <input
                id="campo_fecha_entrega_pedido"
                className={formFieldClass}
                type="date"
                name="fechaEntrega"
                value={pedido.fechaEntrega}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div>
              <FieldLabel htmlFor="campo_producto_pedido" icon={ShoppingBag}>
                Producto
              </FieldLabel>
              <select
                id="campo_producto_pedido"
                className={formFieldClass}
                name="producto_IdProducto"
                value={nuevoDetalle.producto_IdProducto}
                onChange={handleDetalleChange}
                disabled={loading}
              >
                <option value="">Seleccione un producto</option>
                {(productos.length > 0 ? productos : PRODUCTOS_FIJOS).map((producto) => (
                  <option
                    key={producto.idProducto ?? producto.IdProducto}
                    value={producto.idProducto ?? producto.IdProducto}
                  >
                    {producto.nombreProducto ??
                      producto.NombreProducto ??
                      producto.nombre ??
                      producto.Nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <FieldLabel htmlFor="campo_cantidad_pedido" icon={Package}>
                Cantidad
              </FieldLabel>
              <div className="flex items-center gap-3">
                <button
                  id="boton_disminuir_cantidad_pedido"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-200 bg-white text-sky-700 transition hover:bg-sky-50 focus:outline-none focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:opacity-60"
                  type="button"
                  onClick={decrementarCantidad}
                  disabled={loading}
                  aria-label="Disminuir cantidad"
                >
                  <Minus className="h-5 w-5" />
                </button>
                <input
                  id="campo_cantidad_pedido"
                  className={`${formFieldClass} w-24 text-center font-semibold`}
                  type="number"
                  name="cantidad"
                  value={nuevoDetalle.cantidad}
                  onChange={handleDetalleChange}
                  min="0"
                  disabled={loading}
                />
                <button
                  id="boton_aumentar_cantidad_pedido"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-200 bg-white text-sky-700 transition hover:bg-sky-50 focus:outline-none focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:opacity-60"
                  type="button"
                  onClick={incrementarCantidad}
                  disabled={loading}
                  aria-label="Aumentar cantidad"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="xl:col-span-1">
              <FieldLabel htmlFor="campo_precio_unitario_pedido" icon={Wallet}>
                Precio Unitario
              </FieldLabel>
              <input
                id="campo_precio_unitario_pedido"
                className={formFieldClass}
                type="number"
                name="precioUnitario"
                step="0.01"
                value={nuevoDetalle.precioUnitario}
                onChange={handleDetalleChange}
                disabled={loading}
              />
            </div>
          </div>

          <div className="mt-2.5 rounded-[24px] border border-slate-200 bg-slate-50 p-3.5">
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-[15px] font-bold text-slate-900">Detalles del Pedido</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Agrega los productos antes de guardar el pedido.
                </p>
              </div>
              <button
                id="boton_agregar_detalle_pedido"
                className={`${actionButtonClass} bg-[linear-gradient(135deg,#8b5cf6_0%,#7c3aed_100%)] text-white shadow-lg shadow-violet-500/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-500/25 focus:ring-violet-200`}
                type="button"
                onClick={handleAddDetalle}
                disabled={loading}
              >
                <Plus className="h-4 w-4" />
                Agregar Detalle
              </button>
            </div>

            {pedido.detallesPedido.length === 0 ? (
              <div className="mt-2.5 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3.5 text-center text-sm text-slate-500">
                No hay detalles agregados aun.
              </div>
            ) : (
              <div className="mt-2.5 grid grid-cols-1 gap-2">
                {pedido.detallesPedido.map((detalle, index) => (
                  <div
                    key={`${detalle.producto_IdProducto}-${index}`}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{detalle.nombreProducto}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">
                          Producto agregado
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                        <span className="rounded-full bg-sky-50 px-3 py-1 font-medium text-sky-700">
                          Cant: {detalle.cantidad}
                        </span>
                        <span className="rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700">
                          Precio: ${parseFloat(detalle.precioUnitario).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-2.5 flex flex-col-reverse gap-3 border-t border-slate-200 pt-2.5 sm:flex-row sm:justify-end">
            <button
              id="boton_cancelar_pedido"
              className={`${actionButtonClass} border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50 focus:ring-slate-200`}
              type="button"
              onClick={() => navigate('/pedidos')}
              disabled={loading}
            >
              <ArrowLeft className="h-4 w-4" />
              Cancelar
            </button>
            <button
              id="boton_registrar_pedido"
              className={`${actionButtonClass} bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_100%)] text-white shadow-lg shadow-sky-500/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-sky-500/25 focus:ring-sky-200`}
              type="submit"
              disabled={loading}
            >
              <Save className="h-4 w-4" />
              {loading ? 'Guardando...' : 'Registrar Pedido'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default RegistrarPedido;
