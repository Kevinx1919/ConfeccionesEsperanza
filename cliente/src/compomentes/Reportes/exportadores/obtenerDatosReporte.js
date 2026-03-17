import { readCollection } from '../../../utils/apiResponse';
import { reportesConfig } from './reportesConfig';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const obtenerDatosReporte = async (moduloId) => {
  const config = reportesConfig[moduloId];

  if (!config) {
    throw new Error('El modulo seleccionado no tiene configuracion de reporte.');
  }

  const response = await fetch(config.endpoint, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    let message = 'No se pudo generar el reporte.';

    try {
      const errorPayload = await response.json();
      message = errorPayload.message || errorPayload.Message || message;
    } catch {
      // Keep the default message when the API does not return JSON.
    }

    throw new Error(message);
  }

  const payload = await response.json();
  const collection = readCollection(payload, config.collectionKeys);
  const rows = collection.map(config.mapItem);

  return {
    ...config,
    items: collection,
    rows,
  };
};
