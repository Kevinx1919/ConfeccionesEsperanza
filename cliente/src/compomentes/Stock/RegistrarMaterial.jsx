import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  Layers3,
  Minus,
  Package,
  Palette,
  Plus,
  Save,
  Truck,
} from 'lucide-react';
import { apiUrl } from '../../config/api';
import { readCollection } from '../../utils/apiResponse';

const API_URL_MATERIAL = apiUrl('/api/Material');
const API_URL_TIPOS_MATERIAL = apiUrl('/api/Material/tipos');

const initialMaterialState = {
  nombre: '',
  tipoMaterial_IdTipoMaterial: 0,
  cantidad: 0,
  fechaEntrada: '',
  proveedor: '',
  color_IdColor: 0,
};

const getSubmitButtonText = (materialId) => (materialId ? 'Actualizar' : 'Registrar');

const normalizarTiposMaterial = (tipos) =>
  tipos.map((tipo) => ({
    idTipoMaterial: tipo.idTipoMaterial ?? tipo.IdTipoMaterial ?? 0,
    descripcionMaterial: tipo.descripcionMaterial ?? tipo.DescripcionMaterial ?? '',
  }));

const extraerColoresDesdeMateriales = (materiales) => {
  const coloresUnicos = new Map();

  materiales.forEach((materialItem) => {
    const idColor = materialItem.color_IdColor ?? materialItem.Color_IdColor;
    const descripcionColor = materialItem.colorDescripcion ?? materialItem.ColorDescripcion;

    if (
      typeof idColor === 'number' &&
      idColor >= 0 &&
      typeof descripcionColor === 'string' &&
      descripcionColor.trim() !== ''
    ) {
      coloresUnicos.set(idColor, {
        idColor,
        descripcionColor: descripcionColor.trim(),
      });
    }
  });

  return Array.from(coloresUnicos.values()).sort((colorA, colorB) =>
    colorA.descripcionColor.localeCompare(colorB.descripcionColor),
  );
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

function RegistrarMaterial() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [material, setMaterial] = useState({ ...initialMaterialState });
  const [tiposMaterial, setTiposMaterial] = useState([]);
  const [colores, setColores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [titulo, setTitulo] = useState('Registrar Material');

  useEffect(() => {
    const token = localStorage.getItem('token');

    const cargarDatos = async () => {
      try {
        setLoading(true);

        const [tiposResponse, materialesResponse] = await Promise.all([
          fetch(API_URL_TIPOS_MATERIAL, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(API_URL_MATERIAL, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        if (!tiposResponse.ok) {
          throw new Error('No se pudo cargar el catalogo de tipos de material');
        }

        const tiposData = await tiposResponse.json();
        const tiposNormalizados = normalizarTiposMaterial(readCollection(tiposData, ['tipos', 'data']));

        setTiposMaterial(tiposNormalizados);

        if (materialesResponse.ok) {
          const materialesData = await materialesResponse.json();
          const materiales = readCollection(materialesData, ['materiales', 'items', 'data']);
          setColores(extraerColoresDesdeMateriales(materiales));
        }

        if (id) {
          setTitulo('Editar Material');
          const materialResponse = await fetch(`${API_URL_MATERIAL}/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!materialResponse.ok) {
            throw new Error('No se pudo cargar el material');
          }

          const materialData = await materialResponse.json();
          const colorActualId = materialData.color_IdColor ?? materialData.Color_IdColor ?? 0;
          const colorActualDescripcion =
            materialData.colorDescripcion ?? materialData.ColorDescripcion ?? '';

          if (colorActualId >= 0 && colorActualDescripcion) {
            setColores((prevColores) => {
              if (prevColores.some((color) => color.idColor === colorActualId)) {
                return prevColores;
              }

              return [
                ...prevColores,
                {
                  idColor: colorActualId,
                  descripcionColor: colorActualDescripcion,
                },
              ].sort((colorA, colorB) => colorA.descripcionColor.localeCompare(colorB.descripcionColor));
            });
          }

          setMaterial({
            ...materialData,
            fechaEntrada: materialData.fechaEntrada ? materialData.fechaEntrada.split('T')[0] : '',
          });
        }
      } catch (fetchError) {
        setError(
          id
            ? 'No se pudieron cargar todos los datos del material. Revise la conexion e intente nuevamente.'
            : 'No se pudieron cargar los catalogos del formulario desde la API.',
        );
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    const shouldParseToNumber =
      name === 'cantidad' || name === 'tipoMaterial_IdTipoMaterial' || name === 'color_IdColor';

    setMaterial((prevMaterial) => ({
      ...prevMaterial,
      [name]: shouldParseToNumber ? Number.parseInt(value, 10) || 0 : value,
    }));

    if (error) {
      setError('');
    }
  };

  const incrementarCantidad = () => {
    setMaterial((prevMaterial) => ({
      ...prevMaterial,
      cantidad: prevMaterial.cantidad + 1,
    }));
  };

  const decrementarCantidad = () => {
    setMaterial((prevMaterial) => ({
      ...prevMaterial,
      cantidad: prevMaterial.cantidad > 0 ? prevMaterial.cantidad - 1 : 0,
    }));
  };

  const validateForm = () => {
    if (
      !material.nombre ||
      !material.tipoMaterial_IdTipoMaterial ||
      material.cantidad === 0 ||
      !material.fechaEntrada ||
      !material.proveedor
    ) {
      setError('Todos los campos excepto color son obligatorios.');
      return false;
    }

    if (material.cantidad < 0) {
      setError('La cantidad no puede ser negativa.');
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
      const token = localStorage.getItem('token');
      const materialToSend = {
        nombre: material.nombre,
        cantidad: material.cantidad,
        fechaEntrada: material.fechaEntrada
          ? `${material.fechaEntrada}T00:00:00.000Z`
          : new Date().toISOString(),
        proveedor: material.proveedor,
        tipoMaterial_IdTipoMaterial: material.tipoMaterial_IdTipoMaterial,
        color_IdColor: material.color_IdColor,
      };

      const requestUrl = id ? `${API_URL_MATERIAL}/${id}` : API_URL_MATERIAL;
      const requestMethod = id ? 'PUT' : 'POST';

      const response = await fetch(requestUrl, {
        method: requestMethod,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(materialToSend),
      });

      if (!response.ok) {
        throw new Error('No se pudo guardar el material');
      }

      navigate('/listarMaterial');
    } catch (submitError) {
      setError('Ocurrio un error al guardar el material. Por favor, intentelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && id) {
    return (
      <div className="mx-auto w-full max-w-[74rem] px-4 py-4 sm:px-6">
        <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-[0_24px_60px_-35px_rgba(15,23,42,0.35)]">
          <p className="text-base font-medium text-slate-600">Cargando datos del material...</p>
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
              Inventario
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {titulo}
            </h2>
            <p className="mt-1.5 text-sm leading-6 text-slate-600 sm:text-base">
              Completa la informacion del material.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-3 sm:px-8 sm:py-4">
          {error ? (
            <div className="mb-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {error}
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
            <div className="md:col-span-2">
              <FieldLabel htmlFor="campo_nombre_material_stock" icon={Package}>
                Nombre del Material
              </FieldLabel>
              <input
                id="campo_nombre_material_stock"
                className={`${formFieldClass} bg-sky-50 font-semibold ring-1 ring-sky-100 focus:bg-white`}
                type="text"
                name="nombre"
                value={material.nombre}
                onChange={handleChange}
                placeholder="Ej: Tela de algodon crudo 150 cm ancho"
                required
                disabled={loading}
              />
            </div>

            <div>
              <FieldLabel htmlFor="campo_tipo_material_stock" icon={Layers3}>
                Tipo de Material
              </FieldLabel>
              <select
                id="campo_tipo_material_stock"
                className={formFieldClass}
                name="tipoMaterial_IdTipoMaterial"
                value={material.tipoMaterial_IdTipoMaterial}
                onChange={handleChange}
                required
                disabled={loading}
              >
                <option value="0">Seleccione un tipo de material</option>
                {tiposMaterial.map((tipo) => (
                  <option key={tipo.idTipoMaterial} value={tipo.idTipoMaterial}>
                    {tipo.descripcionMaterial}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <FieldLabel htmlFor="campo_cantidad_material_stock" icon={Package}>
                Cantidad
              </FieldLabel>
              <div className="flex items-center gap-3">
                <button
                  id="boton_disminuir_cantidad_material_stock"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-200 bg-white text-sky-700 transition hover:bg-sky-50 focus:outline-none focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:opacity-60 boton_disminuir_cantidad_material_stock"
                  type="button"
                  onClick={decrementarCantidad}
                  disabled={loading}
                  aria-label="Disminuir cantidad de material"
                >
                  <Minus className="h-5 w-5" />
                </button>
                <input
                  id="campo_cantidad_material_stock"
                  className={`${formFieldClass} w-24 text-center font-semibold`}
                  type="number"
                  name="cantidad"
                  value={material.cantidad}
                  onChange={handleChange}
                  min="0"
                  required
                  disabled={loading}
                />
                <button
                  id="boton_aumentar_cantidad_material_stock"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-200 bg-white text-sky-700 transition hover:bg-sky-50 focus:outline-none focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:opacity-60 boton_aumentar_cantidad_material_stock"
                  type="button"
                  onClick={incrementarCantidad}
                  disabled={loading}
                  aria-label="Aumentar cantidad de material"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div>
              <FieldLabel htmlFor="campo_fecha_entrada_material_stock" icon={CalendarDays}>
                Fecha de Entrada
              </FieldLabel>
              <input
                id="campo_fecha_entrada_material_stock"
                className={formFieldClass}
                type="date"
                name="fechaEntrada"
                value={material.fechaEntrada}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div>
              <FieldLabel htmlFor="campo_proveedor_material_stock" icon={Truck}>
                Proveedor
              </FieldLabel>
              <input
                id="campo_proveedor_material_stock"
                className={formFieldClass}
                type="text"
                name="proveedor"
                value={material.proveedor}
                onChange={handleChange}
                placeholder="Ej: Textiles del Valle S.A."
                required
                disabled={loading}
              />
            </div>

            <div className="md:col-span-2">
              <FieldLabel htmlFor="campo_color_material_stock" icon={Palette}>
                Color
              </FieldLabel>
              <select
                id="campo_color_material_stock"
                className={formFieldClass}
                name="color_IdColor"
                value={material.color_IdColor}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="0">
                  {colores.length > 0 ? 'Seleccione un color' : 'No hay colores disponibles'}
                </option>
                {colores.map((color) => (
                  <option key={color.idColor} value={color.idColor}>
                    {color.descripcionColor}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-col-reverse gap-3 border-t border-slate-200 pt-3 sm:flex-row sm:justify-end">
            <button
              id="boton_cancelar_formulario_material_stock"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60 boton_cancelar_formulario_material_stock"
              type="button"
              onClick={() => navigate('/listarMaterial')}
              disabled={loading}
            >
              <ArrowLeft className="h-4 w-4" />
              Cancelar
            </button>
            <button
              id={id ? 'boton_actualizar_material_stock' : 'boton_registrar_material_stock'}
              className={`inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_100%)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-sky-500/25 focus:outline-none focus:ring-4 focus:ring-sky-200 disabled:cursor-not-allowed disabled:opacity-60 ${
                id ? 'boton_actualizar_material_stock' : 'boton_registrar_material_stock'
              }`}
              type="submit"
              disabled={loading}
            >
              <Save className="h-4 w-4" />
              {loading ? 'Guardando...' : getSubmitButtonText(id)}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default RegistrarMaterial;
