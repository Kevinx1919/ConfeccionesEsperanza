import { apiUrl } from '../../../config/api';

const formatDate = (value) => {
  if (!value) return 'N/A';

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('es-CO');
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const joinRoles = (roles = []) => (Array.isArray(roles) && roles.length > 0 ? roles.join(', ') : 'Sin roles');

export const reportesConfig = {
  stock: {
    id: 'stock',
    nombre: 'Reporte general de stock',
    endpoint: apiUrl('/api/Material'),
    collectionKeys: ['materiales', 'items', 'data'],
    fileName: 'reporte_general_stock',
    sheetName: 'Stock',
    columns: ['ID', 'Nombre', 'Tipo', 'Cantidad', 'Fecha Entrada', 'Proveedor', 'Color'],
    mapItem: (material) => ({
      ID: material.idMaterial ?? material.id ?? 'N/A',
      Nombre: material.nombre ?? 'Sin nombre',
      Tipo:
        material.tipoMaterialDescripcion ??
        material.tipoMaterial?.descripcionMaterial ??
        'Sin tipo',
      Cantidad: material.cantidad ?? 0,
      'Fecha Entrada': formatDate(material.fechaEntrada),
      Proveedor: material.proveedor ?? 'Sin proveedor',
      Color:
        material.colorDescripcion ??
        material.color?.descripcionColor ??
        'No especificado',
    }),
  },
  pedidos: {
    id: 'pedidos',
    nombre: 'Reporte general de pedidos',
    endpoint: apiUrl('/api/Order?PageNumber=1&PageSize=500'),
    collectionKeys: ['pedidos', 'orders', 'items', 'data'],
    fileName: 'reporte_general_pedidos',
    sheetName: 'Pedidos',
    columns: ['ID', 'Cliente', 'Correo', 'Registro', 'Entrega', 'Estado', 'Total', 'Items', 'Vencido'],
    mapItem: (pedido) => ({
      ID: pedido.idPedido ?? pedido.IdPedido ?? 'N/A',
      Cliente: pedido.clienteNombre ?? pedido.ClienteNombre ?? 'Sin cliente',
      Correo: pedido.clienteEmail ?? pedido.ClienteEmail ?? 'Sin correo',
      Registro: formatDate(pedido.fechaRegistro ?? pedido.FechaRegistro),
      Entrega: formatDate(pedido.fechaEntrega ?? pedido.FechaEntrega),
      Estado:
        pedido.estadoDescripcion ??
        pedido.EstadoDescripcion ??
        pedido.estado ??
        pedido.Estado ??
        'Sin estado',
      Total: formatCurrency(pedido.totalPedido ?? pedido.TotalPedido),
      Items: pedido.totalItems ?? pedido.TotalItems ?? 0,
      Vencido: pedido.estaVencido ?? pedido.EstaVencido ? 'Si' : 'No',
    }),
  },
  empleados: {
    id: 'empleados',
    nombre: 'Reporte general de empleados',
    endpoint: apiUrl('/api/User'),
    collectionKeys: ['users', 'items', 'data'],
    fileName: 'reporte_general_empleados',
    sheetName: 'Empleados',
    columns: ['ID', 'Usuario', 'Correo', 'Telefono', 'Roles', 'Email Confirmado', '2FA', 'Estado'],
    mapItem: (empleado) => ({
      ID: empleado.id ?? 'N/A',
      Usuario: empleado.userName ?? 'Sin usuario',
      Correo: empleado.email ?? 'Sin correo',
      Telefono: empleado.phoneNumber ?? 'No registrado',
      Roles: joinRoles(empleado.roles),
      'Email Confirmado': empleado.emailConfirmed ? 'Si' : 'No',
      '2FA': empleado.twoFactorEnabled ? 'Activo' : 'Inactivo',
      Estado: empleado.lockoutEnabled ? 'Bloqueado' : 'Activo',
    }),
  },
  tareas: {
    id: 'tareas',
    nombre: 'Reporte general de tareas',
    endpoint: apiUrl('/api/Task'),
    collectionKeys: ['tareas', 'items', 'data'],
    fileName: 'reporte_general_tareas',
    sheetName: 'Tareas',
    columns: ['ID', 'Nombre', 'Descripcion', 'Creacion', 'Actualizacion', 'Asignaciones Activas', 'Completadas'],
    mapItem: (tarea) => ({
      ID: tarea.idTarea ?? tarea.IdTarea ?? 'N/A',
      Nombre: tarea.nombreTarea ?? tarea.NombreTarea ?? 'Sin nombre',
      Descripcion: tarea.descripcion ?? tarea.Descripcion ?? 'Sin descripcion',
      Creacion: formatDate(tarea.fechaCreacion ?? tarea.FechaCreacion),
      Actualizacion: formatDate(tarea.fechaActualizacion ?? tarea.FechaActualizacion),
      'Asignaciones Activas': tarea.asignacionesActivas ?? tarea.AsignacionesActivas ?? 0,
      Completadas: tarea.asignacionesCompletadas ?? tarea.AsignacionesCompletadas ?? 0,
    }),
  },
  clientes: {
    id: 'clientes',
    nombre: 'Reporte general de clientes',
    endpoint: apiUrl('/api/Customer'),
    collectionKeys: ['clientes', 'items', 'data'],
    fileName: 'reporte_general_clientes',
    sheetName: 'Clientes',
    columns: ['ID', 'Nombre', 'Apellido', 'Correo', 'Telefono', 'Documento', 'Direccion', 'Codigo Postal'],
    mapItem: (cliente) => ({
      ID: cliente.idCliente ?? 'N/A',
      Nombre: cliente.nombreCliente ?? 'Sin nombre',
      Apellido: cliente.apellidoCliente ?? 'Sin apellido',
      Correo: cliente.emailCliente ?? 'Sin correo',
      Telefono: cliente.telefonoCliente ?? 'No registrado',
      Documento: cliente.numeroDocCliente ?? 'No registrado',
      Direccion: cliente.direccionCliente ?? 'No registrada',
      'Codigo Postal': cliente.codigoPostalCliente ?? 'No asignado',
    }),
  },
};

