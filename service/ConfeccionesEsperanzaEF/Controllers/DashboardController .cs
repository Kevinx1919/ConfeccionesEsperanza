using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ConfeccionesEsperanzaEF.Services;
using ConfeccionesEsperanzaEF.Models.DTOs.Order;
using ConfeccionesEsperanzaEF.Data;

namespace ConfeccionesEsperanzaEF.Controllers
{
    /// <summary>
    /// Controlador para métricas y dashboard
    /// Responsabilidad: Proporcionar datos agregados y métricas para el dashboard
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    [Authorize] // Requiere autenticación
    public class DashboardController : ControllerBase
    {
        private readonly IOrderService _orderService;
        private readonly ITaskService _taskService;
        private readonly ApplicationDbContext _context;
        private readonly ILogger<DashboardController> _logger;

        public DashboardController(
            IOrderService orderService,
            ITaskService taskService,
            ApplicationDbContext context,
            ILogger<DashboardController> logger)
        {
            _orderService = orderService;
            _taskService = taskService;
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Obtiene todas las métricas del dashboard en una sola llamada
        /// </summary>
        /// <returns>Métricas completas del dashboard</returns>
        [HttpGet("metricas")]
        public async Task<ActionResult<DashboardMetricasDto>> GetMetricasCompletas()
        {
            try
            {
                var proximoPedido = await _orderService.GetProximoPedidoAsync();
                PedidoProgresoDto? progresoProximo = null;

                if (proximoPedido != null)
                {
                    progresoProximo = await _orderService.GetProgresoPedidoAsync(proximoPedido.IdPedido, _context);
                }

                var pedidosPendientes = await _orderService.GetPedidosPendientesConProgresoAsync();
                var pedidosPorSemestre = await _orderService.GetPedidosPorSemestreAsync(DateTime.Now.Year);
                var pedidosVencidos = await _orderService.GetPedidosVencidosAsync();

                var promedioCompletado = pedidosPendientes.Any()
                    ? pedidosPendientes.Average(p => p.PorcentajeCompletado)
                    : 0;

                var metricas = new DashboardMetricasDto
                {
                    ProximoPedido = pedidosPendientes.FirstOrDefault(),
                    ProgresoProximoPedido = progresoProximo,
                    PedidosPendientes = pedidosPendientes.Take(10).ToList(), // Top 10
                    PedidosPorSemestre = pedidosPorSemestre,
                    TotalPedidosActivos = pedidosPendientes.Count,
                    TotalPedidosVencidos = pedidosVencidos.Count,
                    PromedioCompletado = Math.Round(promedioCompletado, 2)
                };

                return Ok(metricas);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener métricas del dashboard");
                return StatusCode(500, new { message = "Error al obtener métricas" });
            }
        }

        /// <summary>
        /// Obtiene el próximo pedido a entregar con countdown
        /// </summary>
        /// <returns>Información del próximo pedido</returns>
        [HttpGet("proximo-pedido")]
        public async Task<ActionResult<PedidoInfoDto>> GetProximoPedido()
        {
            var proximoPedido = await _orderService.GetProximoPedidoAsync();

            if (proximoPedido == null)
            {
                return NotFound(new { message = "No hay pedidos pendientes" });
            }

            return Ok(proximoPedido);
        }

        /// <summary>
        /// Obtiene el progreso detallado de un pedido basado en tareas
        /// </summary>
        /// <param name="pedidoId">ID del pedido</param>
        /// <returns>Progreso del pedido</returns>
        [HttpGet("pedido/{pedidoId}/progreso")]
        public async Task<ActionResult<PedidoProgresoDto>> GetProgresoPedido(int pedidoId)
        {
            var progreso = await _orderService.GetProgresoPedidoAsync(pedidoId, _context);

            if (progreso == null)
            {
                return NotFound(new { message = "Pedido no encontrado" });
            }

            return Ok(progreso);
        }

        /// <summary>
        /// Obtiene la lista de pedidos pendientes con su porcentaje de completado
        /// </summary>
        /// <returns>Lista de pedidos con progreso</returns>
        [HttpGet("pedidos-pendientes")]
        public async Task<ActionResult<List<PedidoConProgresoDto>>> GetPedidosPendientes()
        {
            var pedidosPendientes = await _orderService.GetPedidosPendientesConProgresoAsync();
            return Ok(pedidosPendientes);
        }

        /// <summary>
        /// Obtiene estadísticas de pedidos por semestre para gráfica
        /// </summary>
        /// <param name="year">Año central (se obtendrán datos de 2 años antes y el año actual)</param>
        /// <returns>Diccionario con pedidos por semestre</returns>
        [HttpGet("pedidos-por-semestre")]
        public async Task<ActionResult<Dictionary<string, int>>> GetPedidosPorSemestre(int year)
        {
            if (year < 2020 || year > DateTime.Now.Year + 1)
            {
                return BadRequest(new { message = "Año inválido" });
            }

            var estadisticas = await _orderService.GetPedidosPorSemestreAsync(year);
            return Ok(estadisticas);
        }

        /// <summary>
        /// Obtiene estadísticas generales de producción
        /// </summary>
        /// <returns>Estadísticas de tareas y pedidos</returns>
        [HttpGet("estadisticas-produccion")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult> GetEstadisticasProduccion()
        {
            try
            {
                var estadisticasPedidos = await _orderService.GetEstadisticasEstadosAsync();
                var estadisticasTareas = await _taskService.GetEstadisticasEstadosAsync();
                var tareasVencidas = await _taskService.GetTareasVencidasAsync();
                var pedidosVencidos = await _orderService.GetPedidosVencidosAsync();

                var resultado = new
                {
                    Pedidos = new
                    {
                        PorEstado = estadisticasPedidos,
                        Vencidos = pedidosVencidos.Count,
                        TotalActivos = estadisticasPedidos.Where(x => x.Key != Models.Common.EstadoPedido.Completado &&
                                                                      x.Key != Models.Common.EstadoPedido.Cancelado)
                                                          .Sum(x => x.Value)
                    },
                    Tareas = new
                    {
                        PorEstado = estadisticasTareas,
                        Vencidas = tareasVencidas.Count,
                        TotalActivas = estadisticasTareas.Where(x => x.Key != Models.Common.EstadoTarea.Completada &&
                                                                     x.Key != Models.Common.EstadoTarea.Cancelada)
                                                         .Sum(x => x.Value)
                    }
                };

                return Ok(resultado);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener estadísticas de producción");
                return StatusCode(500, new { message = "Error al obtener estadísticas" });
            }
        }

        /// <summary>
        /// Obtiene el resumen de productividad por usuario en un período
        /// </summary>
        /// <param name="fechaInicio">Fecha de inicio</param>
        /// <param name="fechaFin">Fecha de fin</param>
        /// <returns>Productividad por usuario</returns>
        [HttpGet("productividad-usuarios")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult> GetProductividadUsuarios(DateTime fechaInicio, DateTime fechaFin)
        {
            if (fechaFin < fechaInicio)
            {
                return BadRequest(new { message = "La fecha de fin debe ser posterior a la fecha de inicio" });
            }

            var productividad = await _taskService.GetProductividadPorUsuarioAsync(fechaInicio, fechaFin);

            return Ok(new
            {
                FechaInicio = fechaInicio,
                FechaFin = fechaFin,
                DiasTranscurridos = (fechaFin - fechaInicio).Days,
                Productividad = productividad,
                //UsuarioMasProductivo = productividad.Any() ? productividad.OrderByDescending(p => p.Value).First() : null,
                PromedioTareasPorUsuario = productividad.Any() ? productividad.Average(p => p.Value) : 0
            });
        }

        /// <summary>
        /// Obtiene resumen de ventas y estadísticas financieras
        /// </summary>
        /// <param name="fechaInicio">Fecha de inicio</param>
        /// <param name="fechaFin">Fecha de fin</param>
        /// <returns>Estadísticas de ventas</returns>
        [HttpGet("resumen-ventas")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult> GetResumenVentas(DateTime fechaInicio, DateTime fechaFin)
        {
            if (fechaFin < fechaInicio)
            {
                return BadRequest(new { message = "La fecha de fin debe ser posterior a la fecha de inicio" });
            }

            var totalVentas = await _orderService.GetTotalVentasByPeriodoAsync(fechaInicio, fechaFin);
            var estadisticasPedidos = await _orderService.GetEstadisticasEstadosAsync();

            var pedidosCompletados = estadisticasPedidos.ContainsKey(Models.Common.EstadoPedido.Completado)
                ? estadisticasPedidos[Models.Common.EstadoPedido.Completado]
                : 0;

            var pedidosCancelados = estadisticasPedidos.ContainsKey(Models.Common.EstadoPedido.Cancelado)
                ? estadisticasPedidos[Models.Common.EstadoPedido.Cancelado]
                : 0;

            return Ok(new
            {
                FechaInicio = fechaInicio,
                FechaFin = fechaFin,
                TotalVentas = totalVentas,
                PedidosCompletados = pedidosCompletados,
                PedidosCancelados = pedidosCancelados,
                VentaPromedioPorPedido = pedidosCompletados > 0 ? totalVentas / pedidosCompletados : 0
            });
        }

        /// <summary>
        /// Obtiene alertas y notificaciones importantes
        /// </summary>
        /// <returns>Lista de alertas</returns>
        [HttpGet("alertas")]
        public async Task<ActionResult> GetAlertas()
        {
            var pedidosVencidos = await _orderService.GetPedidosVencidosAsync();
            var tareasVencidas = await _taskService.GetTareasVencidasAsync();

            var alertas = new List<object>();

            // Alertas de pedidos vencidos
            foreach (var pedido in pedidosVencidos.Take(5))
            {
                alertas.Add(new
                {
                    Tipo = "PedidoVencido",
                    Severidad = "Alta",
                    Mensaje = $"Pedido #{pedido.IdPedido} para {pedido.ClienteNombre} está vencido",
                    IdReferencia = pedido.IdPedido,
                    FechaEntrega = pedido.FechaEntrega
                });
            }

            // Alertas de tareas vencidas
            foreach (var tarea in tareasVencidas.Take(5))
            {
                alertas.Add(new
                {
                    Tipo = "TareaVencida",
                    Severidad = "Media",
                    Mensaje = $"Tarea '{tarea.TareaNombre}' del producto '{tarea.ProductoNombre}' está vencida",
                    IdReferencia = tarea.Id,
                    Usuario = tarea.UsuarioNombre
                });
            }

            return Ok(new
            {
                TotalAlertas = alertas.Count,
                Alertas = alertas
            });
        }
    }
}
