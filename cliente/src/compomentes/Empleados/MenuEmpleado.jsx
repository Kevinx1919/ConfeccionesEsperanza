import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Emplado.css';

const MenuEmpleado = () => {
  const navigate = useNavigate();

  return (
    <div className="menu-empleado-wrapper">
      <h2>Empleados</h2>
      <div className="menu-empleado-grid">
        <button className="btn blue" onClick={() => navigate('/registroEmpleado')}>
          <span className="icon" >+</span> Registrar empleado
        </button>
        <button className="btn orange" onClick={() => navigate('/listarEmpleados')}>
          <span className="icon">✔</span> Consultar empleado
        </button>
        <button className="btn green">
          <span className="icon">📋</span> Generar informes de pagos
        </button>
        <button className="btn purple">
          <span className="icon">✎</span> Registro de horas trabajadas
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

export default MenuEmpleado;

