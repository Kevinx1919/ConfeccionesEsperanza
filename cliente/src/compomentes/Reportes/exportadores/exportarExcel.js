import * as XLSX from 'xlsx';

const buildColumnSizes = (columns, rows) =>
  columns.map((column) => {
    const maxRowLength = rows.reduce((max, row) => {
      const value = row[column];
      return Math.max(max, String(value ?? '').length);
    }, column.length);

    return { wch: Math.min(Math.max(maxRowLength + 2, 14), 34) };
  });

export const exportarExcel = ({ fileName, sheetName, columns, rows, analisis }) => {
  const worksheet = XLSX.utils.json_to_sheet(rows, {
    header: columns,
  });

  worksheet['!cols'] = buildColumnSizes(columns, rows);

  const workbook = XLSX.utils.book_new();
  if (analisis) {
    const resumenSheet = XLSX.utils.json_to_sheet([
      { Seccion: 'Resumen', Valor: analisis.resumen },
      ...analisis.metricas.map((metric) => ({ Seccion: metric.label, Valor: metric.value })),
    ]);
    resumenSheet['!cols'] = [
      { wch: 24 },
      { wch: 48 },
    ];
    XLSX.utils.book_append_sheet(workbook, resumenSheet, 'Resumen');
  }
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};
