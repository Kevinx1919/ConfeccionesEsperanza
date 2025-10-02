import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const API_URL = 'https://localhost:7232/api/Customer'; // Cambia la URL según tu backend

const initialClienteState = {
  nombreCliente: '',
  apellidoCliente: '',
  emailCliente: '',
  telefonoCliente: '',
  numeroDocCliente: '',
  direccionCliente: '',
  codigoPostalCliente: ''
};

function RegistrarCliente() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [customer, setCustomer] = useState({ ...initialClienteState });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [titulo, setTitulo] = useState('Registrar Cliente');

  useEffect(() => {
    if (id) {
      setLoading(true);
      setTitulo('Editar Cliente');
      fetch(`${API_URL}/${id}`)
        .then(res => {
          if (!res.ok) throw new Error('No se pudo cargar el cliente');
          return res.json();
        })
        .then(data => {
          setCustomer(data);
          setLoading(false);
        })
        .catch(err => {
          setError('No se pudo cargar el cliente para editar.');
          setLoading(false);
        });
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomer(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (
      !customer.nombreCliente ||
      !customer.apellidoCliente ||
      !customer.emailCliente ||
      !customer.numeroDocCliente
    ) {
      setError(' Nombre, Apellido, Email y N° Documento son campos obligatorios.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customer.emailCliente)) {
      setError('Por favor ingresa un email válido.');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      if (id) {
        // Actualizar cliente
        const res = await fetch(`${API_URL}/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(customer)
        });
        if (!res.ok) throw new Error('Error al actualizar cliente');
        alert('Cliente actualizado con éxito');
      } else {
        // Crear cliente
        const token = localStorage.getItem('token'); 
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' , 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(customer)
        });
        if (!res.ok) throw new Error('Error al registrar cliente');
        alert('Cliente registrado con éxito');
      }
      navigate('/clientes');
    } catch (err) {
      setError('Ocurrió un error al guardar el cliente. Por favor, inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && id) {
    return <p>Cargando datos del cliente...</p>
  }

  return (
    <div className="formulario-container">
      <form onSubmit={handleSubmit}>
        <h2>{titulo}</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <input name="nombreCliente" value={customer.nombreCliente} onChange={handleChange} placeholder="Nombre" required disabled={loading} />
        <input name="apellidoCliente" value={customer.apellidoCliente} onChange={handleChange} placeholder="Apellido" required disabled={loading} />
        <input type="email" name="emailCliente" value={customer.emailCliente} onChange={handleChange} placeholder="Correo Electrónico" required disabled={loading} />
        <input name="telefonoCliente" value={customer.telefonoCliente} onChange={handleChange} placeholder="Teléfono" disabled={loading} />
        <input name="numeroDocCliente" value={customer.numeroDocCliente} onChange={handleChange} placeholder="N° Documento" required disabled={loading} />
        <input name="direccionCliente" value={customer.direccionCliente} onChange={handleChange} placeholder="Dirección" disabled={loading} />
        <input name="codigoPostalCliente" value={customer.codigoPostalCliente} onChange={handleChange} placeholder="Código Postal" disabled={loading} />
        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
          <button type="button" onClick={() => navigate('/clientes')} disabled={loading}>
            Cancelar
          </button>
          <button className="volver" type="button" onClick={() => navigate('/clientes')}>
            Volver
          </button>
        </div>
      </form>
    </div>
  );
}

export default RegistrarCliente;