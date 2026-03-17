import { analizarReporte } from '../analisis/analizarReporte';
import { exportarExcel } from './exportarExcel';
import { exportarPdf } from './exportarPdf';
import { obtenerDatosReporte } from './obtenerDatosReporte';

export const generarReporte = async (moduloId, formato) => {
  const reporte = await obtenerDatosReporte(moduloId);
  const analisis = analizarReporte(moduloId, reporte.items);

  if (reporte.rows.length === 0) {
    throw new Error('No hay datos disponibles para exportar en este modulo.');
  }

  if (formato === 'excel') {
    exportarExcel({ ...reporte, analisis });
    return { ...reporte, analisis };
  }

  if (formato === 'pdf') {
    exportarPdf({ ...reporte, analisis });
    return { ...reporte, analisis };
  }

  throw new Error('El formato seleccionado no es valido.');
};
