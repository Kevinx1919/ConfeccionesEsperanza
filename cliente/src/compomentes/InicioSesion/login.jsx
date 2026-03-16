import React, { useState } from 'react';
import { Eye, EyeOff, KeyRound, LogIn, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiUrl } from '../../config/api';
import './login.css';

const normalizeAuthResponse = (payload) => ({
  isSuccess: payload?.isSuccess ?? payload?.IsSuccess ?? false,
  message: payload?.message ?? payload?.Message ?? '',
  token: payload?.token ?? payload?.Token ?? null,
  user: payload?.user ?? payload?.User ?? null,
  tokenExpiration: payload?.tokenExpiration ?? payload?.TokenExpiration ?? null,
});

const fieldClass =
  'w-full rounded-2xl border border-white/15 bg-white/8 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/45 focus:border-violet-300 focus:bg-white/12 focus:ring-4 focus:ring-violet-400/20';

function Login() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (error) {
      setError('');
    }
  };

  const validateForm = () => {
    if (!formData.email) {
      setError('El correo es obligatorio.');
      return false;
    }

    if (!formData.password) {
      setError('La contraseña es obligatoria.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Ingresa un correo válido.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(apiUrl('/api/Auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const rawData = await response.json();
      const data = normalizeAuthResponse(rawData);

      if (!data.isSuccess) {
        throw new Error(data.message || 'No fue posible iniciar sesión.');
      }

      login({
        token: data.token,
        user: data.user,
        tokenExpiration: data.tokenExpiration,
      });
    } catch (submitError) {
      setError(
        submitError.message ||
          'Error de conexión. Verifica que el servicio de autenticación esté disponible.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-shell">
      <div className="login-shell__glow login-shell__glow--one" />
      <div className="login-shell__glow login-shell__glow--two" />

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid w-full overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(145deg,rgba(15,23,42,0.92)_0%,rgba(49,46,129,0.9)_48%,rgba(126,34,206,0.88)_100%)] shadow-[0_32px_90px_-30px_rgba(76,29,149,0.85)] lg:grid-cols-[1.08fr_0.92fr]">
          <div className="relative hidden overflow-hidden border-r border-white/10 lg:block">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(192,132,252,0.34),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(236,72,153,0.24),transparent_36%)]" />
            <div className="relative flex h-full flex-col justify-between p-10">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-violet-300/25 bg-white/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-violet-100">
                  <Sparkles className="h-3.5 w-3.5" />
                  Confecciones Esperanza
                </div>
                <h1 className="mt-6 max-w-md text-4xl font-bold tracking-tight text-white">
                  Gestiona pedidos, stock y equipo desde un solo lugar.
                </h1>
                <p className="mt-4 max-w-lg text-sm leading-7 text-violet-100/85">
                  Accede a tu panel para revisar el estado operativo del negocio y continuar con tus tareas del día.
                </p>
              </div>

              <div className="grid gap-4">
                <div className="rounded-[24px] border border-white/10 bg-white/8 p-5 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-violet-400/20 p-3 text-violet-100">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Acceso seguro</p>
                      <p className="mt-1 text-[13px] text-violet-100/80">
                        Tus datos se administran desde una sesión autenticada.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-[22px] border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-violet-200">
                      Modulos
                    </p>
                    <p className="mt-2 text-2xl font-bold text-white">6</p>
                  </div>
                  <div className="rounded-[22px] border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-violet-200">
                      Panel central
                    </p>
                    <p className="mt-2 text-2xl font-bold text-white">Activo</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative flex items-center justify-center px-5 py-8 sm:px-8 lg:px-10">
            <div className="w-full max-w-md">
              <div className="rounded-[28px] border border-white/10 bg-white/8 p-6 shadow-[0_24px_70px_-34px_rgba(15,23,42,0.95)] backdrop-blur-xl sm:p-7">
                <div className="text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[20px] border border-violet-300/25 bg-[linear-gradient(135deg,rgba(124,58,237,0.95)_0%,rgba(168,85,247,0.95)_100%)] text-white shadow-[0_18px_40px_-20px_rgba(147,51,234,0.8)]">
                    <LogIn className="h-6 w-6" />
                  </div>
                  <h2 className="mt-5 text-3xl font-bold tracking-tight text-white">
                    Iniciar sesión
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-violet-100/80">
                    Ingresa tus credenciales para acceder al panel principal.
                  </p>
                </div>

                {error ? (
                  <div className="mt-6 rounded-2xl border border-rose-300/20 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-100">
                    {error}
                  </div>
                ) : null}

                <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                  <div>
                    <label
                      htmlFor="campo_email_login"
                      className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-violet-100"
                    >
                      <span className="rounded-lg bg-white/10 p-1 text-violet-100">
                        <Mail className="h-4 w-4" />
                      </span>
                      Correo electrónico
                    </label>
                    <input
                      id="campo_email_login"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="usuario@ejemplo.com"
                      disabled={loading}
                      autoComplete="email"
                      className={fieldClass}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="campo_password_login"
                      className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-violet-100"
                    >
                      <span className="rounded-lg bg-white/10 p-1 text-violet-100">
                        <KeyRound className="h-4 w-4" />
                      </span>
                      Contraseña
                    </label>
                    <div className="relative">
                      <input
                        id="campo_password_login"
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Ingresa tu contraseña"
                        disabled={loading}
                        autoComplete="current-password"
                        className={`${fieldClass} pr-12`}
                      />
                      <button
                        id="boton_mostrar_password_login"
                        type="button"
                        className="absolute right-3 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-xl p-2 text-violet-100/80 transition hover:bg-white/8 hover:text-white focus:outline-none focus:ring-2 focus:ring-violet-300/30"
                        onClick={() => setShowPassword((prev) => !prev)}
                        disabled={loading}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <label className="inline-flex items-center gap-3 text-sm text-violet-100/85">
                    <span className="relative inline-flex h-4 w-4 items-center justify-center">
                      <input
                        id="campo_recordarme_login"
                        type="checkbox"
                        name="rememberMe"
                        checked={formData.rememberMe}
                        onChange={handleChange}
                        disabled={loading}
                        className="peer absolute inset-0 cursor-pointer appearance-none rounded border border-white/20 bg-white/8 checked:border-violet-300 checked:bg-violet-500/70"
                      />
                      <span className="pointer-events-none text-[10px] font-bold text-white opacity-0 transition peer-checked:opacity-100">
                        ✓
                      </span>
                    </span>
                    Recordarme en este equipo
                  </label>

                  <button
                    id="boton_iniciar_sesion_login"
                    type="submit"
                    disabled={loading}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#ffffff_0%,#f3e8ff_45%,#ddd6fe_100%)] px-5 py-3 text-sm font-bold text-violet-950 shadow-[0_22px_50px_-24px_rgba(255,255,255,0.8)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_55px_-22px_rgba(255,255,255,0.95)] focus:outline-none focus:ring-4 focus:ring-violet-300/25 disabled:opacity-70"
                  >
                    {loading ? (
                      <>
                        <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-violet-900/20 border-t-violet-900" />
                        Iniciando sesión...
                      </>
                    ) : (
                      <>
                        <LogIn className="h-4 w-4" />
                        Iniciar sesión
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 border-t border-white/10 pt-5 text-center text-sm text-violet-100/80">
                  <p>
                    ¿No tienes cuenta?{' '}
                    <a
                      className="font-semibold text-white underline decoration-white/25 underline-offset-4 transition hover:decoration-white"
                      href="/register"
                    >
                      Regístrate aquí
                    </a>
                  </p>
                  <p className="mt-2">
                    <a
                      className="font-semibold text-violet-100 underline decoration-violet-200/25 underline-offset-4 transition hover:text-white hover:decoration-white"
                      href="/forgot-password"
                    >
                      ¿Olvidaste tu contraseña?
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Login;
