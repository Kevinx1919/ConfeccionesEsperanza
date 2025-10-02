// AuthContext.jsx - Crear en src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar si hay un token guardado al cargar la aplicación
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    const tokenExpiration = localStorage.getItem('tokenExpiration');

    if (savedToken && savedUser && tokenExpiration) {
      // Verificar si el token no ha expirado
      const expirationDate = new Date(tokenExpiration);
      const currentDate = new Date();

      if (expirationDate > currentDate) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        setIsAuthenticated(true);
      } else {
        // Token expirado, limpiar
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = (authData) => {
    const { token, user, tokenExpiration } = authData;
    
    // Guardar en localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('tokenExpiration', tokenExpiration);
    
    // Actualizar estado
    setToken(token);
    setUser(user);
    setIsAuthenticated(true);
  };

  const logout = () => {
    // Limpiar localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tokenExpiration');
    
    // Limpiar estado
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const isTokenExpired = () => {
    const tokenExpiration = localStorage.getItem('tokenExpiration');
    if (!tokenExpiration) return true;
    
    const expirationDate = new Date(tokenExpiration);
    const currentDate = new Date();
    
    return expirationDate <= currentDate;
  };

  const getAuthHeaders = () => {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const value = {
    isAuthenticated,
    user,
    token,
    loading,
    login,
    logout,
    isTokenExpired,
    getAuthHeaders
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};