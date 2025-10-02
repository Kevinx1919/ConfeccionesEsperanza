import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import salidaIcon from '../../assets/salida.png';
import './BarraNavegacion.css';

const BarraSuperior = () => {
  const { user, logout, getAuthHeaders } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    // Confirmar antes de cerrar sesión
    const confirmLogout = window.confirm('¿Estás seguro de que deseas cerrar sesión?');
    
    if (!confirmLogout) return;

    setIsLoggingOut(true);

    try {
      // Llamar al endpoint de logout de la API
      const response = await fetch('https://localhost:7232/api/Auth/logout', {
        method: 'POST',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        console.log('Logout exitoso en el servidor');
      } else {
        console.warn('Error en logout del servidor, pero continuando con logout local');
      }
    } catch (error) {
      console.error('Error al hacer logout en el servidor:', error);
      // Continuar con el logout local aunque falle el servidor
    } finally {
      // Siempre hacer logout local
      logout();
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="barra-superior">
      <nav>
        <NavLink to="/" end className={({isActive}) => (isActive ? 'activo' : '')}>
          Inicio
        </NavLink>
        <NavLink to="/pedidos" className={({isActive}) => (isActive ? 'activo' : '')}>
          Pedidos
        </NavLink>
        <NavLink to="/stock" className={({isActive}) => (isActive ? 'activo' : '')}>
          Stock
        </NavLink>
        <NavLink to="/reportes" className={({isActive}) => (isActive ? 'activo' : '')}>
          Reportes
        </NavLink>
      </nav>

      {/* Solo el botón de salida */}
      <div className="logout-section">
        <div 
          className={`icono-salida ${isLoggingOut ? 'loading' : ''}`}
          onClick={handleLogout}
          title={`Cerrar sesión${user ? ` (${user.userName})` : ''}`}
          style={{ 
            cursor: isLoggingOut ? 'not-allowed' : 'pointer',
            opacity: isLoggingOut ? 0.6 : 1
          }}
        >
          {isLoggingOut ? (
            <div className="logout-spinner"></div>
          ) : (
            <img src={salidaIcon} alt="Salir" />
          )}
        </div>
      </div>
    </header>
  );
};

export default BarraSuperior;
