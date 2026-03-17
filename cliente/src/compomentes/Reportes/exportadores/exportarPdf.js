import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportarPdf = ({ nombre, fileName, columns, rows, analisis }) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4',
  });

  doc.setFontSize(18);
  doc.text(nombre, 40, 40);

  let startY = 58;

  if (analisis) {
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(analisis.resumen, 40, startY, { maxWidth: 720 });

    autoTable(doc, {
      startY: startY + 16,
      head: [['Indicador', 'Valor']],
      body: analisis.metricas.map((metric) => [metric.label, metric.value]),
      styles: {
        fontSize: 9,
        cellPadding: 5,
      },
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      margin: {
        left: 40,
        right: 40,
      },
      tableWidth: 350,
      theme: 'grid',
    });

    startY = doc.lastAutoTable.finalY + 18;
  }

  autoTable(doc, {
    startY,
    head: [columns],
    body: rows.map((row) => columns.map((column) => row[column] ?? '')),
    styles: {
      fontSize: 9,
      cellPadding: 6,
      textColor: [30, 41, 59],
    },
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: {
      left: 28,
      right: 28,
    },
    theme: 'grid',
  });

  doc.save(`${fileName}.pdf`);
};
