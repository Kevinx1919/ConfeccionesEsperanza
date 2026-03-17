const palette = ['#2563eb', '#7c3aed', '#f97316', '#10b981', '#ec4899', '#0ea5e9'];

const buildDonutChart = (title, entries) => ({
  type: 'doughnut',
  title,
  data: {
    labels: entries.map(([label]) => label),
    datasets: [
      {
        data: entries.map(([, value]) => value),
        backgroundColor: palette,
        borderWidth: 0,
      },
    ],
  },
});

const buildBarChart = (title, entries) => ({
  type: 'bar',
  title,
  data: {
    labels: entries.map(([label]) => label),
    datasets: [
      {
        label: title,
        data: entries.map(([, value]) => value),
        borderRadius: 10,
        backgroundColor: '#4f46e5',
      },
    ],
  },
});

const countBy = (items, getter) => {
  const counts = new Map();

  items.forEach((item) => {
    const key = getter(item) || 'Sin dato';
    counts.set(key, (counts.get(key) || 0) + 1);
  });

  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
};

const sumBy = (items, getter) =>
  items.reduce((total, item) => total + (Number(getter(item)) || 0), 0);

const averageBy = (items, getter) => {
  if (items.length === 0) return 0;
  return sumBy(items, getter) / items.length;
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatDecimal = (value) =>
  new Intl.NumberFormat('es-CO', {
    maximumFractionDigits: 1,
  }).format(Number(value) || 0);

const topLabel = (entries, fallback = 'Sin datos') => entries[0]?.[0] || fallback;

const safeSlice = (entries, count = 5) => (entries.length > 0 ? entries.slice(0, count) : [['Sin datos', 1]]);

const analyzeStock = (items) => {
  const totalCantidad = sumBy(items, (item) => item.cantidad);
  const tipos = countBy(
    items,
    (item) => item.tipoMaterialDescripcion || item.tipoMaterial?.descripcionMaterial,
  );
  const proveedores = countBy(items, (item) => item.proveedor);

  return {
    resumen: `El inventario registra ${items.length} materiales. El tipo mas frecuente es ${topLabel(tipos).toLowerCase()} y el proveedor con mayor presencia es ${topLabel(proveedores)}.`,
    metricas: [
      { label: 'Materiales', value: `${items.length}` },
      { label: 'Cantidad total', value: `${totalCantidad}` },
      { label: 'Tipo dominante', value: topLabel(tipos) },
      { label: 'Proveedor clave', value: topLabel(proveedores) },
    ],
    primaryChart: buildDonutChart('Distribucion por tipo', safeSlice(tipos)),
    secondaryChart: buildBarChart('Registros por proveedor', safeSlice(proveedores)),
  };
};

const analyzePedidos = (items) => {
  const estados = countBy(items, (item) => item.estadoDescripcion || item.EstadoDescripcion || `Estado ${item.estado ?? item.Estado ?? 'N/A'}`);
  const totalVenta = sumBy(items, (item) => item.totalPedido ?? item.TotalPedido);
  const promedio = averageBy(items, (item) => item.totalPedido ?? item.TotalPedido);
  const vencidos = items.filter((item) => item.estaVencido ?? item.EstaVencido).length;

  return {
    resumen: `Se encontraron ${items.length} pedidos. El estado dominante es ${topLabel(estados).toLowerCase()} y ${vencidos} pedidos requieren seguimiento por vencimiento.`,
    metricas: [
      { label: 'Pedidos', value: `${items.length}` },
      { label: 'Vencidos', value: `${vencidos}` },
      { label: 'Ticket promedio', value: formatCurrency(promedio) },
      { label: 'Venta acumulada', value: formatCurrency(totalVenta) },
    ],
    primaryChart: buildDonutChart('Pedidos por estado', safeSlice(estados)),
    secondaryChart: buildBarChart(
      'Totales por pedido',
      safeSlice(
        items
          .map((item) => [
            `Pedido #${item.idPedido ?? item.IdPedido}`,
            Number(item.totalPedido ?? item.TotalPedido ?? 0),
          ])
          .sort((a, b) => b[1] - a[1]),
        5,
      ),
    ),
  };
};

const analyzeEmpleados = (items) => {
  const totalActivos = items.filter((item) => !item.lockoutEnabled).length;
  const totalBloqueados = items.filter((item) => item.lockoutEnabled).length;
  const total2fa = items.filter((item) => item.twoFactorEnabled).length;
  const roles = countBy(items.flatMap((item) => (item.roles || []).map((role) => ({ role }))), (item) => item.role);

  return {
    resumen: `Hay ${items.length} empleados registrados. ${totalActivos} cuentas estan activas y el rol mas comun es ${topLabel(roles).toLowerCase()}.`,
    metricas: [
      { label: 'Empleados', value: `${items.length}` },
      { label: 'Activos', value: `${totalActivos}` },
      { label: 'Bloqueados', value: `${totalBloqueados}` },
      { label: 'Con 2FA', value: `${total2fa}` },
    ],
    primaryChart: buildDonutChart('Distribucion por rol', safeSlice(roles)),
    secondaryChart: buildBarChart('Estado de cuentas', [
      ['Activos', totalActivos],
      ['Bloqueados', totalBloqueados],
      ['Con 2FA', total2fa],
    ]),
  };
};

const analyzeTareas = (items) => {
  const activas = sumBy(items, (item) => item.asignacionesActivas ?? item.AsignacionesActivas);
  const completadas = sumBy(items, (item) => item.asignacionesCompletadas ?? item.AsignacionesCompletadas);
  const topTareas = items
    .map((item) => [
      item.nombreTarea ?? item.NombreTarea ?? 'Sin nombre',
      Number(item.asignacionesActivas ?? item.AsignacionesActivas ?? 0),
    ])
    .sort((a, b) => b[1] - a[1]);

  return {
    resumen: `El modulo concentra ${items.length} tareas. Actualmente hay ${activas} asignaciones activas y ${completadas} ya fueron completadas.`,
    metricas: [
      { label: 'Tareas', value: `${items.length}` },
      { label: 'Activas', value: `${activas}` },
      { label: 'Completadas', value: `${completadas}` },
      { label: 'Promedio activas', value: formatDecimal(items.length ? activas / items.length : 0) },
    ],
    primaryChart: buildBarChart('Asignaciones activas por tarea', safeSlice(topTareas)),
    secondaryChart: buildBarChart('Carga general', [
      ['Activas', activas],
      ['Completadas', completadas],
    ]),
  };
};

const analyzeClientes = (items) => {
  const conTelefono = items.filter((item) => item.telefonoCliente).length;
  const conDireccion = items.filter((item) => item.direccionCliente).length;
  const pedidos = sumBy(items, (item) => item.totalPedidos);
  const topClientes = items
    .map((item) => [
      `${item.nombreCliente ?? 'Sin nombre'} ${item.apellidoCliente ?? ''}`.trim(),
      Number(item.totalPedidos ?? 0),
    ])
    .sort((a, b) => b[1] - a[1]);

  return {
    resumen: `Se registran ${items.length} clientes. ${conTelefono} tienen telefono disponible y el total visible de pedidos asociados es ${pedidos}.`,
    metricas: [
      { label: 'Clientes', value: `${items.length}` },
      { label: 'Con telefono', value: `${conTelefono}` },
      { label: 'Con direccion', value: `${conDireccion}` },
      { label: 'Pedidos visibles', value: `${pedidos}` },
    ],
    primaryChart: buildBarChart('Clientes con mas pedidos', safeSlice(topClientes)),
    secondaryChart: buildDonutChart('Calidad de contacto', [
      ['Con telefono', conTelefono],
      ['Sin telefono', Math.max(items.length - conTelefono, 0)],
      ['Con direccion', conDireccion],
    ]),
  };
};

const analyzers = {
  stock: analyzeStock,
  pedidos: analyzePedidos,
  empleados: analyzeEmpleados,
  tareas: analyzeTareas,
  clientes: analyzeClientes,
};

export const analizarReporte = (moduloId, items = []) => {
  const analyzer = analyzers[moduloId];

  if (!analyzer) {
    return {
      resumen: 'No hay analisis disponible para este modulo.',
      metricas: [],
      primaryChart: null,
      secondaryChart: null,
    };
  }

  return analyzer(items);
};
