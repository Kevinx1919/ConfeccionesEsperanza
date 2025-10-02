
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Emplado.css';

const RegistroEmpleado = () => {
  const navigate = useNavigate();
  const { getAuthHeaders } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    userName: '',
    password: '',
    phoneNumber: '',
    roles: []
  });
  const [availableRoles, setAvailableRoles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await fetch('https://localhost:7232/api/Roles', {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const roles = await response.json();
        setAvailableRoles(roles.map(r => r.name));
      }
    } catch (err) {
      // No roles
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleToggle = (role) => {
    setFormData(prev => {
      const alreadySelected = prev.roles.includes(role);
      if (alreadySelected && prev.roles.length === 1) {
        // No permitir quitar el último rol
        return prev;
      }
      return {
        ...prev,
        roles: alreadySelected
          ? prev.roles.filter(r => r !== role)
          : [...prev.roles, role]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        email: formData.email,
        userName: formData.userName,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        roles: formData.roles
      };
      const response = await fetch('https://localhost:7232/api/User', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Error al registrar el empleado');
      }
      setSuccess('Empleado registrado correctamente');
      setTimeout(() => navigate('/listarEmpleados'), 1500);
    } catch (err) {
      setError(err.message || 'Error al registrar el empleado');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="registro-empleado-wrapper">
      <h2>Registrar Empleado</h2>
      {error && (
        <div className="alert alert-error">
          <span className="alert-icon">⚠️</span>
          {error}
        </div>
      )}
      {success && (
        <div className="alert alert-success">
          <span className="alert-icon">✅</span>
          {success}
        </div>
      )}
      <form onSubmit={handleSubmit} className="registro-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="userName">Nombre de Usuario *</label>
            <input
              type="text"
              id="userName"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              required
              disabled={saving}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={saving}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="password">Contraseña *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              disabled={saving}
            />
          </div>
          <div className="form-group">
            <label htmlFor="phoneNumber">Teléfono</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Opcional"
              disabled={saving}
            />
          </div>
        </div>
        <div className="form-group">
          <label>Configuración de Cuenta</label>
          <div className="config-checkboxes">
            <label className="checkbox-label-config">
              <input
                type="checkbox"
                name="emailConfirmed"
                checked={formData.emailConfirmed}
                onChange={handleChange}
                disabled={saving}
              />
              <span>Email Confirmado</span>
            </label>
            <label className="checkbox-label-config">
              <input
                type="checkbox"
                name="phoneNumberConfirmed"
                checked={formData.phoneNumberConfirmed}
                onChange={handleChange}
                disabled={saving}
              />
              <span>Teléfono Confirmado</span>
            </label>
            <label className="checkbox-label-config">
              <input
                type="checkbox"
                name="twoFactorEnabled"
                checked={formData.twoFactorEnabled}
                onChange={handleChange}
                disabled={saving}
              />
              <span>Autenticación 2FA Activada</span>
            </label>
            <label className="checkbox-label-config">
              <input
                type="checkbox"
                name="lockoutEnabled"
                checked={formData.lockoutEnabled}
                onChange={handleChange}
                disabled={saving}
              />
              <span>Cuenta Bloqueada</span>
            </label>
          </div>
        </div>
        <div className="form-group">
          <label>Roles</label>
          <div className="roles-checkbox-container">
            {availableRoles.map(role => (
              <label key={role} className="checkbox-label-role">
                <input
                  type="checkbox"
                  checked={formData.roles.includes(role)}
                  onChange={() => handleRoleToggle(role)}
                  disabled={saving || (formData.roles.includes(role) && formData.roles.length === 1)}
                />
                <span>{role}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="form-buttons">
          <button 
            type="submit" 
            className="btn btn-submit green"
            disabled={saving}
          >
            {saving ? 'Guardando...' : 'Registrar'}
          </button>
          <button 
            type="button" 
            className="btn btn-cancel"
            onClick={() => navigate('/listarEmpleados')}
            disabled={saving}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegistroEmpleado;