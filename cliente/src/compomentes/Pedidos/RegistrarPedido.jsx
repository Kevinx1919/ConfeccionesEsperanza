import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiUrl } from '../../config/api';
import { readCollection } from '../../utils/apiResponse';
import './Pedido.css';

const ORDER_API_URL = apiUrl('/api/Order');
const CUSTOMER_API_URL = apiUrl('/api/Customer');
const PRODUCT_API_URL = apiUrl('/api/Product');

const initialPedidoState = {
  cliente_IdCliente: '',
  fechaEntrega: '',
  estado: 1,
  detallesPedido: []
};

const initialDetalleState = {
  producto_IdProducto: '',
  cantidad: '',
  precioUnitario: ''
};
const PRODUCTOS_FIJOS = [
  { idProducto: 1, nombreProducto: 'Camiseta Premium Algodón' },
  { idProducto: 2, nombreProducto: 'Pantalón Cargo Ajustado' },
  { idProducto: 3, nombreProducto: 'Chaqueta Denim Clásica' },
  { idProducto: 4, nombreProducto: 'Vestido Midi Floral' },
  { idProducto: 5, nombreProducto: 'Sudadera con Capucha Gris' },
  { idProducto: 6, nombreProducto: 'Zapatillas Deportivas' },
  { idProducto: 7, nombreProducto: 'Falda Plisada Negra' },
  { idProducto: 8, nombreProducto: 'Bufanda de Lana Tejida' },
  { idProducto: 9, nombreProducto: 'Cinturón de Cuero' },
  { idProducto: 10, nombreProducto: 'Calcetines Tobilleros Pack' }
];

function RegistrarPedido() {
  const navigate = useNavigate();
  const [pedido, setPedido] = useState({ ...initialPedidoState });
  const [nuevoDetalle, setNuevoDetalle] = useState({ ...initialDetalleState });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);

  // Cargar clientes
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(CUSTOMER_API_URL, {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          }
        });
        const data = await res.json();
        setClientes(readCollection(data, ['clientes', 'customers', 'data']));
      } catch (err) {
        console.error('Error al cargar clientes:', err);
      }
    };
    fetchClientes();
  }, []);
  

  // Cargar productos
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(PRODUCT_API_URL, {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          }
        });
        const data = await res.json();
        setProductos(readCollection(data, ['productos', 'products', 'data']));
      } catch (err) {
        console.error('Error al cargar productos:', err);
      }
    };
    fetchProductos();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPedido(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleDetalleChange = (e) => {
    const { name, value } = e.target;
    setNuevoDetalle(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const incrementarCantidad = () => {
    setNuevoDetalle(prev => ({
      ...prev,
      cantidad: prev.cantidad ? (parseFloat(prev.cantidad) + 1).toString() : '1'
    }));
  };

  const decrementarCantidad = () => {
    setNuevoDetalle(prev => ({
      ...prev,
      cantidad: prev.cantidad && parseFloat(prev.cantidad) > 0 
        ? (parseFloat(prev.cantidad) - 1).toString() 
        : '0'
    }));
  };

  const handleAddDetalle = () => {
    if (!nuevoDetalle.producto_IdProducto || !nuevoDetalle.cantidad || !nuevoDetalle.precioUnitario) {
      setError('Completa todos los campos del detalle antes de agregar.');
      return;
    }

    // usar la lista fija (PRODUCTOS_FIJOS) en lugar de `productos` (vacía)
    const catalogoProductos = productos.length > 0 ? productos : PRODUCTOS_FIJOS;
    const productoSeleccionado = catalogoProductos.find(
      (producto) => Number(producto.idProducto ?? producto.IdProducto) === parseInt(nuevoDetalle.producto_IdProducto, 10)
    );
    const nombreProducto =
      productoSeleccionado?.nombreProducto ||
      productoSeleccionado?.NombreProducto ||
      productoSeleccionado?.nombre ||
      productoSeleccionado?.Nombre ||
      'Producto desconocido';

    setPedido(prev => ({
      ...prev,
      detallesPedido: [...prev.detallesPedido, {
        ...nuevoDetalle,
        nombreProducto
      }]
    }));
    setNuevoDetalle({ ...initialDetalleState });
    setError('');
  };

  const validateForm = () => {
    if (
      !pedido.cliente_IdCliente ||
      !pedido.fechaEntrega ||
      pedido.detallesPedido.length === 0
    ) {
      setError('Cliente, fecha de entrega y al menos un detalle son obligatorios.');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const pedidoToSend = {
        ...pedido,
        fechaEntrega: new Date(pedido.fechaEntrega).toISOString()
      };
      const res = await fetch(ORDER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(pedidoToSend)
      });
      const response = await res.json();
      if (response.isSuccess || response.IsSuccess) {
        alert('Pedido registrado exitosamente!');
        navigate('/pedidos');
      } else {
        setError(response.message || response.Message || 'Error al registrar pedido.');
      }
    } catch (err) {
      setError('Ocurrió un error al guardar el pedido. Por favor, inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-formulario-contenedor">
      <form onSubmit={handleSubmit} className="p-formulario">
        <h2 className="p-formulario-titulo">Registrar Pedido</h2>

        {error && <div className="p-formulario-mensaje-error">{error}</div>}

        <div className="p-formulario-grupo-campos">
          <div className="p-formulario-campo p-formulario-campo--ancho-completo">
            <label className="p-formulario-etiqueta" htmlFor="campo_cliente_pedido">
              Cliente
            </label>
            <select
              id="campo_cliente_pedido"
              className="p-formulario-select"
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
                  {cliente.nombreCliente ?? cliente.NombreCliente} {cliente.apellidoCliente ?? cliente.ApellidoCliente}
                </option>
              ))}
            </select>
          </div>

          <div className="p-formulario-campo">
            <label className="p-formulario-etiqueta" htmlFor="campo_fecha_entrega_pedido">
              Fecha de Entrega
            </label>
            <input
              id="campo_fecha_entrega_pedido"
              className="p-formulario-control"
              type="date"
              name="fechaEntrega"
              value={pedido.fechaEntrega}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="p-formulario-campo">
            <label className="p-formulario-etiqueta" htmlFor="campo_producto_pedido">
              Producto
            </label>
            <select
              id="campo_producto_pedido"
              className="p-formulario-select"
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
                  {producto.nombreProducto ?? producto.NombreProducto ?? producto.nombre ?? producto.Nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="p-formulario-campo">
            <label className="p-formulario-etiqueta" htmlFor="campo_cantidad_pedido">
              Cantidad
            </label>
            <div className="p-formulario-contador">
              <button
                id="boton_disminuir_cantidad_pedido"
                className="p-formulario-boton-contador"
                type="button"
                onClick={decrementarCantidad}
                disabled={loading}
                aria-label="Disminuir cantidad"
              >
                -
              </button>
              <input
                id="campo_cantidad_pedido"
                className="p-formulario-control p-formulario-control--cantidad"
                type="number"
                name="cantidad"
                value={nuevoDetalle.cantidad}
                onChange={handleDetalleChange}
                min="0"
                disabled={loading}
              />
              <button
                id="boton_aumentar_cantidad_pedido"
                className="p-formulario-boton-contador"
                type="button"
                onClick={incrementarCantidad}
                disabled={loading}
                aria-label="Aumentar cantidad"
              >
                +
              </button>
            </div>
          </div>

          <div className="p-formulario-campo">
            <label className="p-formulario-etiqueta" htmlFor="campo_precio_unitario_pedido">
              Precio Unitario
            </label>
            <input
              id="campo_precio_unitario_pedido"
              className="p-formulario-control"
              type="number"
              name="precioUnitario"
              step="0.01"
              value={nuevoDetalle.precioUnitario}
              onChange={handleDetalleChange}
              disabled={loading}
            />
          </div>
        </div>

        <div className="p-formulario-detalles">
          <h3 className="p-formulario-subtitulo">Detalles del Pedido</h3>
          {pedido.detallesPedido.length === 0 ? (
            <p className="p-formulario-sin-detalles">No hay detalles agregados aún</p>
          ) : (
            <div className="p-formulario-lista-detalles">
              {pedido.detallesPedido.map((det, idx) => (
                <div key={idx} className="p-formulario-detalle-item">
                  <div className="p-formulario-detalle-info">
                    <strong>{det.nombreProducto}</strong>
                  </div>
                  <div className="p-formulario-detalle-valores">
                    <span>Cant: {det.cantidad}</span>
                    <span>Precio: ${parseFloat(det.precioUnitario).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-formulario-acciones">
          <button
            id="boton_agregar_detalle_pedido"
            className="p-form-boton-agregar"
            type="button"
            onClick={handleAddDetalle}
            disabled={loading}
          >
            Agregar Detalle
          </button>
        </div>

        <div className="p-formulario-acciones-finales">
          <button
            id="boton_registrar_pedido"
            className="p-form-boton-principal"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Registrar Pedido'}
          </button>
          <button
            id="boton_cancelar_pedido"
            className="p-form-boton-secundario"
            type="button"
            onClick={() => navigate('/pedidos')}
            disabled={loading}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default RegistrarPedido;
