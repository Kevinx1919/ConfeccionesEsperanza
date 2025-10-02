import React from 'react';
import { useNavigate } from 'react-router-dom';
import './cliente.css';

const MenuCliente = () => {
  const navigate = useNavigate();

  return (
    <div className="menu-cliente-wrapper">
      <h2>Clientes</h2>
      <div className="menu-cliente-grid">
        <button className="btn blue" onClick={() => navigate('/registrarcliente')}>
          <span className="icon">+</span> Registrar cliente
        </button>
        <button className="btn orange" onClick={() => navigate('/listarcliente')} >
          <span className="icon">✔</span> Consultar cliente
        </button>
        <button className="btn green">
          <span className="icon">📋</span> Generar reporte general
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

export default MenuCliente;