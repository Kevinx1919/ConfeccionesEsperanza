import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Perfil.css';

const Perfil = () => {
  const { user, getAuthHeaders } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    userName: '',
    email: '',
    phoneNumber: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://localhost:7232/api/Auth/profile', {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setProfileData(data);
        setEditFormData({
          userName: data.userName || '',
          email: data.email || '',
          phoneNumber: data.phoneNumber || ''
        });
      } else {
        setError('Error al cargar el perfil');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('https://localhost:7232/api/Auth/profile', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(editFormData)
      });

      const result = await response.json();

      if (result.isSuccess) {
        setSuccess('Perfil actualizado correctamente');
        setIsEditing(false);
        await fetchProfile(); // Recargar datos
      } else {
        setError(result.message || 'Error al actualizar el perfil');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Error updating profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditFormData({
      userName: profileData?.userName || '',
      email: profileData?.email || '',
      phoneNumber: profileData?.phoneNumber || ''
    });
    setError('');
    setSuccess('');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading && !profileData) {
    return (
      <div className="perfil-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="perfil-container">
      <div className="perfil-header">
        <div className="header-content">
          <div className="perfil-avatar">
            <div className="avatar-circle">
              {profileData?.userName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </div>
          <div className="perfil-title">
            <h1>Mi Perfil</h1>
            <p>Administra tu información personal</p>
          </div>
        </div>
      </div>

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

      <div className="perfil-content">
        <div className="perfil-section">
          <div className="section-header">
            <h2>Información Personal</h2>
            {!isEditing && (
              <button
                className="btn btn-primary"
                onClick={() => setIsEditing(true)}
                disabled={loading}
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  height: '32px',
                  minWidth: '80px'
                }}
              >
                Editar Perfil
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleUpdateProfile} className="edit-form">
              <div className="form-group">
                <label htmlFor="userName">Nombre de Usuario</label>
                <input
                  type="text"
                  id="userName"
                  name="userName"
                  value={editFormData.userName}
                  onChange={handleEditChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={editFormData.email}
                  onChange={handleEditChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="phoneNumber">Teléfono</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={editFormData.phoneNumber}
                  onChange={handleEditChange}
                  placeholder="Opcional"
                  disabled={loading}
                />
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={loading}
                >
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancelEdit}
                  disabled={loading}
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="info-grid-vertical">
                <div className="info-item">
                  <label>ID DE USUARIO</label>
                  <span>{profileData?.id || 'N/A'}</span>
                </div>

                <div className="info-item">
                  <label>NOMBRE DE USUARIO</label>
                  <span>{profileData?.userName || 'N/A'}</span>
                </div>

                <div className="info-item">
                  <label>EMAIL</label>
                  <span>{profileData?.email || 'N/A'}</span>
                  <div className="status-badge">
                    {profileData?.emailConfirmed ? (
                      <span className="badge badge-success">✓ CONFIRMADO</span>
                    ) : (
                      <span className="badge badge-warning">⚠ SIN CONFIRMAR</span>
                    )}
                  </div>
                </div>

                <div className="info-item">
                  <label>TELÉFONO</label>
                  <span>{profileData?.phoneNumber || 'No especificado'}</span>
                  <div className="status-badge">
                    {profileData?.phoneNumberConfirmed ? (
                      <span className="badge badge-success">✓ CONFIRMADO</span>
                    ) : (
                      <span className="badge badge-warning">⚠ SIN CONFIRMAR</span>
                    )}
                  </div>
                </div>

                <div className="info-item">
                  <label>AUTENTICACIÓN 2FA</label>
                  <span>{profileData?.twoFactorEnabled ? 'Habilitada' : 'Deshabilitada'}</span>
                  <div className="status-badge">
                    {profileData?.twoFactorEnabled ? (
                      <span className="badge badge-success">✓ ACTIVO</span>
                    ) : (
                      <span className="badge badge-info">INACTIVO</span>
                    )}
                  </div>
                </div>

                <div className="info-item">
                  <label>ESTADO DE LA CUENTA</label>
                  <span>
                    {profileData?.lockoutEnabled ?
                      (profileData?.lockoutEnd ? 'Bloqueada' : 'Normal') :
                      'Normal'
                    }
                  </span>
                  <div className="status-badge">
                    {profileData?.lockoutEnabled && profileData?.lockoutEnd ? (
                      <span className="badge badge-danger">🔒 BLOQUEADA</span>
                    ) : (
                      <span className="badge badge-success">✓ ACTIVA</span>
                    )}
                  </div>
                </div>

                <div className="info-item">
                  <label>INTENTOS FALLIDOS</label>
                  <span>{profileData?.accessFailedCount || 0}</span>
                </div>

                <div className="info-item">
                  <label>ROLES</label>
                  <div className="roles-container">
                    {profileData?.roles?.length > 0 ? (
                      profileData.roles.map((role, index) => (
                        <span key={index} className="badge badge-primary">{role}</span>
                      ))
                    ) : (
                      <span>Sin roles asignados</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Botón volver en esquina inferior derecha */}
              <div className="volver-container">
                <button 
                    onClick={() => navigate('/')}
                    style={{
                      backgroundColor: '#7c3aed',
                      color: 'white',
                      border: 'none',
                      padding: '12px 30px',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
                      transition: 'all 0.3s ease',
                      minWidth: '120px'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.boxShadow = '0 6px 20px rgba(124, 58, 237, 0.5)';
                      e.target.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.3)';
                      e.target.style.transform = 'translateY(0px)';
                    }}
                    >
                    Volver
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Perfil;