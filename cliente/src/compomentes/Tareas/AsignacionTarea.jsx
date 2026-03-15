import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarRange,
  ClipboardList,
  Package,
  Save,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { apiUrl } from '../../config/api';
import { readCollection } from '../../utils/apiResponse';

const TASK_ASSIGNMENT_API_URL = apiUrl('/api/Task/asignaciones');

const initialState = {
  usuario_IdUsuario: '',
  producto_IdProducto: '',
  tarea_IdTarea: '',
  fechaInicio: '',
  fechaFin: '',
  estado: 1,
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

function AsignacionTarea() {
  const navigate = useNavigate();
  const [asignacion, setAsignacion] = useState(initialState);
  const [usuarios, setUsuarios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCatalogs, setLoadingCatalogs] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        setLoadingCatalogs(true);
        setError('');

        const token = localStorage.getItem('token');
        const [usuariosResponse, productosResponse, tareasResponse] = await Promise.all([
          fetch(apiUrl('/api/User'), { headers: { ...(token && { Authorization: `Bearer ${token}` }) } }),
          fetch(apiUrl('/api/Product'), { headers: { ...(token && { Authorization: `Bearer ${token}` }) } }),
          fetch(apiUrl('/api/Task'), { headers: { ...(token && { Authorization: `Bearer ${token}` }) } }),
        ]);

        const usuariosData = await usuariosResponse.json();
        const productosData = await productosResponse.json();
        const tareasData = await tareasResponse.json();

        setUsuarios(readCollection(usuariosData, ['users', 'usuarios', 'items', 'data']));
        setProductos(readCollection(productosData, ['productos', 'items', 'data']));
        setTareas(readCollection(tareasData, ['tareas', 'items', 'data']));
      } catch (fetchError) {
        setError('No se pudieron cargar los datos de referencia.');
      } finally {
        setLoadingCatalogs(false);
      }
    };

    fetchCatalogs();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setAsignacion((prev) => ({ ...prev, [name]: value }));
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const body = {
        ...asignacion,
        usuario_IdUsuario: asignacion.usuario_IdUsuario,
        producto_IdProducto: Number(asignacion.producto_IdProducto),
        tarea_IdTarea: Number(asignacion.tarea_IdTarea),
        estado: Number(asignacion.estado),
      };

      const response = await fetch(TASK_ASSIGNMENT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('No se pudo asignar la tarea');
      }

      navigate('/consultarTareas');
    } catch (submitError) {
      setError('No se pudo asignar la tarea. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingCatalogs) {
    return (
      <div className="mx-auto w-full max-w-[74rem] px-4 py-4 sm:px-6">
        <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-[0_24px_60px_-35px_rgba(15,23,42,0.35)]">
          <p className="text-base font-medium text-slate-600">Cargando datos para la asignacion...</p>
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
              Coordinacion de produccion
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Asignar Tarea
            </h2>
            <p className="mt-1.5 text-sm leading-6 text-slate-600 sm:text-base">
              Vincula un responsable, un producto y una tarea con fechas claras y un estado controlado.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-3 sm:px-8 sm:py-4">
          {error ? (
            <div className="mb-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {error}
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <FieldLabel htmlFor="selector_usuario_asignacion_tarea" icon={UserRound}>
                Usuario
              </FieldLabel>
              <select
                id="selector_usuario_asignacion_tarea"
                className={fieldClass}
                name="usuario_IdUsuario"
                value={asignacion.usuario_IdUsuario}
                onChange={handleChange}
                required
                disabled={loading}
              >
                <option value="">Seleccione un usuario</option>
                {usuarios.map((usuario) => (
                  <option
                    key={usuario.idUsuario || usuario.usuario_IdUsuario || usuario.id}
                    value={usuario.idUsuario || usuario.usuario_IdUsuario || usuario.id}
                  >
                    {usuario.nombre || usuario.nombreUsuario || usuario.userName || usuario.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <FieldLabel htmlFor="selector_producto_asignacion_tarea" icon={Package}>
                Producto
              </FieldLabel>
              <select
                id="selector_producto_asignacion_tarea"
                className={fieldClass}
                name="producto_IdProducto"
                value={asignacion.producto_IdProducto}
                onChange={handleChange}
                required
                disabled={loading}
              >
                <option value="">Seleccione un producto</option>
                {productos.map((producto) => (
                  <option key={producto.idProducto || producto.IdProducto} value={producto.idProducto || producto.IdProducto}>
                    {producto.nombre || producto.nombreProducto || producto.NombreProducto || `Producto ${producto.idProducto}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <FieldLabel htmlFor="selector_tarea_asignacion_tarea" icon={ClipboardList}>
                Tarea
              </FieldLabel>
              <select
                id="selector_tarea_asignacion_tarea"
                className={fieldClass}
                name="tarea_IdTarea"
                value={asignacion.tarea_IdTarea}
                onChange={handleChange}
                required
                disabled={loading}
              >
                <option value="">Seleccione una tarea</option>
                {tareas.map((tarea) => (
                  <option key={tarea.idTarea || tarea.IdTarea} value={tarea.idTarea || tarea.IdTarea}>
                    {tarea.nombreTarea || tarea.NombreTarea || `Tarea ${tarea.idTarea}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <FieldLabel htmlFor="campo_fecha_inicio_asignacion_tarea" icon={CalendarRange}>
                Fecha de inicio
              </FieldLabel>
              <input
                id="campo_fecha_inicio_asignacion_tarea"
                className={fieldClass}
                type="datetime-local"
                name="fechaInicio"
                value={asignacion.fechaInicio}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div>
              <FieldLabel htmlFor="campo_fecha_fin_asignacion_tarea" icon={CalendarRange}>
                Fecha de fin
              </FieldLabel>
              <input
                id="campo_fecha_fin_asignacion_tarea"
                className={fieldClass}
                type="datetime-local"
                name="fechaFin"
                value={asignacion.fechaFin}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="md:col-span-2">
              <FieldLabel htmlFor="selector_estado_asignacion_tarea" icon={ShieldCheck}>
                Estado
              </FieldLabel>
              <select
                id="selector_estado_asignacion_tarea"
                className={fieldClass}
                name="estado"
                value={asignacion.estado}
                onChange={handleChange}
                required
                disabled={loading}
              >
                <option value={1}>Activo</option>
                <option value={0}>Inactivo</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-col-reverse gap-3 border-t border-slate-200 pt-3 sm:flex-row sm:justify-end">
            <button
              id="boton_cancelar_asignacion_tarea"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200 boton_cancelar_asignacion_tarea"
              type="button"
              onClick={() => navigate('/tareas')}
              disabled={loading}
            >
              <ArrowLeft className="h-4 w-4" />
              Cancelar
            </button>
            <button
              id="boton_guardar_asignacion_tarea"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_100%)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-sky-500/25 focus:outline-none focus:ring-4 focus:ring-sky-200 disabled:cursor-not-allowed disabled:opacity-60 boton_guardar_asignacion_tarea"
              type="submit"
              disabled={loading}
            >
              <Save className="h-4 w-4" />
              {loading ? 'Guardando...' : 'Asignar'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default AsignacionTarea;
