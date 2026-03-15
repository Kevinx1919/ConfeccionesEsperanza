import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlignLeft, ArrowLeft, ClipboardCheck, MessageSquare, Save } from 'lucide-react';
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

function EditarTarea() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [tarea, setTarea] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTarea = async () => {
      try {
        setLoading(true);
        setError('');

        const token = localStorage.getItem('token');
        const response = await fetch(`${TASK_API_URL}/${id}`, {
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });

        if (!response.ok) {
          throw new Error('No se pudo cargar la tarea');
        }

        const data = await response.json();
        setTarea({
          nombreTarea: data.nombreTarea ?? data.NombreTarea ?? '',
          descripcion: data.descripcion ?? data.Descripcion ?? '',
          comentarios: data.comentarios ?? data.Comentarios ?? '',
        });
      } catch (fetchError) {
        setError('No se pudo cargar la tarea.');
      } finally {
        setLoading(false);
      }
    };

    fetchTarea();
  }, [id]);

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
      const response = await fetch(`${TASK_API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(tarea),
      });

      if (!response.ok) {
        throw new Error('No se pudo actualizar la tarea');
      }

      navigate('/consultarTareas');
    } catch (submitError) {
      setError('No se pudo actualizar la tarea. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !tarea.nombreTarea && !error) {
    return (
      <div className="mx-auto w-full max-w-[74rem] px-4 py-4 sm:px-6">
        <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-[0_24px_60px_-35px_rgba(15,23,42,0.35)]">
          <p className="text-base font-medium text-slate-600">Cargando tarea...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[108rem] px-4 py-2 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_24px_80px_-32px_rgba(15,23,42,0.35)]">
        <div className="border-b border-slate-200 bg-[linear-gradient(135deg,#ecfeff_0%,#eff6ff_55%,#eef2ff_100%)] px-5 py-4 sm:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center rounded-full border border-sky-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
              Planeacion operativa
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Editar Tarea
            </h2>
            <p className="mt-1.5 text-sm leading-6 text-slate-600 sm:text-base">
              Ajusta la informacion de la tarea.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-3 sm:px-8 sm:py-4">
          {error ? (
            <div className="mb-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {error}
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-3">
            <div>
              <FieldLabel htmlFor="campo_nombre_tarea_editar" icon={ClipboardCheck}>
                Nombre de la tarea
              </FieldLabel>
              <input
                id="campo_nombre_tarea_editar"
                className={`${fieldClass} bg-sky-50 font-semibold ring-1 ring-sky-100 focus:bg-white`}
                type="text"
                name="nombreTarea"
                value={tarea.nombreTarea}
                onChange={handleChange}
                maxLength={100}
                required
                disabled={loading}
              />
            </div>

            <div>
              <FieldLabel htmlFor="campo_descripcion_tarea_editar" icon={AlignLeft}>
                Descripcion
              </FieldLabel>
              <textarea
                id="campo_descripcion_tarea_editar"
                className={`${fieldClass} min-h-[8.5rem] resize-y`}
                name="descripcion"
                value={tarea.descripcion}
                onChange={handleChange}
                maxLength={300}
                required
                disabled={loading}
              />
            </div>

            <div>
              <FieldLabel htmlFor="campo_comentarios_tarea_editar" icon={MessageSquare}>
                Comentarios
              </FieldLabel>
              <textarea
                id="campo_comentarios_tarea_editar"
                className={`${fieldClass} min-h-[7rem] resize-y`}
                name="comentarios"
                value={tarea.comentarios}
                onChange={handleChange}
                maxLength={300}
                disabled={loading}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-col-reverse gap-3 border-t border-slate-200 pt-3 sm:flex-row sm:justify-end">
            <button
              id="boton_cancelar_edicion_tarea"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200 boton_cancelar_edicion_tarea"
              type="button"
              onClick={() => navigate('/consultarTareas')}
              disabled={loading}
            >
              <ArrowLeft className="h-4 w-4" />
              Cancelar
            </button>
            <button
              id="boton_guardar_edicion_tarea"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_100%)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-sky-500/25 focus:outline-none focus:ring-4 focus:ring-sky-200 disabled:cursor-not-allowed disabled:opacity-60 boton_guardar_edicion_tarea"
              type="submit"
              disabled={loading}
            >
              <Save className="h-4 w-4" />
              {loading ? 'Guardando...' : 'Actualizar'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default EditarTarea;
