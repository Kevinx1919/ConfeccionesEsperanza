import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BadgeCheck,
  Mail,
  Phone,
  Save,
  Shield,
  ShieldCheck,
  Smartphone,
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

function EditarEmpleado() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getAuthHeaders } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [availableRoles, setAvailableRoles] = useState([]);
  const [initialRoles, setInitialRoles] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    phoneNumber: '',
    emailConfirmed: false,
    phoneNumberConfirmed: false,
    twoFactorEnabled: false,
    lockoutEnabled: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [empleadoResponse, rolesResponse] = await Promise.all([
          fetch(apiUrl(`/api/User/${id}`), {
            headers: getAuthHeaders(),
          }),
          fetch(apiUrl('/api/Roles'), {
            headers: getAuthHeaders(),
          }),
        ]);

        if (!empleadoResponse.ok) {
          throw new Error('No se pudo cargar el empleado');
        }

        const empleado = await empleadoResponse.json();
        setFormData({
          userName: empleado.userName || '',
          email: empleado.email || '',
          phoneNumber: empleado.phoneNumber || '',
          emailConfirmed: Boolean(empleado.emailConfirmed),
          phoneNumberConfirmed: Boolean(empleado.phoneNumberConfirmed),
          twoFactorEnabled: Boolean(empleado.twoFactorEnabled),
          lockoutEnabled: Boolean(empleado.lockoutEnabled),
        });

        const rolesEmpleado = empleado.roles || [];
        setInitialRoles(rolesEmpleado);
        setSelectedRoles(rolesEmpleado);

        if (rolesResponse.ok) {
          const rolesData = await rolesResponse.json();
          const roles = Array.isArray(rolesData)
            ? rolesData
            : readCollection(rolesData, ['roles', 'items', 'data']);
          setAvailableRoles(roles.map((role) => role.name ?? role.Name ?? '').filter(Boolean));
        }
      } catch (fetchError) {
        setError(fetchError.message || 'No se pudo cargar la informacion del empleado');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [getAuthHeaders, id]);

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleRoleToggle = (role) => {
    setSelectedRoles((prevRoles) => {
      const alreadySelected = prevRoles.includes(role);

      if (alreadySelected && prevRoles.length === 1) {
        return prevRoles;
      }

      return alreadySelected
        ? prevRoles.filter((currentRole) => currentRole !== role)
        : [...prevRoles, role];
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        email: formData.email,
        userName: formData.userName,
        phoneNumber: formData.phoneNumber,
        emailConfirmed: formData.emailConfirmed,
        phoneNumberConfirmed: formData.phoneNumberConfirmed,
        twoFactorEnabled: formData.twoFactorEnabled,
        lockoutEnabled: formData.lockoutEnabled,
        roles: selectedRoles,
      };

      const updateResponse = await fetch(apiUrl(`/api/User/${id}`), {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!updateResponse.ok) {
        throw new Error('No se pudo actualizar el empleado');
      }

      const rolesToAdd = selectedRoles.filter((role) => !initialRoles.includes(role));
      const rolesToRemove = initialRoles.filter((role) => !selectedRoles.includes(role));

      await Promise.all([
        ...rolesToAdd.map((role) =>
          fetch(apiUrl('/api/Roles/assign'), {
            method: 'POST',
            headers: {
              ...getAuthHeaders(),
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: id, roleName: role }),
          }),
        ),
        ...rolesToRemove.map((role) =>
          fetch(apiUrl('/api/Roles/remove'), {
            method: 'POST',
            headers: {
              ...getAuthHeaders(),
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: id, roleName: role }),
          }),
        ),
      ]);

      setInitialRoles(selectedRoles);
      setSuccess('Empleado actualizado correctamente');
      setTimeout(() => navigate('/listarEmpleados'), 1200);
    } catch (submitError) {
      setError(submitError.message || 'No se pudo actualizar el empleado');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[74rem] px-4 py-4 sm:px-6">
        <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-[0_24px_60px_-35px_rgba(15,23,42,0.35)]">
          <p className="text-base font-medium text-slate-600">Cargando datos del empleado...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[104rem] px-4 py-3 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_24px_80px_-32px_rgba(15,23,42,0.35)]">
        <div className="border-b border-slate-200 bg-[linear-gradient(135deg,#eff6ff_0%,#f8fafc_55%,#eef2ff_100%)] px-5 py-4 sm:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center rounded-full border border-sky-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
              Gestion interna
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Editar Empleado
            </h2>
            <p className="mt-1.5 text-sm leading-6 text-slate-600 sm:text-base">
              Actualiza datos de acceso, estado de la cuenta y roles con una vista consistente y estable.
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

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <section className={sectionCardClass}>
              <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-900">Datos del empleado</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Edita la informacion principal y el estado operativo de la cuenta.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <FieldLabel htmlFor="campo_editar_usuario_empleado" icon={UserRound}>
                    Nombre de usuario
                  </FieldLabel>
                  <input
                    id="campo_editar_usuario_empleado"
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
                  <FieldLabel htmlFor="campo_editar_email_empleado" icon={Mail}>
                    Correo electronico
                  </FieldLabel>
                  <input
                    id="campo_editar_email_empleado"
                    className={formFieldClass}
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={saving}
                  />
                </div>

                <div className="md:col-span-2">
                  <FieldLabel htmlFor="campo_editar_telefono_empleado" icon={Phone}>
                    Telefono
                  </FieldLabel>
                  <input
                    id="campo_editar_telefono_empleado"
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

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label
                  htmlFor="checkbox_email_confirmado_empleado"
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
                >
                  <input
                    id="checkbox_email_confirmado_empleado"
                    className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-400"
                    type="checkbox"
                    name="emailConfirmed"
                    checked={formData.emailConfirmed}
                    onChange={handleChange}
                    disabled={saving}
                  />
                  <Mail className="h-4 w-4 text-sky-700" />
                  Email confirmado
                </label>

                <label
                  htmlFor="checkbox_telefono_confirmado_empleado"
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
                >
                  <input
                    id="checkbox_telefono_confirmado_empleado"
                    className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-400"
                    type="checkbox"
                    name="phoneNumberConfirmed"
                    checked={formData.phoneNumberConfirmed}
                    onChange={handleChange}
                    disabled={saving}
                  />
                  <Smartphone className="h-4 w-4 text-sky-700" />
                  Telefono confirmado
                </label>

                <label
                  htmlFor="checkbox_2fa_empleado"
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
                >
                  <input
                    id="checkbox_2fa_empleado"
                    className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-400"
                    type="checkbox"
                    name="twoFactorEnabled"
                    checked={formData.twoFactorEnabled}
                    onChange={handleChange}
                    disabled={saving}
                  />
                  <ShieldCheck className="h-4 w-4 text-sky-700" />
                  Autenticacion 2FA
                </label>

                <label
                  htmlFor="checkbox_bloqueo_empleado"
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
                >
                  <input
                    id="checkbox_bloqueo_empleado"
                    className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-400"
                    type="checkbox"
                    name="lockoutEnabled"
                    checked={formData.lockoutEnabled}
                    onChange={handleChange}
                    disabled={saving}
                  />
                  <Shield className="h-4 w-4 text-sky-700" />
                  Cuenta bloqueada
                </label>
              </div>
            </section>

            <section className={sectionCardClass}>
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Roles asignados</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Ajusta los permisos sin perder consistencia visual ni control.
                  </p>
                </div>
                <span className="rounded-xl bg-sky-100 p-2 text-sky-700">
                  <Shield className="h-5 w-5" />
                </span>
              </div>

              {availableRoles.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm text-slate-500">
                  No hay roles disponibles para mostrar.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {availableRoles.map((role) => {
                    const selected = selectedRoles.includes(role);

                    return (
                      <label
                        key={role}
                        htmlFor={`checkbox_editar_rol_${role.toLowerCase()}_empleado`}
                        className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition ${
                          selected
                            ? 'border-sky-300 bg-sky-50 text-sky-900'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          id={`checkbox_editar_rol_${role.toLowerCase()}_empleado`}
                          className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-400"
                          type="checkbox"
                          checked={selected}
                          onChange={() => handleRoleToggle(role)}
                          disabled={saving || (selected && selectedRoles.length === 1)}
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
                <span className="font-semibold text-slate-900">Roles actuales:</span>{' '}
                {selectedRoles.length > 0 ? selectedRoles.join(', ') : 'Ninguno'}
              </div>
            </section>
          </div>

          <div className="mt-5 flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
            <button
              id="boton_cancelar_edicion_empleado"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60 boton_cancelar_edicion_empleado"
              type="button"
              onClick={() => navigate('/listarEmpleados')}
              disabled={saving}
            >
              <ArrowLeft className="h-4 w-4" />
              Cancelar
            </button>
            <button
              id="boton_guardar_edicion_empleado"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_100%)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-sky-500/25 focus:outline-none focus:ring-4 focus:ring-sky-200 disabled:cursor-not-allowed disabled:opacity-60 boton_guardar_edicion_empleado"
              type="submit"
              disabled={saving}
            >
              <Save className="h-4 w-4" />
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default EditarEmpleado;
