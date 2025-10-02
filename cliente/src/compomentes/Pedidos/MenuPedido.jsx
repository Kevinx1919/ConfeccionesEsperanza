import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Pedido.css';

const MenuPedido = () => {
  const navigate = useNavigate();

  return (
    <div className="menu-pedido-wrapper">
      <h2>Pediddos</h2>
      <div className="menu-pedido-grid">
        <button className="btn blue" onClick={() => navigate('/registarPedido')}>
          <span className="icon">+</span> Registrar pedido
        </button>
        <button className="btn orange" onClick={() => navigate('/consularPedido')}>
          <span className="icon">📦</span> Consultar pedidos
        </button>
        <button className="btn purple">
          <span className="icon">📊</span> Reposte de avance
        </button>
      </div>
      <div className="volver-container">
        <button className="volver" onClick={() => navigate('/')}>
          Volver
        </button>
      </div>
    </div>
  );
};

export default MenuPedido;