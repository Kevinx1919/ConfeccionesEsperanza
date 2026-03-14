import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, ShieldAlert, Trash2 } from 'lucide-react';
import { apiUrl } from '../../config/api';

const API_URL_MATERIAL = apiUrl('/api/Material');

const actionButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60';

function EliminarMaterial() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [eliminando, setEliminando] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');

    const fetchMaterial = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL_MATERIAL}/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('No se pudo cargar el material');
        }

        const materialData = await response.json();
        setMaterial(materialData);
      } catch (fetchError) {
        setError(fetchError.message || 'No se pudo cargar el material');
      } finally {
        setLoading(false);
      }
    };

    fetchMaterial();
  }, [id]);

  const handleEliminar = async () => {
    const confirmar = window.confirm('Esta seguro de que desea eliminar este material?');

    if (!confirmar) {
      return;
    }

    try {
      setEliminando(true);
      setError('');
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL_MATERIAL}/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('No se pudo eliminar el material');
      }

      navigate('/listarMaterial');
    } catch (deleteError) {
      setError(deleteError.message || 'Ocurrio un error al eliminar el material.');
    } finally {
      setEliminando(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
        <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-[0_24px_60px_-35px_rgba(15,23,42,0.35)]">
          <p className="text-base font-medium text-slate-600">Cargando material...</p>
        </div>
      </div>
    );
  }

  if (error && !material) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
        <div className="rounded-[28px] border border-rose-200 bg-white p-8 text-center shadow-[0_24px_60px_-35px_rgba(15,23,42,0.35)]">
          <h2 className="text-2xl font-bold text-slate-900">Error</h2>
          <p className="mt-3 text-sm text-rose-700">{error}</p>
          <button
            id="boton_volver_error_eliminacion_stock"
            className={`${actionButtonClass} mt-6 bg-slate-900 text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 focus:ring-slate-300 boton_volver_error_eliminacion_stock`}
            onClick={() => navigate('/listarMaterial')}
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_24px_80px_-32px_rgba(15,23,42,0.35)]">
        <div className="border-b border-rose-200 bg-[linear-gradient(135deg,#fff1f2_0%,#fff7ed_55%,#ffffff_100%)] px-5 py-8 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center rounded-full border border-rose-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-rose-700">
              Accion delicada
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Eliminar Material
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
              Revisa la informacion antes de eliminar. Esta accion afecta de forma permanente el inventario.
            </p>
          </div>
        </div>

        <div className="px-5 py-6 sm:px-8 sm:py-8">
          {error ? (
            <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {error}
            </div>
          ) : null}

          {material ? (
            <div className="rounded-[28px] border border-amber-200 bg-amber-50/70 p-6 shadow-inner">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900">
                    Esta seguro de que desea eliminar el siguiente material?
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Verifica cada dato antes de continuar para evitar perdidas de informacion.
                  </p>
                </div>
              </div>

              <dl className="mt-6 grid grid-cols-1 gap-4 rounded-[24px] bg-white p-5 shadow-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Nombre
                  </dt>
                  <dd className="mt-2 text-sm font-medium text-slate-900">{material.nombre}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Cantidad
                  </dt>
                  <dd className="mt-2 text-sm font-medium text-slate-900">{material.cantidad}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Proveedor
                  </dt>
                  <dd className="mt-2 text-sm font-medium text-slate-900">{material.proveedor}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Fecha de entrada
                  </dt>
                  <dd className="mt-2 text-sm font-medium text-slate-900">
                    {material.fechaEntrada ? new Date(material.fechaEntrada).toLocaleDateString() : 'N/A'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Tipo de material
                  </dt>
                  <dd className="mt-2 text-sm font-medium text-slate-900">
                    {material.tipoMaterialDescripcion || material.tipoMaterial_IdTipoMaterial}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Color
                  </dt>
                  <dd className="mt-2 text-sm font-medium text-slate-900">
                    {material.colorDescripcion || 'No especificado'}
                  </dd>
                </div>
              </dl>

              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                <p className="font-semibold">Esta accion no se puede deshacer.</p>
              </div>
            </div>
          ) : null}

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
            <button
              id="boton_cancelar_eliminacion_material_stock"
              className={`${actionButtonClass} border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50 focus:ring-slate-200 boton_cancelar_eliminacion_material_stock`}
              onClick={() => navigate('/listarMaterial')}
              disabled={eliminando}
            >
              <ArrowLeft className="h-4 w-4" />
              Cancelar
            </button>
            <button
              id="boton_confirmar_eliminacion_material_stock"
              className={`${actionButtonClass} bg-[linear-gradient(135deg,#ef4444_0%,#dc2626_100%)] text-white shadow-lg shadow-rose-500/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-rose-500/25 focus:ring-rose-200 boton_confirmar_eliminacion_material_stock`}
              onClick={handleEliminar}
              disabled={eliminando}
            >
              <Trash2 className="h-4 w-4" />
              {eliminando ? 'Eliminando...' : 'Eliminar Material'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default EliminarMaterial;
