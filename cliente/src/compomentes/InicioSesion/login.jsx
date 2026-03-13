import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiUrl } from '../../config/api';
import './login.css';

const normalizeAuthResponse = (payload) => ({
  isSuccess: payload?.isSuccess ?? payload?.IsSuccess ?? false,
  message: payload?.message ?? payload?.Message ?? '',
  token: payload?.token ?? payload?.Token ?? null,
  user: payload?.user ?? payload?.User ?? null,
  tokenExpiration: payload?.tokenExpiration ?? payload?.TokenExpiration ?? null,
});

const Login = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Limpiar error cuando el usuario empiece a escribir
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.email) {
      setError('El email es requerido');
      return false;
    }
    if (!formData.password) {
      setError('La contraseña es requerida');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Por favor ingresa un email válido');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(apiUrl('/api/Auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const rawData = await response.json();
      const data = normalizeAuthResponse(rawData);

      if (data.isSuccess) {
        // Usar el contexto de autenticación
        login({
          token: data.token,
          user: data.user,
          tokenExpiration: data.tokenExpiration
        });
        
        // El contexto se encargará de redirigir a la aplicación principal
        console.log('Login exitoso:', data);
        
      } else {
        setError(data.message || 'Error en el inicio de sesión');
      }
    } catch (err) {
      console.error('Error de conexión:', err);
      setError('Error de conexión. Por favor verifica que el servidor esté funcionando.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Iniciar Sesión</h2>
          <p>Ingresa tus credenciales para acceder</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">👤Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="usuario@ejemplo.com"
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">🔒Contraseña</label>
            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Ingresa tu contraseña"
                disabled={loading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                disabled={loading}
              />
              <span className="checkbox-custom"></span>
              🗓️ Recordarme
            </label>
          </div>

          <button 
            type="submit" 
            className={`login-button ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Iniciando sesión...
              </>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>¿No tienes cuenta? <a href="/register">Regístrate aquí</a></p>
          <p><a href="/forgot-password">¿Olvidaste tu contraseña?</a></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
