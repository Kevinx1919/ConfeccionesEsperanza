import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Tareas.css';

const API_URL = 'https://localhost:7232/api/Task/asignaciones';

const initialState = {
  usuario_IdUsuario: '',
  producto_IdProducto: '',
  tarea_IdTarea: '',
  fechaInicio: '',
  fechaFin: '',
  estado: 1
};

function AsignacionTarea() {
  const [asignacion, setAsignacion] = useState(initialState);
  const [usuarios, setUsuarios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Cargar usuarios, productos y tareas para los selects
  useEffect(() => {
    const token = localStorage.getItem('token');
    Promise.all([
      fetch('https://localhost:7232/api/User', { headers: { 'Authorization': `Bearer ${token}` } }),
      fetch('https://localhost:7232/api/Product', { headers: { 'Authorization': `Bearer ${token}` } }),
      fetch('https://localhost:7232/api/Task', { headers: { 'Authorization': `Bearer ${token}` } })
    ])
      .then(async ([u, p, t]) => {
        const usuarios = await u.json();
        const productos = await p.json();
        const tareas = await t.json();
        setUsuarios(Array.isArray(usuarios) ? usuarios : usuarios.usuarios || []);
        setProductos(Array.isArray(productos) ? productos : productos.productos || []);
        setTareas(Array.isArray(tareas) ? tareas : tareas.tareas || []);
      })
      .catch(() => {
        setError('No se pudieron cargar los datos de referencia');
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAsignacion(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const body = {
        ...asignacion,
        producto_IdProducto: Number(asignacion.producto_IdProducto),
        tarea_IdTarea: Number(asignacion.tarea_IdTarea),
        fechaInicio: asignacion.fechaInicio,
        fechaFin: asignacion.fechaFin,
        estado: Number(asignacion.estado)
      };
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error('Error al asignar la tarea');
      setSuccess('Tarea asignada correctamente');
      setAsignacion(initialState);
      setTimeout(() => navigate('/consultarTareas'), 1200);
    } catch (err) {
      setError('No se pudo asignar la tarea');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="formulario-container">
      <div className="vista-contenido">
        <h2>Asignar Tarea</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '18px' }}>
            <label>Usuario *</label>
            <select
              name="usuario_IdUsuario"
              value={asignacion.usuario_IdUsuario}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem', background: '#fff', color: '#222' }}
            >
              <option value="">Seleccione un usuario</option>
              {usuarios.map(u => (
                <option key={u.idUsuario || u.usuario_IdUsuario} value={u.idUsuario || u.usuario_IdUsuario}>
                  {u.nombre || u.nombreUsuario || u.userName || u.idUsuario}
                </option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: '18px' }}>
            <label>Producto *</label>
            <select
              name="producto_IdProducto"
              value={asignacion.producto_IdProducto}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem', background: '#fff', color: '#222' }}
            >
              <option value="">Seleccione un producto</option>
              {productos.map(p => (
                <option key={p.idProducto} value={p.idProducto}>
                  {p.nombre || p.nombreProducto || p.idProducto}
                </option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: '18px' }}>
            <label>Tarea *</label>
            <select
              name="tarea_IdTarea"
              value={asignacion.tarea_IdTarea}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem', background: '#fff', color: '#222' }}
            >
              <option value="">Seleccione una tarea</option>
              {tareas.map(t => (
                <option key={t.idTarea} value={t.idTarea}>
                  {t.nombreTarea || t.idTarea}
                </option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: '18px' }}>
            <label>Fecha de inicio *</label>
            <input
              type="datetime-local"
              name="fechaInicio"
              value={asignacion.fechaInicio}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem', background: '#fff', color: '#222' }}
            />
          </div>
          <div style={{ marginBottom: '18px' }}>
            <label>Fecha de fin *</label>
            <input
              type="datetime-local"
              name="fechaFin"
              value={asignacion.fechaFin}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem', background: '#fff', color: '#222' }}
            />
          </div>
          <div style={{ marginBottom: '18px' }}>
            <label>Estado *</label>
            <select
              name="estado"
              value={asignacion.estado}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem', background: '#fff', color: '#222' }}
            >
              <option value={1}>Activo</option>
              <option value={0}>Inactivo</option>
            </select>
          </div>
          {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
          {success && <div style={{ color: 'green', marginBottom: 10 }}>{success}</div>}
          <div className="form-actions">
            <button type="submit" style={{ background: '#2a9d2f', color: '#fff' }} disabled={loading}>
              {loading ? 'Guardando...' : 'Asignar'}
            </button>
            <button type="button" className="volver" onClick={() => navigate('/tareas')} disabled={loading}>
              Volver
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AsignacionTarea;
