import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

import clientesIcon from '../../assets/clientes.png';
import empleadosIcon from '../../assets/empleados.png';
import tareasIcon from '../../assets/taeras.png';
import userIcon from '../../assets/user.png';
import configIcon from '../../assets/confi.png';

import './BarraNavegacion.css';

const BarraLateral = () => {
  const { user } = useAuth();

  return (
    <nav className="barra-lateral">
      <ul>
        <li>
          <NavLink to="/perfil" className={({isActive}) => (isActive ? 'activo' : '')}>
            <img src={userIcon} alt="Perfil" />
            <span className="user-name-sidebar">
              {user ? user.userName : 'Perfil'}
            </span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/empleados" className={({isActive}) => (isActive ? 'activo' : '')}>
            <img src={empleadosIcon} alt="Empleados" />
            <span>Empleados</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/tareas" className={({isActive}) => (isActive ? 'activo' : '')}>
            <img src={tareasIcon} alt="Tareas" />
            <span>Tareas</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/clientes" className={({isActive}) => (isActive ? 'activo' : '')}>
            <img src={clientesIcon} alt="Clientes" />
            <span>Clientes</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/configuracion" className={({isActive}) => (isActive ? 'activo' : '')}>
            <img src={configIcon} alt="Configuración" />
            <span>Configuración</span>
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default BarraLateral;
