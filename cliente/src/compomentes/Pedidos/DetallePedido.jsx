// src/componentes/Pedidos/DetallePedido.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Pedido.css'; 

// --- Configuración de API (DEBE SER REEMPLAZADO POR UN MÓDULO API REAL) ---
const API_URL = 'https://localhost:7232/api/Order';

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
        throw new Error(errorData.message || `Error al cargar el pedido: ${response.statusText}`);
    }
    return response.json(); 
};

// Asumo que el endpoint de estado es POST /api/Order/{id}/{action} (ej: /api/Order/12/entregar)
const updatePedidoStatus = async (id, action) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/${id}/${action}`, {
        method: 'POST', 
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    const result = await response.json();
    if (!response.ok || !result.isSuccess) {
        throw new Error(result.message || 'Error desconocido al actualizar el estado.');
    }
    return result.pedido; // Retorna el PedidoInfoDTo actualizado
};
// --------------------------------------------------------------------------

// =========================================
// LÓGICA DE NEGOCIO: Transición de Estados
// (Basada en tu Enum: Pendiente=1... Entregado=6)
// =========================================
const ESTADOS = {
    PENDIENTE: 1,
    EN_PROCESO: 2,
    EN_PRODUCCION: 3,
    COMPLETADO: 4,
    CANCELADO: 5, 
    ENTREGADO: 6, 
};

// Mapeo de la acción del botón al valor numérico de estado
const ACCION_A_ESTADO = {
    iniciar: ESTADOS.EN_PROCESO,
    producir: ESTADOS.EN_PRODUCCION,
    completar: ESTADOS.COMPLETADO,
    cancelar: ESTADOS.CANCELADO,
    entregar: ESTADOS.ENTREGADO,
};

/**
 * Valida si es posible la transición del estado actual al destino.
 */
const canTransition = (currentStatus, targetStatus) => {
    // 1. No se permite cambiar desde estados finales (Entregado o Cancelado)
    if (currentStatus === ESTADOS.ENTREGADO || currentStatus === ESTADOS.CANCELADO) {
        return false;
    }
    
    // 2. No se permite pasar al mismo estado
    if (currentStatus === targetStatus) {
        return false;
    }
    
    // 3. Reglas de Transición Lineal
    switch (targetStatus) {
        case ESTADOS.EN_PROCESO:
            // Solo de Pendiente (1) a En Proceso (2)
            return currentStatus === ESTADOS.PENDIENTE; 
        
        case ESTADOS.EN_PRODUCCION:
            // Solo de En Proceso (2) a En Producción (3)
            return currentStatus === ESTADOS.EN_PROCESO; 

        case ESTADOS.COMPLETADO:
            // Solo de En Producción (3) a Completado (4)
            return currentStatus === ESTADOS.EN_PRODUCCION; 
            
        case ESTADOS.ENTREGADO:
            // Solo de Completado (4) a Entregado (6)
            return currentStatus === ESTADOS.COMPLETADO;

        case ESTADOS.CANCELADO:
            // Se puede cancelar desde cualquier estado de avance (1, 2, 3, 4)
            return currentStatus < ESTADOS.CANCELADO;

        default:
            return false;
    }
};

const DetallePedido = () => {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const [pedido, setPedido] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusMessage, setStatusMessage] = useState(null); 

    const fetchDetails = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchPedidoDetalles(id);
            setPedido(data); 
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchDetails(); 
    }, [fetchDetails]);

    const handleEstadoChange = async (actionKey) => {
        if (!pedido) return;
        
        const nuevoEstadoId = ACCION_A_ESTADO[actionKey];
        
        if (!canTransition(pedido.estado, nuevoEstadoId)) {
            alert(`Error: No se permite cambiar de ${pedido.estadoDescripcion} a la acción seleccionada.`);
            return;
        }

        setStatusMessage(null);
        setLoading(true);
        setError(null);

        try {
            // Utilizamos el nombre de la acción ('iniciar', 'entregar') para el endpoint
            const updatedPedido = await updatePedidoStatus(id, actionKey); 
            setPedido(updatedPedido);
            setStatusMessage(`Estado actualizado a: ${updatedPedido.estadoDescripcion}`);
        } catch (err) {
            setError(err.message || "Error al actualizar el estado del pedido.");
        } finally {
            setLoading(false);
        }
    };
    
    // Función de utilidad para obtener el estado destino
    const getTargetStatus = (actionKey) => ACCION_A_ESTADO[actionKey];

    // --- LÓGICA DE RENDERIZADO CORREGIDA ---
    if (loading && !pedido) return <p>Cargando detalle del pedido #{id}...</p>;
    if (error) return <p className="error-message">Error al cargar: {error}</p>;
    // Si el fetch terminó y 'pedido' sigue siendo null (ej: 404), mostramos un mensaje final
    if (!pedido) return <p>No se encontraron datos para el pedido #{id}.</p>; 

    // A partir de aquí, 'pedido' ya tiene datos, evitando el error "lectura 'estadoDescripcion'"
    return (
        <div className="detalle-container">
            <header className="detalle-header">
                <h2>Detalles del Pedido #{pedido.idPedido}</h2>
                {/* Comprobación de estado removida del return, ya que las comprobaciones de arriba garantizan que 'pedido' no es null */}
                <div className={`estado-tag estado-${pedido.estado}`}>
                    {pedido.estadoDescripcion}
                </div>
            </header>

            {statusMessage && <p className="success-message" style={{color: 'green', fontWeight: 'bold'}}>{statusMessage}</p>}
            {error && <p className="error-message" style={{color: 'red'}}>{error}</p>}

            {/* Sección de Gestión de Estados (Lógica de Deshabilitado Reforzada) */}
            <div className="status-management">
                <h3>Gestión de Estado</h3>
                
                <button 
                    onClick={() => handleEstadoChange('iniciar')} 
                    disabled={loading || !canTransition(pedido.estado, getTargetStatus('iniciar'))}
                    className="btn-status btn-purple"
                >
                    En Proceso
                </button>
                <button 
                    onClick={() => handleEstadoChange('producir')} 
                    disabled={loading || !canTransition(pedido.estado, getTargetStatus('producir'))}
                    className="btn-status btn-purple"
                >
                    En Producción
                </button>
                <button 
                    onClick={() => handleEstadoChange('completar')} 
                    disabled={loading || !canTransition(pedido.estado, getTargetStatus('completar'))}
                    className="btn-status btn-purple"
                >
                    Completado
                </button>
                <button 
                    onClick={() => handleEstadoChange('cancelar')} 
                    disabled={loading || !canTransition(pedido.estado, getTargetStatus('cancelar'))}
                    className="btn-status btn-cancel"
                >
                    Cancelado
                </button>
                <button 
                    onClick={() => handleEstadoChange('entregar')} 
                    disabled={loading || !canTransition(pedido.estado, getTargetStatus('entregar'))}
                    className="btn-status btn-entregar"
                >
                    Marcar Entregado
                </button>
            </div>
            
            <hr />
            
            {/* Información General del Pedido */}
            <div className="info-card">
                <h3>Información General</h3>
                <p><strong>Cliente:</strong> {pedido.clienteNombre} ({pedido.clienteEmail})</p>
                <p><strong>Fecha Registro:</strong> {new Date(pedido.fechaRegistro).toLocaleDateString()}</p>
                <p><strong>Fecha Entrega:</strong> {new Date(pedido.fechaEntrega).toLocaleDateString()} {pedido.estaVencido && <span className="vencido-tag">(Vencido)</span>}</p>
                <p><strong>Última Actualización:</strong> {pedido.fechaActualizacion ? new Date(pedido.fechaActualizacion).toLocaleString() : 'N/A'}</p>
            </div>
            
            <hr />

            {/* Detalles de Productos */}
            <div className="detalles-producto">
                <h3>Productos Solicitados ({pedido.totalItems} ítems)</h3>
                <table className="detalle-table">
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Cantidad</th>
                            <th>P. Unitario</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* El '?' (optional chaining) asegura que no falle si detallesPedido es null */}
                        {pedido.detallesPedido?.map((detalle, index) => (
                            <tr key={index}>
                                <td>{detalle.productoNombre || `ID: ${detalle.producto_IdProducto}`}</td>
                                <td>{detalle.cantidad}</td>
                                <td>${detalle.precioUnitario?.toFixed(2)}</td>
                                <td>${(detalle.cantidad * detalle.precioUnitario)?.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <footer className="detalle-footer">
                <p className="total-final"><strong>TOTAL PEDIDO:</strong> ${pedido.totalPedido?.toFixed(2)}</p>
                <button className="btn-purple" onClick={() => navigate('/consularPedido')}>Volver a Consultar</button>
            </footer>
        </div>
    );
};

export default DetallePedido;