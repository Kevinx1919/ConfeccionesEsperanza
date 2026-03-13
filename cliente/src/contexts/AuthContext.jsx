// AuthContext.jsx - Crear en src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const getStoredToken = () => localStorage.getItem('token');
const getStoredUser = () => localStorage.getItem('user');
const getStoredTokenExpiration = () => localStorage.getItem('tokenExpiration');

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
    const savedToken = getStoredToken();
    const savedUser = getStoredUser();
    const tokenExpiration = getStoredTokenExpiration();

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

    if (!token || !user || !tokenExpiration) {
      throw new Error('La respuesta de autenticacion no contiene la informacion necesaria.');
    }
    
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
    const tokenExpiration = getStoredTokenExpiration();
    if (!tokenExpiration) return true;
    
    const expirationDate = new Date(tokenExpiration);
    const currentDate = new Date();
    
    return expirationDate <= currentDate;
  };

  const getAuthHeaders = () => {
    const currentToken = token || getStoredToken();

    return {
      'Authorization': `Bearer ${currentToken}`,
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
