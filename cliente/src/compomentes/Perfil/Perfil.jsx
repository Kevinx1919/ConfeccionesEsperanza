import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BadgeCheck,
  KeyRound,
  Mail,
  Phone,
  Save,
  ShieldAlert,
  ShieldCheck,
  UserRound,
  X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiUrl } from '../../config/api';

const panelClass =
  'overflow-hidden rounded-[24px] border border-violet-100 bg-white shadow-[0_24px_80px_-32px_rgba(15,23,42,0.35)]';

const fieldClass =
  'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-[12px] text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100';

const buttonBaseClass =
  'inline-flex items-center justify-center gap-2 rounded-2xl text-sm font-semibold transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60';

const FieldLabel = ({ htmlFor, icon: Icon, children }) => (
  <label
    htmlFor={htmlFor}
    className="mb-1.5 inline-flex items-center gap-2 text-[13px] font-semibold text-slate-700"
  >
    <span className="rounded-lg bg-violet-100 p-1 text-violet-700">
      <Icon className="h-3.5 w-3.5" />
    </span>
    {children}
  </label>
);

const StatusPill = ({ tone = 'neutral', children }) => {
  const toneClass =
    tone === 'success'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : tone === 'warning'
        ? 'border-amber-200 bg-amber-50 text-amber-700'
        : tone === 'danger'
          ? 'border-rose-200 bg-rose-50 text-rose-700'
          : tone === 'violet'
            ? 'border-violet-200 bg-violet-50 text-violet-700'
            : 'border-slate-200 bg-slate-100 text-slate-700';

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${toneClass}`}
    >
      {children}
    </span>
  );
};

const InfoCard = ({ label, value, accent = 'violet', extra = null }) => {
  const accentClass =
    accent === 'sky'
      ? 'before:bg-sky-500'
      : accent === 'emerald'
        ? 'before:bg-emerald-500'
        : accent === 'rose'
          ? 'before:bg-rose-500'
          : accent === 'amber'
            ? 'before:bg-amber-500'
            : 'before:bg-violet-500';

  return (
    <article
      className={`relative overflow-hidden rounded-[16px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#faf7ff_100%)] p-2.5 shadow-[0_16px_35px_-28px_rgba(15,23,42,0.45)] before:absolute before:left-0 before:top-0 before:h-full before:w-1 ${accentClass}`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <div className="mt-1.5 break-words text-[13px] font-semibold text-slate-900">{value}</div>
      {extra ? <div className="mt-1.5">{extra}</div> : null}
    </article>
  );
};

function Perfil() {
  const { getAuthHeaders } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    userName: '',
    email: '',
    phoneNumber: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(apiUrl('/api/Auth/profile'), {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Error al cargar el perfil');
      }

      const data = await response.json();
      setProfileData(data);
      setEditFormData({
        userName: data.userName || '',
        email: data.email || '',
        phoneNumber: data.phoneNumber || '',
      });
      setError('');
    } catch (fetchError) {
      setError(fetchError.message || 'Error de conexion');
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateProfile = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(apiUrl('/api/Auth/profile'), {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(editFormData),
      });

      const result = await response.json();
      const wasSuccessful = result.isSuccess ?? result.IsSuccess ?? false;
      const resultMessage = result.message ?? result.Message ?? '';

      if (!wasSuccessful) {
        throw new Error(resultMessage || 'No se pudo actualizar el perfil');
      }

      setSuccess('Perfil actualizado correctamente');
      setIsEditing(false);
      await fetchProfile();
    } catch (updateError) {
      setError(updateError.message || 'Error de conexion');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditFormData({
      userName: profileData?.userName || '',
      email: profileData?.email || '',
      phoneNumber: profileData?.phoneNumber || '',
    });
    setError('');
    setSuccess('');
  };

  const initialLetter = profileData?.userName?.charAt(0)?.toUpperCase() || 'U';

  const resumenCuenta = useMemo(
    () => [
      {
        label: 'Correo',
        value: profileData?.email || 'No registrado',
        accent: 'violet',
        extra: profileData?.emailConfirmed ? (
          <StatusPill tone="success">Confirmado</StatusPill>
        ) : (
          <StatusPill tone="warning">Pendiente</StatusPill>
        ),
      },
      {
        label: 'Telefono',
        value: profileData?.phoneNumber || 'No especificado',
        accent: 'sky',
        extra: profileData?.phoneNumberConfirmed ? (
          <StatusPill tone="success">Verificado</StatusPill>
        ) : (
          <StatusPill tone="neutral">Sin confirmar</StatusPill>
        ),
      },
      {
        label: 'Autenticacion 2FA',
        value: profileData?.twoFactorEnabled ? 'Habilitada' : 'Deshabilitada',
        accent: 'emerald',
        extra: profileData?.twoFactorEnabled ? (
          <StatusPill tone="success">Activa</StatusPill>
        ) : (
          <StatusPill tone="neutral">Inactiva</StatusPill>
        ),
      },
      {
        label: 'Estado de la cuenta',
        value:
          profileData?.lockoutEnabled && profileData?.lockoutEnd ? 'Bloqueada' : 'Normal',
        accent: profileData?.lockoutEnabled && profileData?.lockoutEnd ? 'rose' : 'emerald',
        extra:
          profileData?.lockoutEnabled && profileData?.lockoutEnd ? (
            <StatusPill tone="danger">Bloqueada</StatusPill>
          ) : (
            <StatusPill tone="success">Activa</StatusPill>
          ),
      },
      {
        label: 'Roles',
        value:
          profileData?.roles?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profileData.roles.map((role) => (
                <StatusPill key={role} tone="violet">
                  {role}
                </StatusPill>
              ))}
            </div>
          ) : (
            'Sin roles asignados'
          ),
        accent: 'violet',
      },
    ],
    [profileData],
  );

  if (loading && !profileData) {
    return (
      <div className="mx-auto w-full max-w-[88rem] px-4 py-6 sm:px-6 lg:px-8">
        <div className={`${panelClass} p-6 text-center`}>
          <div className="mx-auto flex h-10 w-10 animate-spin items-center justify-center rounded-full border-4 border-violet-100 border-t-violet-500" />
          <p className="mt-3 text-sm font-medium text-slate-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[104rem] px-4 py-2.5 sm:px-6 lg:px-8">
      <section className={`${panelClass} overflow-visible`}>
        <div className="border-b border-violet-100 bg-[linear-gradient(135deg,#ffffff_0%,#f5f3ff_32%,#ede9fe_60%,#faf5ff_100%)] px-5 py-3 sm:px-6">
          <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-[28px] bg-[radial-gradient(circle_at_center,#c084fc_0%,rgba(168,85,247,0.38)_45%,rgba(255,255,255,0)_75%)] blur-xl" />
                <div className="relative flex h-12 w-12 items-center justify-center rounded-[18px] border border-violet-200 bg-[linear-gradient(135deg,#7c3aed_0%,#9333ea_45%,#c026d3_100%)] text-[1.2rem] font-bold text-white shadow-[0_18px_50px_-20px_rgba(147,51,234,0.85)]">
                  {initialLetter}
                </div>
              </div>

              <div>
                <span className="inline-flex items-center rounded-full border border-violet-200 bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-700">
                  Perfil de usuario
                </span>
                <h1 className="mt-1.5 text-[1.28rem] font-bold tracking-tight text-slate-900 sm:text-[1.6rem]">
                  Mi Perfil
                </h1>
                <p className="mt-1 max-w-2xl text-[11px] leading-4 text-slate-600">
                  Consulta tus datos personales, el estado de tu cuenta y la configuracion de acceso.
                </p>
              </div>
            </div>

            {!isEditing ? (
              <button
                id="boton_editar_perfil_usuario"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#6366f1_0%,#7c3aed_45%,#a855f7_100%)] px-4 py-1.5 text-[11px] font-semibold text-white shadow-[0_18px_40px_-20px_rgba(124,58,237,0.55)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_44px_-20px_rgba(124,58,237,0.7)] focus:outline-none focus:ring-4 focus:ring-violet-200 disabled:opacity-60 boton_editar_perfil_usuario"
                onClick={() => setIsEditing(true)}
                disabled={loading}
              >
                <BadgeCheck className="h-3 w-3" />
                Editar perfil
              </button>
            ) : null}
          </div>
        </div>

        <div className="px-5 py-2.5 sm:px-6 sm:py-3">
          {error ? (
            <div className="mb-2.5 flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-[12px] font-medium text-rose-700">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}

          {success ? (
            <div className="mb-2.5 flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-[12px] font-medium text-emerald-700">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{success}</span>
            </div>
          ) : null}

          {isEditing ? (
            <form onSubmit={handleUpdateProfile} className="grid gap-2">
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
                <div>
                  <FieldLabel htmlFor="campo_nombre_usuario_perfil" icon={UserRound}>
                    Nombre de usuario
                  </FieldLabel>
                  <input
                    id="campo_nombre_usuario_perfil"
                    className={fieldClass}
                    type="text"
                    name="userName"
                    value={editFormData.userName}
                    onChange={handleEditChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <FieldLabel htmlFor="campo_email_perfil" icon={Mail}>
                    Correo electronico
                  </FieldLabel>
                  <input
                    id="campo_email_perfil"
                    className={fieldClass}
                    type="email"
                    name="email"
                    value={editFormData.email}
                    onChange={handleEditChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <FieldLabel htmlFor="campo_telefono_perfil" icon={Phone}>
                    Telefono
                  </FieldLabel>
                  <input
                    id="campo_telefono_perfil"
                    className={fieldClass}
                    type="tel"
                    name="phoneNumber"
                    value={editFormData.phoneNumber}
                    onChange={handleEditChange}
                    placeholder="Numero de contacto"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-2 sm:flex-row sm:justify-end">
                <button
                  id="boton_cancelar_edicion_perfil"
                  className={`${buttonBaseClass} border border-slate-300 bg-white px-4 py-1.5 text-[11px] text-slate-700 hover:border-slate-400 hover:bg-slate-50 focus:ring-slate-200 boton_cancelar_edicion_perfil`}
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={loading}
                >
                  <X className="h-3 w-3" />
                  Cancelar
                </button>
                <button
                  id="boton_guardar_edicion_perfil"
                  className={`${buttonBaseClass} bg-[linear-gradient(135deg,#6366f1_0%,#7c3aed_45%,#a855f7_100%)] px-4 py-1.5 text-[11px] text-white shadow-[0_18px_40px_-20px_rgba(124,58,237,0.45)] hover:-translate-y-0.5 hover:shadow-[0_22px_44px_-20px_rgba(124,58,237,0.62)] focus:ring-violet-200 boton_guardar_edicion_perfil`}
                  type="submit"
                  disabled={loading}
                >
                  <Save className="h-3 w-3" />
                  {loading ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
                  <InfoCard label="ID de usuario" value={profileData?.id || 'N/A'} accent="violet" />
                  <InfoCard
                    label="Nombre de usuario"
                    value={profileData?.userName || 'N/A'}
                    accent="sky"
                  />
                  <InfoCard
                    label="Correo"
                    value={profileData?.email || 'N/A'}
                    accent="violet"
                    extra={
                      profileData?.emailConfirmed ? (
                        <StatusPill tone="success">Confirmado</StatusPill>
                      ) : (
                        <StatusPill tone="warning">Pendiente</StatusPill>
                      )
                    }
                  />
              </div>

              <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
                {resumenCuenta.map((item) => (
                  <InfoCard
                    key={item.label}
                    label={item.label}
                    value={item.value}
                    accent={item.accent}
                    extra={item.extra}
                  />
                ))}
              </div>

              <section className="mt-2 rounded-[20px] border border-violet-200 bg-[linear-gradient(145deg,#0f172a_0%,#1e1b4b_35%,#312e81_72%,#6d28d9_100%)] p-2.5 text-white shadow-[0_24px_60px_-28px_rgba(76,29,149,0.85)]">
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-violet-200">
                      Seguridad de la cuenta
                    </p>
                    <h2 className="mt-1 text-[0.85rem] font-bold">Acceso protegido</h2>
                    <p className="mt-1 max-w-xl text-[11px] text-violet-100/90">
                      Consulta el estado general de acceso y los metodos de verificacion de tu cuenta.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/10 p-1.5">
                    <KeyRound className="h-3 w-3 text-violet-100" />
                  </div>
                </div>

                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/10 p-1.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-200">
                      Estado general
                    </p>
                    <p className="mt-1 text-[12px] font-semibold">
                      {profileData?.lockoutEnabled && profileData?.lockoutEnd ? 'Bloqueada' : 'Normal'}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/10 p-1.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-200">
                      Verificacion en dos pasos
                    </p>
                    <p className="mt-1 text-[12px] font-semibold">
                      {profileData?.twoFactorEnabled ? 'Activa' : 'Inactiva'}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/10 p-1.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-200">
                      Roles asignados
                    </p>
                    <p className="mt-1 text-[12px] font-semibold">{profileData?.roles?.length || 0}</p>
                  </div>
                </div>

                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {profileData?.twoFactorEnabled ? (
                    <StatusPill tone="success">2FA activa</StatusPill>
                  ) : (
                    <StatusPill tone="neutral">2FA inactiva</StatusPill>
                  )}
                  {profileData?.emailConfirmed ? (
                    <StatusPill tone="success">Correo verificado</StatusPill>
                  ) : (
                    <StatusPill tone="warning">Correo pendiente</StatusPill>
                  )}
                  {profileData?.lockoutEnabled && profileData?.lockoutEnd ? (
                    <StatusPill tone="danger">Cuenta bloqueada</StatusPill>
                  ) : (
                    <StatusPill tone="violet">Estado normal</StatusPill>
                  )}
                </div>
              </section>

              <div className="mt-2 flex justify-center md:justify-end">
                <button
                  id="boton_volver_perfil"
                  className={`${buttonBaseClass} bg-[linear-gradient(135deg,#111827_0%,#312e81_55%,#7c3aed_100%)] px-4 py-1.5 text-[11px] text-white shadow-[0_18px_40px_-20px_rgba(79,70,229,0.38)] hover:-translate-y-0.5 hover:shadow-[0_22px_44px_-20px_rgba(124,58,237,0.55)] focus:ring-violet-200 boton_volver_perfil`}
                  onClick={() => navigate('/')}
                >
                  <ArrowLeft className="h-3 w-3" />
                  Volver
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default Perfil;
