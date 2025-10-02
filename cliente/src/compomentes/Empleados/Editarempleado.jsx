import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Emplado.css';

const EditarEmpleado = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getAuthHeaders } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    phoneNumber: '',
    emailConfirmed: false,
    phoneNumberConfirmed: false,
    twoFactorEnabled: false,
    lockoutEnabled: false,
    roles: []
  });
  
  const [availableRoles, setAvailableRoles] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);

  // Cargar datos del empleado
  useEffect(() => {
    fetchEmpleado();
    fetchRoles();
  }, [id]);

  const fetchEmpleado = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://localhost:7232/api/User/${id}`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setFormData({
          userName: data.userName || '',
          email: data.email || '',
          phoneNumber: data.phoneNumber || '',
          emailConfirmed: data.emailConfirmed || false,
          phoneNumberConfirmed: data.phoneNumberConfirmed || false,
          twoFactorEnabled: data.twoFactorEnabled || false,
          lockoutEnabled: data.lockoutEnabled || false
        });
        setSelectedRoles(data.roles || []);
      } else {
        setError('Error al cargar los datos del empleado');
      }
    } catch (err) {
      setError('Error de conexión al cargar empleado');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
      console.error('Error al cargar roles:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRoleToggle = (role) => {
    setSelectedRoles(prev => {
      const alreadySelected = prev.includes(role);
      if (alreadySelected && prev.length === 1) {
        // No permitir quitar el último rol
        return prev;
      }
      return alreadySelected
        ? prev.filter(r => r !== role)
        : [...prev, role];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Construir el payload según el JSON del backend
      const payload = {
        email: formData.email,
        userName: formData.userName,
        phoneNumber: formData.phoneNumber,
        emailConfirmed: formData.emailConfirmed,
        phoneNumberConfirmed: formData.phoneNumberConfirmed,
        twoFactorEnabled: formData.twoFactorEnabled,
        lockoutEnabled: formData.lockoutEnabled,
        roles: selectedRoles
      };

      const updateResponse = await fetch(`https://localhost:7232/api/User/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (!updateResponse.ok) {
        throw new Error('Error al actualizar el empleado');
      }

      // Asignar roles nuevos
      const rolesToAdd = selectedRoles.filter(r => !(formData.roles || []).includes(r));
      for (const role of rolesToAdd) {
        await fetch('https://localhost:7232/api/Roles/assign', {
          method: 'POST',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId: id, roleName: role })
        });
      }

      setSuccess('Empleado actualizado correctamente');
      setTimeout(() => {
        navigate('/listarEmpleados');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Error al actualizar el empleado');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="registro-empleado-wrapper">
        <h2>Cargando datos del empleado...</h2>
      </div>
    );
  }

  return (
    <div className="registro-empleado-wrapper">
      <h2>Editar Empleado</h2>

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
                  checked={selectedRoles.includes(role)}
                  onChange={() => handleRoleToggle(role)}
                  disabled={saving || (selectedRoles.includes(role) && selectedRoles.length === 1)}
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
            {saving ? 'Guardando...' : 'Guardar Cambios'}
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

export default EditarEmpleado;