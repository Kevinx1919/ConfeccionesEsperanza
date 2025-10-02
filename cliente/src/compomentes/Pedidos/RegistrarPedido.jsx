import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Pedido.css';

const API_URL = 'https://localhost:7232/api/Order';

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

function RegistrarPedido() {
  const navigate = useNavigate();
  const [pedido, setPedido] = useState({ ...initialPedidoState });
  const [nuevoDetalle, setNuevoDetalle] = useState({ ...initialDetalleState });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // --- INICIO MODIFICACIÓN: Estado para clientes y carga de clientes ---
  const [clientes, setClientes] = useState([]);
  useEffect(() => {
  const fetchClientes = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://localhost:7232/api/Customer', {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      const data = await res.json();
      setClientes(data.clientes || []); // <-- Igual que en Listarcliente.jsx
    } catch (err) {
      // Manejo de error opcional
    }
  };
  fetchClientes();
}, []);
  // --- FIN MODIFICACIÓN ---

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

  const handleAddDetalle = () => {
    if (!nuevoDetalle.producto_IdProducto || !nuevoDetalle.cantidad || !nuevoDetalle.precioUnitario) {
      setError('Completa todos los campos del detalle antes de agregar.');
      return;
    }
    setPedido(prev => ({
      ...prev,
      detallesPedido: [...prev.detallesPedido, { ...nuevoDetalle }]
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
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(pedidoToSend)
      });
      const response = await res.json();
      if (response.isSuccess) {
        alert('Pedido registrado exitosamente!');
        navigate('/pedidos');
      } else {
        setError(response.message || 'Error al registrar pedido.');
      }
    } catch (err) {
      setError('Ocurrió un error al guardar el pedido. Por favor, inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="formulario-container">
      <form onSubmit={handleSubmit}>
        <h2>Registrar Pedido</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {/* --- INICIO MODIFICACIÓN: Select de clientes con nombre visible y valor ID --- */}
        <select
          name="cliente_IdCliente"
          value={pedido.cliente_IdCliente}
          onChange={handleChange}
          required
          disabled={loading}
        >
          <option value="">Seleccione un cliente</option>
          {clientes.map(cliente => (
            <option key={cliente.idCliente} value={cliente.idCliente}>
              {cliente.nombreCliente} {cliente.apellidoCliente}
            </option>
          ))}
        </select>
        {/* --- FIN MODIFICACIÓN --- */}
        <input
          type="date"
          name="fechaEntrega"
          value={pedido.fechaEntrega}
          onChange={handleChange}
          placeholder="Fecha de Entrega"
          required
          disabled={loading}
        />
        <h3>Detalles del Pedido</h3>
        {pedido.detallesPedido.map((det, idx) => (
          <div key={idx}>
            Producto: {det.producto_IdProducto}, Cantidad: {det.cantidad}, Precio: {det.precioUnitario}
          </div>
        ))}
        <input
          name="producto_IdProducto"
          value={nuevoDetalle.producto_IdProducto}
          onChange={handleDetalleChange}
          placeholder="ID Producto"
          disabled={loading}
        />
        <input
          name="cantidad"
          type="number"
          value={nuevoDetalle.cantidad}
          onChange={handleDetalleChange}
          placeholder="Cantidad"
          disabled={loading}
        />
        <input
          name="precioUnitario"
          type="number"
          step="0.01"
          value={nuevoDetalle.precioUnitario}
          onChange={handleDetalleChange}
          placeholder="Precio Unitario"
          disabled={loading}
        />
        <button type="button" onClick={handleAddDetalle} disabled={loading}>
          Agregar Detalle
        </button>
        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Guardando...' : 'Registrar Pedido'}
          </button>
          <button type="button" onClick={() => navigate('/pedidos')} disabled={loading}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default RegistrarPedido;