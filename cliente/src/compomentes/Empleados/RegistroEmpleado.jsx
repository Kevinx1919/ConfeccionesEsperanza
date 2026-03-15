import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BadgeCheck,
  KeyRound,
  Mail,
  Phone,
  Save,
  Shield,
  UserRound,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiUrl } from '../../config/api';
import { readCollection } from '../../utils/apiResponse';

const formFieldClass =
  'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100';

const sectionCardClass =
  'rounded-[24px] border border-slate-200 bg-slate-50/80 p-4 shadow-sm';

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

function RegistroEmpleado() {
  const navigate = useNavigate();
  const { getAuthHeaders } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    userName: '',
    password: '',
    phoneNumber: '',
    roles: [],
  });
  const [availableRoles, setAvailableRoles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoadingRoles(true);
        const response = await fetch(apiUrl('/api/Roles'), {
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          throw new Error('No se pudieron cargar los roles');
        }

        const data = await response.json();
        const roles = Array.isArray(data) ? data : readCollection(data, ['roles', 'items', 'data']);
        setAvailableRoles(roles.map((role) => role.name ?? role.Name ?? '').filter(Boolean));
      } catch (fetchError) {
        setError(fetchError.message || 'No se pudieron cargar los roles');
      } finally {
        setLoadingRoles(false);
      }
    };

    fetchRoles();
  }, [getAuthHeaders]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleRoleToggle = (role) => {
    setFormData((prevFormData) => {
      const alreadySelected = prevFormData.roles.includes(role);

      return {
        ...prevFormData,
        roles: alreadySelected
          ? prevFormData.roles.filter((currentRole) => currentRole !== role)
          : [...prevFormData.roles, role],
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    if (formData.roles.length === 0) {
      setError('Selecciona al menos un rol para el empleado.');
      setSaving(false);
      return;
    }

    try {
      const payload = {
        email: formData.email,
        userName: formData.userName,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        roles: formData.roles,
      };

      const response = await fetch(apiUrl('/api/User'), {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || data.Message || 'Error al registrar el empleado');
      }

      setSuccess('Empleado registrado correctamente');
      setTimeout(() => navigate('/listarEmpleados'), 1200);
    } catch (submitError) {
      setError(submitError.message || 'Error al registrar el empleado');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[104rem] px-4 py-3 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_24px_80px_-32px_rgba(15,23,42,0.35)]">
        <div className="border-b border-slate-200 bg-[linear-gradient(135deg,#ecfeff_0%,#eff6ff_55%,#eef2ff_100%)] px-5 py-4 sm:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center rounded-full border border-sky-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
              Talento humano
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Registrar Empleado
            </h2>
            <p className="mt-1.5 text-sm leading-6 text-slate-600 sm:text-base">
              Crea usuarios del sistema con una configuracion clara, consistente y adaptable a cualquier pantalla.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 sm:px-8 sm:py-5">
          {error ? (
            <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              {success}
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.15fr_0.85fr]">
            <section className={sectionCardClass}>
              <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-900">Datos de acceso</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Completa la informacion principal para crear la cuenta del empleado.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <FieldLabel htmlFor="campo_usuario_empleado" icon={UserRound}>
                    Nombre de usuario
                  </FieldLabel>
                  <input
                    id="campo_usuario_empleado"
                    className={formFieldClass}
                    type="text"
                    name="userName"
                    value={formData.userName}
                    onChange={handleChange}
                    required
                    disabled={saving}
                  />
                </div>

                <div>
                  <FieldLabel htmlFor="campo_correo_empleado" icon={Mail}>
                    Correo electronico
                  </FieldLabel>
                  <input
                    id="campo_correo_empleado"
                    className={formFieldClass}
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={saving}
                  />
                </div>

                <div>
                  <FieldLabel htmlFor="campo_password_empleado" icon={KeyRound}>
                    Contrasena
                  </FieldLabel>
                  <input
                    id="campo_password_empleado"
                    className={formFieldClass}
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    disabled={saving}
                  />
                </div>

                <div>
                  <FieldLabel htmlFor="campo_telefono_empleado" icon={Phone}>
                    Telefono
                  </FieldLabel>
                  <input
                    id="campo_telefono_empleado"
                    className={formFieldClass}
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="Opcional"
                    disabled={saving}
                  />
                </div>
              </div>
            </section>

            <section className={sectionCardClass}>
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Roles</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Define el alcance de permisos del nuevo empleado.
                  </p>
                </div>
                <span className="rounded-xl bg-sky-100 p-2 text-sky-700">
                  <Shield className="h-5 w-5" />
                </span>
              </div>

              {loadingRoles ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm text-slate-500">
                  Cargando roles disponibles...
                </div>
              ) : availableRoles.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm text-slate-500">
                  No hay roles disponibles para asignar.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {availableRoles.map((role) => {
                    const selected = formData.roles.includes(role);

                    return (
                      <label
                        key={role}
                        htmlFor={`checkbox_rol_${role.toLowerCase()}_empleado`}
                        className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition ${
                          selected
                            ? 'border-sky-300 bg-sky-50 text-sky-900'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          id={`checkbox_rol_${role.toLowerCase()}_empleado`}
                          className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-400"
                          type="checkbox"
                          checked={selected}
                          onChange={() => handleRoleToggle(role)}
                          disabled={saving}
                        />
                        <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                          <span className="truncate text-sm font-semibold">{role}</span>
                          {selected ? <BadgeCheck className="h-4 w-4 shrink-0 text-sky-700" /> : null}
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}

              <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                <span className="font-semibold text-slate-900">Roles seleccionados:</span>{' '}
                {formData.roles.length > 0 ? formData.roles.join(', ') : 'Ninguno'}
              </div>
            </section>
          </div>

          <div className="mt-5 flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
            <button
              id="boton_cancelar_registro_empleado"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60 boton_cancelar_registro_empleado"
              type="button"
              onClick={() => navigate('/listarEmpleados')}
              disabled={saving}
            >
              <ArrowLeft className="h-4 w-4" />
              Cancelar
            </button>
            <button
              id="boton_guardar_registro_empleado"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_100%)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-sky-500/25 focus:outline-none focus:ring-4 focus:ring-sky-200 disabled:cursor-not-allowed disabled:opacity-60 boton_guardar_registro_empleado"
              type="submit"
              disabled={saving}
            >
              <Save className="h-4 w-4" />
              {saving ? 'Guardando...' : 'Registrar empleado'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default RegistroEmpleado;
