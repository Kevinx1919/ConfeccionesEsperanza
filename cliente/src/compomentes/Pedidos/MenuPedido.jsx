import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Pedido.css';

const MenuPedido = () => {
  const navigate = useNavigate();

  return (
    <div className="p-menu-wrapper">
      <h2>Pedidos</h2>
      <div className="p-menu-grid">
        <button className="p-menu-btn blue" onClick={() => navigate('/registrarPedido')}>
          <span className="p-icon">+</span> Registrar pedido
        </button>
        <button className="p-menu-btn orange" onClick={() => navigate('/consultarPedido')}>
          <span className="p-icon">📦</span> Consultar pedidos
        </button>
        <button className="p-menu-btn purple">
          <span className="p-icon">📊</span> Reposte de avance
        </button>
      </div>
      <div className="p-volver-container">
        <button className="p-volver" onClick={() => navigate('/')}>
          Volver
        </button>
      </div>
    </div>
  );
};

export default MenuPedido;