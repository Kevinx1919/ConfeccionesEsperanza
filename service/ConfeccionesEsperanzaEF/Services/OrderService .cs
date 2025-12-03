using ConfeccionesEsperanzaEF.Data;
using ConfeccionesEsperanzaEF.Models.Common;
using ConfeccionesEsperanzaEF.Models.DTOs.Order;
using ConfeccionesEsperanzaEF.Models.Order;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel;

namespace ConfeccionesEsperanzaEF.Services
{
    public interface IOrderService
    {
        Task<PedidoResponseDto> CreatePedidoAsync(CreatePedidoDto createPedidoDto);
        Task<PedidoResponseDto> UpdatePedidoAsync(int id, UpdatePedidoDto updatePedidoDto);
        Task<PedidoResponseDto> DeletePedidoAsync(int id);
        Task<PedidoInfoDto?> GetPedidoByIdAsync(int id);
        Task<PedidoListDto> GetPedidosAsync(PedidoFilterDto? filter = null);
        Task<PedidoListDto> GetPedidosByClienteAsync(int clienteId/*, int pageNumber = 1, int pageSize = 10*/);
        Task<PedidoResponseDto> UpdateEstadoPedidoAsync(int id, EstadoPedido nuevoEstado);
        Task<List<PedidoInfoDto>> GetPedidosVencidosAsync();
        Task<decimal> GetTotalVentasByPeriodoAsync(DateTime fechaInicio, DateTime fechaFin);
        Task<Dictionary<EstadoPedido, int>> GetEstadisticasEstadosAsync();
        Task<PedidoInfoDto?> GetProximoPedidoAsync();
        Task<PedidoProgresoDto?> GetProgresoPedidoAsync(int pedidoId, ApplicationDbContext context);
        Task<Dictionary<string, int>> GetPedidosPorSemestreAsync(int year);
        Task<List<PedidoConProgresoDto>> GetPedidosPendientesConProgresoAsync();
    }

    public class OrderService : IOrderService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<OrderService> _logger;

        public OrderService(ApplicationDbContext context, ILogger<OrderService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<PedidoResponseDto> CreatePedidoAsync(CreatePedidoDto createPedidoDto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Validar que el cliente existe
                var cliente = await _context.Clientes.FindAsync(createPedidoDto.Cliente_IdCliente);
                if (cliente == null)
                {
                    return new PedidoResponseDto
                    {
                        IsSuccess = false,
                        Message = "El cliente especificado no existe"
                    };
                }

                // Validar productos en los detalles
                foreach (var detalle in createPedidoDto.DetallesPedido)
                {
                    var producto = await _context.Productos.FindAsync(detalle.Producto_IdProducto);
                    if (producto == null)
                    {
                        return new PedidoResponseDto
                        {
                            IsSuccess = false,
                            Message = $"El producto con ID {detalle.Producto_IdProducto} no existe"
                        };
                    }
                }

                var pedido = new Pedidos
                {
                    Cliente_IdCliente = createPedidoDto.Cliente_IdCliente,
                    FechaEntrega = createPedidoDto.FechaEntrega,
                    Estado = createPedidoDto.Estado
                };

                _context.Pedidos.Add(pedido);
                await _context.SaveChangesAsync();

                // Agregar detalles
                foreach (var detalleDto in createPedidoDto.DetallesPedido)
                {
                    var detalle = new DetallePedido
                    {
                        Pedido_IdPedido = pedido.IdPedido,
                        Producto_IdProducto = detalleDto.Producto_IdProducto,
                        Cantidad = detalleDto.Cantidad,
                        PrecioUnitario = detalleDto.PrecioUnitario
                    };

                    _context.DetallesPedido.Add(detalle);
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                var pedidoInfo = await GetPedidoByIdAsync(pedido.IdPedido);

                _logger.LogInformation($"Pedido creado: ID {pedido.IdPedido} para cliente {createPedidoDto.Cliente_IdCliente}");

                return new PedidoResponseDto
                {
                    IsSuccess = true,
                    Message = "Pedido creado exitosamente",
                    Pedido = pedidoInfo
                };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error al crear pedido");
                return new PedidoResponseDto
                {
                    IsSuccess = false,
                    Message = "Error interno del servidor"
                };
            }
        }

        public async Task<PedidoResponseDto> UpdatePedidoAsync(int id, UpdatePedidoDto updatePedidoDto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var pedido = await _context.Pedidos
                    .Include(p => p.DetallesPedido)
                    .FirstOrDefaultAsync(p => p.IdPedido == id);

                if (pedido == null)
                {
                    return new PedidoResponseDto
                    {
                        IsSuccess = false,
                        Message = "Pedido no encontrado"
                    };
                }

                // Validar que el cliente existe
                var cliente = await _context.Clientes.FindAsync(updatePedidoDto.Cliente_IdCliente);
                if (cliente == null)
                {
                    return new PedidoResponseDto
                    {
                        IsSuccess = false,
                        Message = "El cliente especificado no existe"
                    };
                }

                // Validar productos en los detalles
                foreach (var detalle in updatePedidoDto.DetallesPedido)
                {
                    var producto = await _context.Productos.FindAsync(detalle.Producto_IdProducto);
                    if (producto == null)
                    {
                        return new PedidoResponseDto
                        {
                            IsSuccess = false,
                            Message = $"El producto con ID {detalle.Producto_IdProducto} no existe"
                        };
                    }
                }

                // Actualizar propiedades del pedido
                pedido.Cliente_IdCliente = updatePedidoDto.Cliente_IdCliente;
                pedido.FechaEntrega = updatePedidoDto.FechaEntrega;
                pedido.Estado = updatePedidoDto.Estado;

                // Actualizar detalles
                await UpdateDetallesPedidoAsync(pedido, updatePedidoDto.DetallesPedido);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                var pedidoInfo = await GetPedidoByIdAsync(id);

                _logger.LogInformation($"Pedido actualizado: ID {id}");

                return new PedidoResponseDto
                {
                    IsSuccess = true,
                    Message = "Pedido actualizado exitosamente",
                    Pedido = pedidoInfo
                };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error al actualizar pedido con ID {Id}", id);
                return new PedidoResponseDto
                {
                    IsSuccess = false,
                    Message = "Error interno del servidor"
                };
            }
        }

        public async Task<PedidoResponseDto> DeletePedidoAsync(int id)
        {
            try
            {
                var pedido = await _context.Pedidos.FindAsync(id);
                if (pedido == null)
                {
                    return new PedidoResponseDto
                    {
                        IsSuccess = false,
                        Message = "Pedido no encontrado"
                    };
                }

                // Solo permitir eliminar pedidos que no estén en producción o completados
                if (pedido.Estado == EstadoPedido.EnProduccion || pedido.Estado == EstadoPedido.Completado)
                {
                    return new PedidoResponseDto
                    {
                        IsSuccess = false,
                        Message = "No se puede eliminar un pedido en producción o completado"
                    };
                }

                _context.Pedidos.Remove(pedido);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Pedido eliminado: ID {id}");

                return new PedidoResponseDto
                {
                    IsSuccess = true,
                    Message = "Pedido eliminado exitosamente"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar pedido con ID {Id}", id);
                return new PedidoResponseDto
                {
                    IsSuccess = false,
                    Message = "Error interno del servidor"
                };
            }
        }

        public async Task<PedidoInfoDto?> GetPedidoByIdAsync(int id)
        {
            try
            {
                var pedido = await _context.Pedidos
                    .Include(p => p.Cliente)
                    .Include(p => p.DetallesPedido)
                        .ThenInclude(dp => dp.Producto)
                            .ThenInclude(prod => prod.Color)
                    .Include(p => p.DetallesPedido)
                        .ThenInclude(dp => dp.Producto)
                            .ThenInclude(prod => prod.Talla)
                    .FirstOrDefaultAsync(p => p.IdPedido == id);

                if (pedido == null) return null;

                return new PedidoInfoDto
                {
                    IdPedido = pedido.IdPedido,
                    FechaRegistro = (DateTime)pedido.FechaRegistro,
                    FechaEntrega = pedido.FechaEntrega,
                    Estado = pedido.Estado,
                    EstadoDescripcion = GetEstadoDescription(pedido.Estado),
                    Cliente_IdCliente = pedido.Cliente_IdCliente,
                    ClienteNombre = pedido.Cliente.NombreCompleto,
                    ClienteEmail = pedido.Cliente.EmailCliente,
                    DetallesPedido = pedido.DetallesPedido.Select(dp => new DetallePedidoInfoDto
                    {
                        Id = dp.Id,
                        Producto_IdProducto = dp.Producto_IdProducto,
                        ProductoNombre = dp.Producto.NombreProducto,
                        ProductoDescripcion = dp.Producto.DescripcionProducto,
                        ColorDescripcion = dp.Producto.Color.DescripcionColor,
                        TallaDescripcion = dp.Producto.Talla.DescripcionTalla,
                        Cantidad = dp.Cantidad,
                        PrecioUnitario = dp.PrecioUnitario,
                        Subtotal = dp.Subtotal,
                        FechaCreacion = (DateTime)dp.FechaCreacion
                    }).ToList(),
                    TotalPedido = pedido.TotalPedido,
                    TotalItems = pedido.TotalItems,
                    EstaVencido = pedido.EstaVencido,
                    FechaCreacion = (DateTime)pedido.FechaCreacion,
                    FechaActualizacion = pedido.FechaActualizacion
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener pedido con ID {Id}", id);
                return null;
            }
        }

        public async Task<PedidoListDto> GetPedidosAsync(PedidoFilterDto? filter = null)
        {
            try
            {
                filter ??= new PedidoFilterDto();

                var query = _context.Pedidos
                    .Include(p => p.Cliente)
                    .Include(p => p.DetallesPedido)
                    .AsQueryable();

                // Aplicar filtros
                if (filter.ClienteId.HasValue)
                {
                    query = query.Where(p => p.Cliente_IdCliente == filter.ClienteId.Value);
                }

                if (filter.Estado.HasValue)
                {
                    query = query.Where(p => p.Estado == filter.Estado.Value);
                }

                if (filter.FechaDesde.HasValue)
                {
                    query = query.Where(p => p.FechaRegistro >= filter.FechaDesde.Value);
                }

                if (filter.FechaHasta.HasValue)
                {
                    query = query.Where(p => p.FechaRegistro <= filter.FechaHasta.Value);
                }

                if (filter.EstaVencido.HasValue)
                {
                    if (filter.EstaVencido.Value)
                    {
                        query = query.Where(p => p.FechaEntrega < DateTime.Now && p.Estado != EstadoPedido.Completado);
                    }
                    else
                    {
                        query = query.Where(p => p.FechaEntrega >= DateTime.Now || p.Estado == EstadoPedido.Completado);
                    }
                }

                var totalCount = await query.CountAsync();

                var pedidos = await query
                    .OrderByDescending(p => p.FechaRegistro)
                    .Skip((filter.PageNumber - 1) * filter.PageSize)
                    .Take(filter.PageSize)
                    .Select(p => new PedidoInfoDto
                    {
                        IdPedido = p.IdPedido,
                        FechaRegistro = (DateTime)p.FechaRegistro,
                        FechaEntrega = p.FechaEntrega,
                        Estado = p.Estado,
                        EstadoDescripcion = GetEstadoDescription(p.Estado),
                        Cliente_IdCliente = p.Cliente_IdCliente,
                        ClienteNombre = p.Cliente.NombreCompleto,
                        ClienteEmail = p.Cliente.EmailCliente,
                        DetallesPedido = new List<DetallePedidoInfoDto>(), // Para el listado no incluimos detalles por performance
                        TotalPedido = p.DetallesPedido.Sum(dp => dp.Cantidad * dp.PrecioUnitario),
                        TotalItems = p.DetallesPedido.Sum(dp => dp.Cantidad),
                        EstaVencido = p.FechaEntrega < DateTime.Now && p.Estado != EstadoPedido.Completado,
                        FechaCreacion = (DateTime)p.FechaCreacion,
                        FechaActualizacion = p.FechaActualizacion
                    })
                    .ToListAsync();

                return new PedidoListDto
                {
                    Pedidos = pedidos,
                    TotalCount = totalCount,
                    //PageNumber = filter.PageNumber,
                    //PageSize = filter.PageSize
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener lista de pedidos");
                return new PedidoListDto();
            }
        }

        public async Task<PedidoListDto> GetPedidosByClienteAsync(int clienteId/*, int pageNumber = 1, int pageSize = 10*/)
        {
            var filter = new PedidoFilterDto
            {
                ClienteId = clienteId,
                //PageNumber = pageNumber,
                //PageSize = pageSize
            };

            return await GetPedidosAsync(filter);
        }

        public async Task<PedidoResponseDto> UpdateEstadoPedidoAsync(int id, EstadoPedido nuevoEstado)
        {
            try
            {
                var pedido = await _context.Pedidos.FindAsync(id);
                if (pedido == null)
                {
                    return new PedidoResponseDto
                    {
                        IsSuccess = false,
                        Message = "Pedido no encontrado"
                    };
                }

                var estadoAnterior = pedido.Estado;
                pedido.Estado = nuevoEstado;

                await _context.SaveChangesAsync();

                _logger.LogInformation($"Estado de pedido {id} cambiado de {estadoAnterior} a {nuevoEstado}");

                return new PedidoResponseDto
                {
                    IsSuccess = true,
                    Message = $"Estado actualizado de {GetEstadoDescription(estadoAnterior)} a {GetEstadoDescription(nuevoEstado)}"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar estado de pedido {Id}", id);
                return new PedidoResponseDto
                {
                    IsSuccess = false,
                    Message = "Error interno del servidor"
                };
            }
        }

        public async Task<List<PedidoInfoDto>> GetPedidosVencidosAsync()
        {
            try
            {
                var pedidosVencidos = await _context.Pedidos
                    .Include(p => p.Cliente)
                    .Include(p => p.DetallesPedido)
                    .Where(p => p.FechaEntrega < DateTime.Now && p.Estado != EstadoPedido.Completado && p.Estado != EstadoPedido.Cancelado)
                    .Select(p => new PedidoInfoDto
                    {
                        IdPedido = p.IdPedido,
                        FechaRegistro = (DateTime)p.FechaRegistro,
                        FechaEntrega = p.FechaEntrega,
                        Estado = p.Estado,
                        EstadoDescripcion = GetEstadoDescription(p.Estado),
                        Cliente_IdCliente = p.Cliente_IdCliente,
                        ClienteNombre = p.Cliente.NombreCompleto,
                        ClienteEmail = p.Cliente.EmailCliente,
                        DetallesPedido = new List<DetallePedidoInfoDto>(),
                        TotalPedido = p.DetallesPedido.Sum(dp => dp.Cantidad * dp.PrecioUnitario),
                        TotalItems = p.DetallesPedido.Sum(dp => dp.Cantidad),
                        EstaVencido = true,
                        FechaCreacion = (DateTime)p.FechaCreacion,
                        FechaActualizacion = p.FechaActualizacion
                    })
                    .ToListAsync();

                return pedidosVencidos;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener pedidos vencidos");
                return new List<PedidoInfoDto>();
            }
        }

        public async Task<decimal> GetTotalVentasByPeriodoAsync(DateTime fechaInicio, DateTime fechaFin)
        {
            try
            {
                var totalVentas = await _context.Pedidos
                    .Include(p => p.DetallesPedido)
                    .Where(p => p.FechaRegistro >= fechaInicio &&
                               p.FechaRegistro <= fechaFin &&
                               (p.Estado == EstadoPedido.Completado || p.Estado == EstadoPedido.Entregado))
                    .SelectMany(p => p.DetallesPedido)
                    .SumAsync(dp => dp.Cantidad * dp.PrecioUnitario);

                return totalVentas;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al calcular total de ventas");
                return 0;
            }
        }

        public async Task<Dictionary<EstadoPedido, int>> GetEstadisticasEstadosAsync()
        {
            try
            {
                var estadisticas = await _context.Pedidos
                    .GroupBy(p => p.Estado)
                    .Select(g => new { Estado = g.Key, Cantidad = g.Count() })
                    .ToDictionaryAsync(x => x.Estado, x => x.Cantidad);

                return estadisticas;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener estadísticas de estados");
                return new Dictionary<EstadoPedido, int>();
            }
        }

        #region Private Helper Methods
        public async Task<PedidoInfoDto?> GetProximoPedidoAsync()
        {
            try
            {
                var proximoPedido = await _context.Pedidos
                    .Include(p => p.Cliente)
                    .Include(p => p.DetallesPedido)
                    .Where(p => p.Estado == EstadoPedido.EnProceso || p.Estado == EstadoPedido.EnProduccion)
                    .OrderBy(p => p.FechaEntrega)
                    .FirstOrDefaultAsync();

                if (proximoPedido == null) return null;

                return await GetPedidoByIdAsync(proximoPedido.IdPedido);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener próximo pedido");
                return null;
            }
        }

        public async Task<PedidoProgresoDto?> GetProgresoPedidoAsync(int pedidoId, ApplicationDbContext context)
        {
            try
            {
                var pedido = await context.Pedidos
                    .Include(p => p.DetallesPedido)
                    .FirstOrDefaultAsync(p => p.IdPedido == pedidoId);

                if (pedido == null) return null;

                var productosIds = pedido.DetallesPedido.Select(dp => dp.Producto_IdProducto).Distinct().ToList();

                int totalTareas = 0;
                int tareasCompletadas = 0;
                int tareasEnProceso = 0;

                foreach (var productoId in productosIds)
                {
                    var tareas = await context.UsuarioProductoTareas
                        .Where(upt => upt.Producto_IdProducto == productoId)
                        .ToListAsync();

                    totalTareas += tareas.Count;
                    tareasCompletadas += tareas.Count(t => t.Estado == EstadoTarea.Completada);
                    tareasEnProceso += tareas.Count(t => t.Estado == EstadoTarea.EnProceso);
                }

                var porcentaje = totalTareas > 0 ? (decimal)tareasCompletadas / totalTareas * 100 : 0;
                var tiempoRestante = pedido.FechaEntrega - DateTime.Now;

                return new PedidoProgresoDto
                {
                    IdPedido = pedidoId,
                    TotalTareas = totalTareas,
                    TareasCompletadas = tareasCompletadas,
                    TareasPendientes = totalTareas - tareasCompletadas - tareasEnProceso,
                    TareasEnProceso = tareasEnProceso,
                    PorcentajeCompletado = Math.Round(porcentaje, 2),
                    FechaEntrega = pedido.FechaEntrega,
                    TiempoRestante = tiempoRestante,
                    DiasRestantes = tiempoRestante.Days,
                    HorasRestantes = tiempoRestante.Hours,
                    MinutosRestantes = tiempoRestante.Minutes,
                    EstaVencido = pedido.EstaVencido
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener progreso de pedido {PedidoId}", pedidoId);
                return null;
            }
        }

        public async Task<Dictionary<string, int>> GetPedidosPorSemestreAsync(int year)
        {
            try
            {
                var resultado = new Dictionary<string, int>();

                for (int y = year - 2; y <= year; y++)
                {
                    // Fechas de inicio y fin del semestre 1
                    var inicioSemestre1 = new DateTime(y, 1, 1);
                    var finSemestre1 = new DateTime(y, 6, 30, 23, 59, 59);

                    var semestre1Count = await _context.Pedidos
                        .CountAsync(p => p.FechaRegistro >= inicioSemestre1 && p.FechaRegistro <= finSemestre1);
                    resultado.Add($"{y}-1", semestre1Count);

                    // Fechas de inicio y fin del semestre 2
                    var inicioSemestre2 = new DateTime(y, 7, 1);
                    var finSemestre2 = new DateTime(y, 12, 31, 23, 59, 59);

                    var semestre2Count = await _context.Pedidos
                        .CountAsync(p => p.FechaRegistro >= inicioSemestre2 && p.FechaRegistro <= finSemestre2);
                    resultado.Add($"{y}-2", semestre2Count);
                }

                return resultado;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener pedidos por semestre");
                return new Dictionary<string, int>();
            }
        }

        public async Task<List<PedidoConProgresoDto>> GetPedidosPendientesConProgresoAsync()
        {
            try
            {
                var pedidosPendientes = await _context.Pedidos
                    .Include(p => p.Cliente)
                    .Include(p => p.DetallesPedido)
                    .Where(p => p.Estado == EstadoPedido.Pendiente ||
                               p.Estado == EstadoPedido.EnProceso ||
                               p.Estado == EstadoPedido.EnProduccion)
                    .OrderBy(p => p.FechaEntrega)
                    .ToListAsync();

                var resultado = new List<PedidoConProgresoDto>();

                foreach (var pedido in pedidosPendientes)
                {
                    var progreso = await GetProgresoPedidoAsync(pedido.IdPedido, _context);

                    resultado.Add(new PedidoConProgresoDto
                    {
                        IdPedido = pedido.IdPedido,
                        ClienteNombre = pedido.Cliente.NombreCompleto,
                        FechaEntrega = pedido.FechaEntrega,
                        Estado = pedido.Estado,
                        PorcentajeCompletado = progreso?.PorcentajeCompletado ?? 0,
                        TotalTareas = progreso?.TotalTareas ?? 0,
                        TareasCompletadas = progreso?.TareasCompletadas ?? 0,
                        TotalPedido = pedido.DetallesPedido.Sum(dp => dp.Cantidad * dp.PrecioUnitario),
                        ImagenProducto = ""
                    });
                }

                return resultado;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener pedidos pendientes con progreso");
                return new List<PedidoConProgresoDto>();
            }
        }

        private async Task UpdateDetallesPedidoAsync(Pedidos pedido, List<UpdateDetallePedidoDto> nuevosDetalles)
        {
            // Obtener detalles existentes
            var detallesExistentes = pedido.DetallesPedido.ToList();

            // Eliminar detalles que ya no están en la nueva lista
            var idsNuevos = nuevosDetalles.Where(d => d.Id.HasValue).Select(d => d.Id.Value).ToList();
            var detallesAEliminar = detallesExistentes.Where(d => !idsNuevos.Contains(d.Id)).ToList();

            foreach (var detalle in detallesAEliminar)
            {
                _context.DetallesPedido.Remove(detalle);
            }

            // Actualizar o crear detalles
            foreach (var detalleDto in nuevosDetalles)
            {
                if (detalleDto.Id.HasValue)
                {
                    // Actualizar existente
                    var detalleExistente = detallesExistentes.FirstOrDefault(d => d.Id == detalleDto.Id.Value);
                    if (detalleExistente != null)
                    {
                        detalleExistente.Producto_IdProducto = detalleDto.Producto_IdProducto;
                        detalleExistente.Cantidad = detalleDto.Cantidad;
                        detalleExistente.PrecioUnitario = detalleDto.PrecioUnitario;
                    }
                }
                else
                {
                    // Crear nuevo
                    var nuevoDetalle = new DetallePedido
                    {
                        Pedido_IdPedido = pedido.IdPedido,
                        Producto_IdProducto = detalleDto.Producto_IdProducto,
                        Cantidad = detalleDto.Cantidad,
                        PrecioUnitario = detalleDto.PrecioUnitario
                    };

                    _context.DetallesPedido.Add(nuevoDetalle);
                }
            }
        }

        private static string GetEstadoDescription(EstadoPedido estado)
        {
            var field = estado.GetType().GetField(estado.ToString());
            var attribute = (DescriptionAttribute?)field?.GetCustomAttributes(typeof(DescriptionAttribute), false).FirstOrDefault();
            return attribute?.Description ?? estado.ToString();
        }

        #endregion
    }
}
