import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Reportes.css';

const MenuReporte = () => {
  const navigate = useNavigate();

  return (
    <div className="menu-reporte-wrapper">
      <h2>Empleados</h2>
      <div className="menu-empleado-grid">
        <button className="btn blue">
          <span className="icon">📦</span> Avance de pedidos
        </button>
        <button className="btn orange">
          <span className="icon">👕</span> Avance por producto
        </button>
        <button className="btn green">
          <span className="icon">👷</span> Productividad de empleados
        </button>
        <button className="btn purple">
          <span className="icon">⏳</span> Tareas pendientes
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

export default MenuReporte;