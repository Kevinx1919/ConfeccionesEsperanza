import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Tareas.css';

const MenuTarea = () => {
  const navigate = useNavigate();

  return (
    <div className="menu-tarea-wrapper">
      <h2>Tareas</h2>
      <div className="menu-tarea-grid">
        <button className="btn blue" onClick={() => navigate('/registrarTarea')}>
          <span className="icon">+</span> Registrar tarea
        </button>
        <button className="btn orange" onClick={() => navigate('/consultarTareas')}>
          <span className="icon">📋</span> Consultar tarea
        </button>
        <button className="btn green" onClick={() => navigate('/asignacionTarea')}>
          <span className="icon">👷</span> Asignar tareas
        </button>
        <button className="btn purple">
          <span className="icon">📊</span> Generar reporte
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

export default MenuTarea;