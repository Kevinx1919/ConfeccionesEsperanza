import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlignLeft, ArrowLeft, ClipboardCheck, FileText, MessageSquare, Save } from 'lucide-react';
import { apiUrl } from '../../config/api';

const TASK_API_URL = apiUrl('/api/Task');

const initialState = {
  nombreTarea: '',
  descripcion: '',
  comentarios: '',
};

const fieldClass =
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

function RegistrarTarea() {
  const navigate = useNavigate();
  const [tarea, setTarea] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setTarea((prev) => ({ ...prev, [name]: value }));
    if (error) {
      setError('');
    }
  };

  const validate = () => {
    if (!tarea.nombreTarea.trim() || !tarea.descripcion.trim()) {
      setError('El nombre y la descripcion son obligatorios.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(TASK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(tarea),
      });

      if (!response.ok) {
        throw new Error('No se pudo registrar la tarea');
      }

      navigate('/consultarTareas');
    } catch (submitError) {
      setError('No se pudo registrar la tarea. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[114rem] px-4 py-1.5 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_24px_80px_-32px_rgba(15,23,42,0.35)]">
        <div className="border-b border-slate-200 bg-[linear-gradient(135deg,#ecfeff_0%,#eff6ff_55%,#eef2ff_100%)] px-5 py-3 sm:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center rounded-full border border-sky-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
              Planeacion operativa
            </span>
            <h2 className="mt-2.5 text-[1.9rem] font-bold tracking-tight text-slate-900 sm:text-[2.35rem]">
              Registrar Tarea
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Crea una tarea.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-2.5 sm:px-8 sm:py-3">
          {error ? (
            <div className="mb-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {error}
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-2.5">
            <div>
              <FieldLabel htmlFor="campo_nombre_tarea" icon={ClipboardCheck}>
                Nombre de la tarea
              </FieldLabel>
              <input
                id="campo_nombre_tarea"
                className={`${fieldClass} bg-sky-50 font-semibold ring-1 ring-sky-100 focus:bg-white`}
                type="text"
                name="nombreTarea"
                value={tarea.nombreTarea}
                onChange={handleChange}
                maxLength={100}
                placeholder="Ej: Corte de manga base"
                required
                disabled={loading}
              />
            </div>

            <div>
              <FieldLabel htmlFor="campo_descripcion_tarea" icon={AlignLeft}>
                Descripcion
              </FieldLabel>
              <textarea
                id="campo_descripcion_tarea"
                className={`${fieldClass} min-h-[7.25rem] resize-y`}
                name="descripcion"
                value={tarea.descripcion}
                onChange={handleChange}
                maxLength={300}
                placeholder="Describe el objetivo y el alcance de la tarea."
                required
                disabled={loading}
              />
            </div>

            <div>
              <FieldLabel htmlFor="campo_comentarios_tarea" icon={MessageSquare}>
                Comentarios
              </FieldLabel>
              <textarea
                id="campo_comentarios_tarea"
                className={`${fieldClass} min-h-[5.75rem] resize-y`}
                name="comentarios"
                value={tarea.comentarios}
                onChange={handleChange}
                maxLength={300}
                placeholder="Anota observaciones importantes para el equipo."
                disabled={loading}
              />
            </div>
          </div>

          <div className="mt-3 flex flex-col-reverse gap-3 border-t border-slate-200 pt-3 sm:flex-row sm:justify-end">
            <button
              id="boton_cancelar_registro_tarea"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200 boton_cancelar_registro_tarea"
              type="button"
              onClick={() => navigate('/tareas')}
              disabled={loading}
            >
              <ArrowLeft className="h-4 w-4" />
              Cancelar
            </button>
            <button
              id="boton_guardar_registro_tarea"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_100%)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-sky-500/25 focus:outline-none focus:ring-4 focus:ring-sky-200 disabled:cursor-not-allowed disabled:opacity-60 boton_guardar_registro_tarea"
              type="submit"
              disabled={loading}
            >
              {loading ? <FileText className="h-4 w-4 animate-pulse" /> : <Save className="h-4 w-4" />}
              {loading ? 'Guardando...' : 'Registrar'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default RegistrarTarea;
