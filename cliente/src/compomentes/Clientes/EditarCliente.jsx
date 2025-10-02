import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const API_URL = 'https://localhost:7232/api/Customer';

const initialClienteState = {
  nombreCliente: '',
  apellidoCliente: '',
  emailCliente: '',
  telefonoCliente: '',
  numeroDocCliente: '',
  direccionCliente: '',
  codigoPostalCliente: ''
};

function EditarCliente() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(initialClienteState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Cargar datos del cliente
    const token = localStorage.getItem('token'); 
    fetch(`${API_URL}/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('No se pudo cargar el cliente');
        return res.json();
      })
      .then(data => {
        setCustomer(data);
        setLoading(false);
      })
      .catch(() => {
        setError('No se pudo cargar el cliente');
        setLoading(false);
      });
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomer(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
        const token = localStorage.getItem('token'); 
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(customer)
      });
      if (!res.ok) throw new Error('Error al actualizar cliente');
      alert('Cliente actualizado con éxito');
      navigate('/clientes');
    } catch {
      setError('Ocurrió un error al actualizar el cliente.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Cargando...</p>;

  return (
    <div className="formulario-container">
      <form onSubmit={handleSubmit}>
        <h2>Editar Cliente</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <input name="nombreCliente" value={customer.nombreCliente} onChange={handleChange} placeholder="Nombre" required />
        <input name="apellidoCliente" value={customer.apellidoCliente} onChange={handleChange} placeholder="Apellido" required />
        <input type="email" name="emailCliente" value={customer.emailCliente} onChange={handleChange} placeholder="Correo Electrónico" required />
        <input name="telefonoCliente" value={customer.telefonoCliente} onChange={handleChange} placeholder="Teléfono" />
        <input name="numeroDocCliente" value={customer.numeroDocCliente} onChange={handleChange} placeholder="N° Documento" required />
        <input name="direccionCliente" value={customer.direccionCliente} onChange={handleChange} placeholder="Dirección" />
        <input name="codigoPostalCliente" value={customer.codigoPostalCliente} onChange={handleChange} placeholder="Código Postal" />
        <div className="form-actions">
          <button type="submit" disabled={loading}>Guardar Cambios</button>
          <button type="button" onClick={() => navigate('/clientes')}>Cancelar</button>
        </div>
      </form>
    </div>
  );
}

export default EditarCliente;