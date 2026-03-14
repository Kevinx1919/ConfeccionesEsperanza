import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiUrl } from '../../config/api';
import './Pedido.css';

const API_URL = apiUrl('/api/Order');

const fetchPedidoDetalles = async (id) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (response.status === 404) {
        throw new Error("Pedido no encontrado. Verifique el ID.");
    }
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
        throw new Error(errorData.message || errorData.Message || 'Error al cargar el pedido.');
    }
    return response.json(); 
};

const updatePedido = async (id, updatedData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 
            Authorization: `Bearer ${token}`, 
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify(updatedData)
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
        throw new Error(errorData.message || errorData.Message || 'Error al actualizar el pedido.');
    }
    return response.json();
};

const EditarPedido = () => {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const [pedido, setPedido] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [fechaEntrega, setFechaEntrega] = useState('');
    const [detallesPedido, setDetallesPedido] = useState([]);

    const fetchDetails = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchPedidoDetalles(id);
            setPedido(data);
            setFechaEntrega(data.fechaEntrega);
            setDetallesPedido(data.detallesPedido);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchDetails(); 
    }, [fetchDetails]);

    const handleCantidadChange = (index, value) => {
        const cantidadNum = Number(value);
        setDetallesPedido(prev =>
            prev.map((d, i) => (i === index ? { ...d, cantidad: cantidadNum } : d))
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const updatedData = {
            fechaEntrega,
            detallesPedido
        };
        try {
            await updatePedido(id, updatedData);
            alert('Pedido actualizado exitosamente!');
            navigate(`/detallePedido/${id}`);
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <p>Cargando detalle del pedido...</p>;
    if (error) return <p className="error-message">Error: {error}</p>;
    if (!pedido) return <p>No se encontraron datos para el pedido.</p>;

    return (
        <div className="p-editar-container">
            <h2>Editar Pedido #{pedido.idPedido}</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="fechaEntrega">Fecha de Entrega:</label>
                    <input 
                        id="fechaEntrega"
                        className="p-input-todo"
                        type="date" 
                        value={fechaEntrega} 
                        onChange={(e) => setFechaEntrega(e.target.value)} 
                        required 
                    />
                </div>
                <h3>Detalles del Pedido</h3>
                {detallesPedido.map((detalle, index) => {
                    // Usar id estable del detalle o fallback a índice
                    const detalleId = detalle.idDetallePedido || detalle.producto_IdProducto || `detalle-${index}`;
                    const cantidadInputId = `cantidad-${detalleId}`;
                    
                    return (
                        <div key={detalleId}>
                            <p>Producto: {detalle.productoNombre || `ID: ${detalle.producto_IdProducto}`}</p>
                            <label htmlFor={cantidadInputId}>Cantidad:</label>
                            <input 
                                id={cantidadInputId}
                                className="p-input-todo"
                                type="number" 
                                value={detalle.cantidad} 
                                onChange={(e) => handleCantidadChange(index, e.target.value)} 
                                required 
                            />
                        </div>
                    );
                })}
                <button className="p-ActPedido" type="submit">Actualizar Pedido</button>
            </form>
        </div>
    );
};

export default EditarPedido;
