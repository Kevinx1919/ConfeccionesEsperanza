import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, Mail, MapPin, Phone, Save, UserRound } from 'lucide-react';
import { apiUrl } from '../../config/api';

const API_URL_CLIENTE = apiUrl('/api/Customer');

const initialClienteState = {
  nombreCliente: '',
  apellidoCliente: '',
  emailCliente: '',
  telefonoCliente: '',
  numeroDocCliente: '',
  direccionCliente: '',
  codigoPostalCliente: '',
};

const formFieldClass =
  'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100';

const FieldLabel = ({ htmlFor, icon: Icon, children }) => (
  <label
    className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-700"
    htmlFor={htmlFor}
  >
    <span className="rounded-lg bg-sky-100 p-1 text-sky-700">
      <Icon className="h-4 w-4" />
    </span>
    {children}
  </label>
);

function RegistrarCliente() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [customer, setCustomer] = useState({ ...initialClienteState });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditMode = Boolean(id);

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    const token = localStorage.getItem('token');

    const cargarCliente = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL_CLIENTE}/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('No se pudo cargar el cliente');
        }

        const data = await response.json();
        setCustomer({
          nombreCliente: data.nombreCliente ?? '',
          apellidoCliente: data.apellidoCliente ?? '',
          emailCliente: data.emailCliente ?? '',
          telefonoCliente: data.telefonoCliente ?? '',
          numeroDocCliente: data.numeroDocCliente ?? '',
          direccionCliente: data.direccionCliente ?? '',
          codigoPostalCliente: data.codigoPostalCliente ?? '',
        });
      } catch (fetchError) {
        setError(fetchError.message || 'No se pudo cargar el cliente para editar.');
      } finally {
        setLoading(false);
      }
    };

    cargarCliente();
  }, [id, isEditMode]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setCustomer((prevCustomer) => ({
      ...prevCustomer,
      [name]: value,
    }));

    if (error) {
      setError('');
    }
  };

  const validateForm = () => {
    if (
      !customer.nombreCliente.trim() ||
      !customer.apellidoCliente.trim() ||
      !customer.emailCliente.trim() ||
      !customer.numeroDocCliente.toString().trim()
    ) {
      setError('Nombre, apellido, correo y documento son obligatorios.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customer.emailCliente)) {
      setError('Ingresa un correo valido.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');

      const response = await fetch(isEditMode ? `${API_URL_CLIENTE}/${id}` : API_URL_CLIENTE, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(customer),
      });

      if (!response.ok) {
        throw new Error('No se pudo guardar el cliente');
      }

      navigate('/listarcliente');
    } catch (submitError) {
      setError(submitError.message || 'Ocurrio un error al guardar el cliente.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="mx-auto w-full max-w-[74rem] px-4 py-4 sm:px-6">
        <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-[0_24px_60px_-35px_rgba(15,23,42,0.35)]">
          <p className="text-base font-medium text-slate-600">Cargando datos del cliente...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[106rem] px-4 py-3 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_24px_80px_-32px_rgba(15,23,42,0.35)]">
        <div className="border-b border-slate-200 bg-[linear-gradient(135deg,#ecfeff_0%,#eff6ff_55%,#eef2ff_100%)] px-5 py-4 sm:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center rounded-full border border-sky-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
              Gestion comercial
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {isEditMode ? 'Editar Cliente' : 'Registrar Cliente'}
            </h2>
            <p className="mt-1.5 text-sm leading-6 text-slate-600 sm:text-base">
              Completa la informacion necesaria para registrar al cliente.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 sm:px-8 sm:py-5">
          {error ? (
            <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {error}
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <FieldLabel htmlFor="campo_nombre_cliente" icon={UserRound}>
                Nombre
              </FieldLabel>
              <input
                id="campo_nombre_cliente"
                className={`${formFieldClass} bg-sky-50 font-semibold ring-1 ring-sky-100 focus:bg-white`}
                name="nombreCliente"
                value={customer.nombreCliente}
                onChange={handleChange}
                placeholder="Nombre del cliente"
                required
                disabled={loading}
              />
            </div>

            <div>
              <FieldLabel htmlFor="campo_apellido_cliente" icon={UserRound}>
                Apellido
              </FieldLabel>
              <input
                id="campo_apellido_cliente"
                className={formFieldClass}
                name="apellidoCliente"
                value={customer.apellidoCliente}
                onChange={handleChange}
                placeholder="Apellido del cliente"
                required
                disabled={loading}
              />
            </div>

            <div>
              <FieldLabel htmlFor="campo_email_cliente" icon={Mail}>
                Correo electronico
              </FieldLabel>
              <input
                id="campo_email_cliente"
                className={formFieldClass}
                type="email"
                name="emailCliente"
                value={customer.emailCliente}
                onChange={handleChange}
                placeholder="correo@ejemplo.com"
                required
                disabled={loading}
              />
            </div>

            <div>
              <FieldLabel htmlFor="campo_telefono_cliente" icon={Phone}>
                Telefono
              </FieldLabel>
              <input
                id="campo_telefono_cliente"
                className={formFieldClass}
                name="telefonoCliente"
                value={customer.telefonoCliente}
                onChange={handleChange}
                placeholder="Numero de contacto"
                disabled={loading}
              />
            </div>

            <div>
              <FieldLabel htmlFor="campo_documento_cliente" icon={FileText}>
                Documento
              </FieldLabel>
              <input
                id="campo_documento_cliente"
                className={formFieldClass}
                name="numeroDocCliente"
                value={customer.numeroDocCliente}
                onChange={handleChange}
                placeholder="Numero de documento"
                required
                disabled={loading}
              />
            </div>

            <div>
              <FieldLabel htmlFor="campo_codigo_postal_cliente" icon={MapPin}>
                Codigo postal
              </FieldLabel>
              <input
                id="campo_codigo_postal_cliente"
                className={formFieldClass}
                name="codigoPostalCliente"
                value={customer.codigoPostalCliente}
                onChange={handleChange}
                placeholder="Codigo postal"
                disabled={loading}
              />
            </div>

            <div className="md:col-span-2">
              <FieldLabel htmlFor="campo_direccion_cliente" icon={MapPin}>
                Direccion
              </FieldLabel>
              <input
                id="campo_direccion_cliente"
                className={formFieldClass}
                name="direccionCliente"
                value={customer.direccionCliente}
                onChange={handleChange}
                placeholder="Direccion principal del cliente"
                disabled={loading}
              />
            </div>
          </div>

          <div className="mt-5 flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
            <button
              id="boton_cancelar_formulario_cliente"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60 boton_cancelar_formulario_cliente"
              type="button"
              onClick={() => navigate('/listarcliente')}
              disabled={loading}
            >
              <ArrowLeft className="h-4 w-4" />
              Cancelar
            </button>
            <button
              id={isEditMode ? 'boton_guardar_edicion_cliente' : 'boton_guardar_registro_cliente'}
              className={`inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_100%)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-sky-500/25 focus:outline-none focus:ring-4 focus:ring-sky-200 disabled:cursor-not-allowed disabled:opacity-60 ${
                isEditMode ? 'boton_guardar_edicion_cliente' : 'boton_guardar_registro_cliente'
              }`}
              type="submit"
              disabled={loading}
            >
              <Save className="h-4 w-4" />
              {loading ? 'Guardando...' : isEditMode ? 'Guardar cambios' : 'Registrar'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default RegistrarCliente;
