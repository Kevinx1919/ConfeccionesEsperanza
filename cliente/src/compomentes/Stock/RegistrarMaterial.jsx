import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiUrl } from '../../config/api';
import { readCollection } from '../../utils/apiResponse';
import './Stock.css';

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
      <div className="stock-cargando-panel">
        <p>Cargando datos del material...</p>
      </div>
    );
  }

  return (
    <div className="stock-formulario-contenedor">
      <form onSubmit={handleSubmit} className="stock-formulario">
        <h2 className="stock-formulario-titulo">{titulo}</h2>

        {error ? <div className="stock-formulario-mensaje-error">{error}</div> : null}

        <div className="stock-formulario-grupo-campos">
          <div className="stock-formulario-campo stock-formulario-campo--ancho-completo">
            <label className="stock-formulario-etiqueta" htmlFor="campo_nombre_material_stock">
              Nombre del Material
            </label>
            <input
              id="campo_nombre_material_stock"
              className="stock-formulario-control stock-formulario-control--destacado"
              type="text"
              name="nombre"
              value={material.nombre}
              onChange={handleChange}
              placeholder="Ej: Tela de algodon crudo 150 cm ancho"
              required
              disabled={loading}
            />
          </div>

          <div className="stock-formulario-campo">
            <label className="stock-formulario-etiqueta" htmlFor="campo_tipo_material_stock">
              Tipo de Material
            </label>
            <select
              id="campo_tipo_material_stock"
              className="stock-formulario-select"
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

          <div className="stock-formulario-campo">
            <label className="stock-formulario-etiqueta" htmlFor="campo_cantidad_material_stock">
              Cantidad
            </label>
            <div className="stock-formulario-contador">
              <button
                id="boton_disminuir_cantidad_material_stock"
                className="stock-formulario-boton-contador boton_disminuir_cantidad_material_stock"
                type="button"
                onClick={decrementarCantidad}
                disabled={loading}
                aria-label="Disminuir cantidad de material"
              >
                -
              </button>
              <input
                id="campo_cantidad_material_stock"
                className="stock-formulario-control stock-formulario-control--cantidad"
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
                className="stock-formulario-boton-contador boton_aumentar_cantidad_material_stock"
                type="button"
                onClick={incrementarCantidad}
                disabled={loading}
                aria-label="Aumentar cantidad de material"
              >
                +
              </button>
            </div>
          </div>

          <div className="stock-formulario-campo">
            <label className="stock-formulario-etiqueta" htmlFor="campo_fecha_entrada_material_stock">
              Fecha de Entrada
            </label>
            <input
              id="campo_fecha_entrada_material_stock"
              className="stock-formulario-control"
              type="date"
              name="fechaEntrada"
              value={material.fechaEntrada}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="stock-formulario-campo">
            <label className="stock-formulario-etiqueta" htmlFor="campo_proveedor_material_stock">
              Proveedor
            </label>
            <input
              id="campo_proveedor_material_stock"
              className="stock-formulario-control"
              type="text"
              name="proveedor"
              value={material.proveedor}
              onChange={handleChange}
              placeholder="Ej: Textiles del Valle S.A."
              required
              disabled={loading}
            />
          </div>

          <div className="stock-formulario-campo">
            <label className="stock-formulario-etiqueta" htmlFor="campo_color_material_stock">
              Color
            </label>
            <select
              id="campo_color_material_stock"
              className="stock-formulario-select"
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

        <div className="stock-formulario-acciones">
          <button
            id={id ? 'boton_actualizar_material_stock' : 'boton_registrar_material_stock'}
            className={`stock-form-boton-principal ${
              id ? 'boton_actualizar_material_stock' : 'boton_registrar_material_stock'
            }`}
            type="submit"
            disabled={loading}
          >
            {loading ? 'Guardando...' : getSubmitButtonText(id)}
          </button>
          <button
            id="boton_cancelar_formulario_material_stock"
            className="stock-form-boton-secundario boton_cancelar_formulario_material_stock"
            type="button"
            onClick={() => navigate('/listarMaterial')}
            disabled={loading}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default RegistrarMaterial;
