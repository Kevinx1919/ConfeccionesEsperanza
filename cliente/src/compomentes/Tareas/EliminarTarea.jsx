import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, ClipboardCheck, Trash2 } from 'lucide-react';
import { apiUrl } from '../../config/api';

const TASK_API_URL = apiUrl('/api/Task');

function EliminarTarea() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [tarea, setTarea] = useState(null);
  const [loading, setLoading] = useState(true);
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
          idTarea: data.idTarea ?? data.IdTarea ?? id,
          nombreTarea: data.nombreTarea ?? data.NombreTarea ?? 'Sin nombre',
          descripcion: data.descripcion ?? data.Descripcion ?? 'Sin descripcion',
        });
      } catch (fetchError) {
        setError('No se pudo cargar la tarea.');
      } finally {
        setLoading(false);
      }
    };

    fetchTarea();
  }, [id]);

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');

      const response = await fetch(`${TASK_API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error('No se pudo eliminar la tarea');
      }

      navigate('/consultarTareas');
    } catch (deleteError) {
      setError('No se pudo eliminar la tarea. Intenta nuevamente.');
      setLoading(false);
    }
  };

  if (loading && !tarea && !error) {
    return (
      <div className="mx-auto w-full max-w-[74rem] px-4 py-4 sm:px-6">
        <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-[0_24px_60px_-35px_rgba(15,23,42,0.35)]">
          <p className="text-base font-medium text-slate-600">Cargando tarea...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[72rem] px-4 py-4 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[30px] border border-rose-200 bg-white shadow-[0_24px_80px_-32px_rgba(15,23,42,0.35)]">
        <div className="border-b border-rose-200 bg-[linear-gradient(135deg,#fff1f2_0%,#fff7ed_60%,#ffffff_100%)] px-5 py-5 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center rounded-full border border-rose-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-rose-700">
              Accion sensible
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Eliminar Tarea
            </h2>
            <p className="mt-1.5 text-sm leading-6 text-slate-600 sm:text-base">
              Confirma esta accion solo si estas seguro. La tarea dejara de estar disponible para futuras asignaciones.
            </p>
          </div>
        </div>

        <div className="px-5 py-5 sm:px-8">
          {error ? (
            <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {error}
            </div>
          ) : null}

          {tarea ? (
            <div className="space-y-4">
              <div className="rounded-[24px] border border-rose-100 bg-rose-50/70 p-5">
                <div className="flex items-start gap-3">
                  <span className="rounded-2xl bg-rose-100 p-2 text-rose-700">
                    <AlertTriangle className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">¿Deseas continuar con la eliminacion?</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Esta accion afecta el flujo operativo del modulo de tareas.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <span className="rounded-lg bg-sky-100 p-1 text-sky-700">
                    <ClipboardCheck className="h-4 w-4" />
                  </span>
                  Resumen de la tarea
                </div>

                <dl className="mt-4 grid grid-cols-1 gap-4 text-sm text-slate-600 sm:grid-cols-2">
                  <div>
                    <dt className="font-semibold text-slate-900">ID</dt>
                    <dd className="mt-1">#{tarea.idTarea}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-900">Nombre</dt>
                    <dd className="mt-1">{tarea.nombreTarea}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="font-semibold text-slate-900">Descripcion</dt>
                    <dd className="mt-1 leading-6">{tarea.descripcion}</dd>
                  </div>
                </dl>
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  id="boton_cancelar_eliminacion_tarea"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200 boton_cancelar_eliminacion_tarea"
                  type="button"
                  onClick={() => navigate('/consultarTareas')}
                  disabled={loading}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Cancelar
                </button>
                <button
                  id="boton_confirmar_eliminacion_tarea"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#ef4444_0%,#dc2626_100%)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-500/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-rose-500/25 focus:outline-none focus:ring-4 focus:ring-rose-200 disabled:cursor-not-allowed disabled:opacity-60 boton_confirmar_eliminacion_tarea"
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  <Trash2 className="h-4 w-4" />
                  {loading ? 'Eliminando...' : 'Eliminar tarea'}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

export default EliminarTarea;
