using ConfeccionesEsperanzaEF.Models.Common;
using ConfeccionesEsperanzaEF.Models.DTOs.Order;
using ConfeccionesEsperanzaEF.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ConfeccionesEsperanzaEF.Controllers
{
    /// <summary>
    /// Controlador para la gestión de pedidos
    /// Responsabilidad: CRUD de pedidos y gestión de estados
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    [Authorize] // Requiere autenticación para todos los endpoints
    public class OrderController : ControllerBase
    {
        private readonly IOrderService _orderService;
        private readonly ILogger<OrderController> _logger;

        public OrderController(IOrderService orderService, ILogger<OrderController> logger)
        {
            _orderService = orderService;
            _logger = logger;
        }

        #region CRUD de Pedidos

        /// <summary>
        /// Obtiene todos los pedidos con filtros opcionales
        /// </summary>
        /// <param name="filter">Filtros de búsqueda</param>
        /// <returns>Lista paginada de pedidos</returns>
        [HttpGet]
        public async Task<ActionResult<PedidoListDto>> GetPedidos([FromQuery] PedidoFilterDto? filter)
        {
            var result = await _orderService.GetPedidosAsync(filter);
            return Ok(result);
        }

        /// <summary>
        /// Obtiene un pedido específico por ID
        /// </summary>
        /// <param name="id">ID del pedido</param>
        /// <returns>Información detallada del pedido</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<PedidoInfoDto>> GetPedido(int id)
        {
            var pedido = await _orderService.GetPedidoByIdAsync(id);

            if (pedido == null)
            {
                return NotFound(new { message = "Pedido no encontrado" });
            }

            return Ok(pedido);
        }

        /// <summary>
        /// Obtiene todos los pedidos de un cliente específico
        /// </summary>
        /// <param name="clienteId">ID del cliente</param>
        /// <param name="pageNumber">Número de página</param>
        /// <param name="pageSize">Tamaño de página</param>
        /// <returns>Lista paginada de pedidos del cliente</returns>
        [HttpGet("by-client/{clienteId}")]
        public async Task<ActionResult<PedidoListDto>> GetPedidosByCliente(int clienteId/*, int pageNumber = 1, int pageSize = 10*/)
        {
            var result = await _orderService.GetPedidosByClienteAsync(clienteId/*, pageNumber, pageSize*/);
            return Ok(result);
        }

        /// <summary>
        /// Crea un nuevo pedido
        /// </summary>
        /// <param name="createPedidoDto">Datos del pedido a crear</param>
        /// <returns>Información del pedido creado</returns>
        [HttpPost]
        [Authorize(Roles = "Admin,Manager,User")] // Usuarios normales pueden crear pedidos
        public async Task<ActionResult<PedidoResponseDto>> CreatePedido([FromBody] CreatePedidoDto createPedidoDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new PedidoResponseDto
                {
                    IsSuccess = false,
                    Message = "Datos de entrada inválidos"
                });
            }

            var result = await _orderService.CreatePedidoAsync(createPedidoDto);

            if (result.IsSuccess)
            {
                return CreatedAtAction(nameof(GetPedido), new { id = result.Pedido?.IdPedido }, result);
            }

            return BadRequest(result);
        }

        /// <summary>
        /// Actualiza un pedido existente
        /// </summary>
        /// <param name="id">ID del pedido a actualizar</param>
        /// <param name="updatePedidoDto">Datos actualizados del pedido</param>
        /// <returns>Información del pedido actualizado</returns>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<PedidoResponseDto>> UpdatePedido(int id, [FromBody] UpdatePedidoDto updatePedidoDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new PedidoResponseDto
                {
                    IsSuccess = false,
                    Message = "Datos de entrada inválidos"
                });
            }

            var result = await _orderService.UpdatePedidoAsync(id, updatePedidoDto);

            if (result.IsSuccess)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }

        /// <summary>
        /// Elimina un pedido
        /// </summary>
        /// <param name="id">ID del pedido a eliminar</param>
        /// <returns>Confirmación de eliminación</returns>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Manager")] // Solo admin y managers pueden eliminar
        public async Task<ActionResult<PedidoResponseDto>> DeletePedido(int id)
        {
            var result = await _orderService.DeletePedidoAsync(id);

            if (result.IsSuccess)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }

        #endregion

        #region Gestión de Estados

        /// <summary>
        /// Actualiza el estado de un pedido
        /// </summary>
        /// <param name="id">ID del pedido</param>
        /// <param name="nuevoEstado">Nuevo estado del pedido</param>
        /// <returns>Confirmación del cambio de estado</returns>
        [HttpPut("{id}/estado")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<PedidoResponseDto>> UpdateEstadoPedido(int id, [FromBody] EstadoPedido nuevoEstado)
        {
            var result = await _orderService.UpdateEstadoPedidoAsync(id, nuevoEstado);

            if (result.IsSuccess)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }

        /// <summary>
        /// Marca un pedido como en proceso
        /// </summary>
        /// <param name="id">ID del pedido</param>
        /// <returns>Confirmación del cambio</returns>
        [HttpPost("{id}/iniciar")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<PedidoResponseDto>> IniciarPedido(int id)
        {
            var result = await _orderService.UpdateEstadoPedidoAsync(id, EstadoPedido.EnProceso);

            if (result.IsSuccess)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }

        /// <summary>
        /// Marca un pedido como en producción
        /// </summary>
        /// <param name="id">ID del pedido</param>
        /// <returns>Confirmación del cambio</returns>
        [HttpPost("{id}/producir")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<PedidoResponseDto>> PedidoEnProduccion(int id)
        {
            var result = await _orderService.UpdateEstadoPedidoAsync(id, EstadoPedido.EnProduccion);

            if (result.IsSuccess)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }

        /// <summary>
        /// Marca un pedido como completado
        /// </summary>
        /// <param name="id">ID del pedido</param>
        /// <returns>Confirmación del cambio</returns>
        [HttpPost("{id}/completar")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<PedidoResponseDto>> CompletarPedido(int id)
        {
            var result = await _orderService.UpdateEstadoPedidoAsync(id, EstadoPedido.Completado);

            if (result.IsSuccess)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }

        /// <summary>
        /// Marca un pedido como entregado
        /// </summary>
        /// <param name="id">ID del pedido</param>
        /// <returns>Confirmación del cambio</returns>
        [HttpPost("{id}/entregar")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<PedidoResponseDto>> EntregarPedido(int id)
        {
            var result = await _orderService.UpdateEstadoPedidoAsync(id, EstadoPedido.Entregado);

            if (result.IsSuccess)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }

        /// <summary>
        /// Cancela un pedido
        /// </summary>
        /// <param name="id">ID del pedido</param>
        /// <returns>Confirmación del cambio</returns>
        [HttpPost("{id}/cancelar")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<PedidoResponseDto>> CancelarPedido(int id)
        {
            var result = await _orderService.UpdateEstadoPedidoAsync(id, EstadoPedido.Cancelado);

            if (result.IsSuccess)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }

        #endregion

        #region Reportes y Estadísticas

        /// <summary>
        /// Obtiene pedidos vencidos (fecha de entrega pasada y no completados)
        /// </summary>
        /// <returns>Lista de pedidos vencidos</returns>
        [HttpGet("vencidos")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<List<PedidoInfoDto>>> GetPedidosVencidos()
        {
            var pedidosVencidos = await _orderService.GetPedidosVencidosAsync();
            return Ok(pedidosVencidos);
        }

        /// <summary>
        /// Obtiene el total de ventas por período
        /// </summary>
        /// <param name="fechaInicio">Fecha de inicio</param>
        /// <param name="fechaFin">Fecha de fin</param>
        /// <returns>Total de ventas en el período</returns>
        [HttpGet("ventas-por-periodo")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<decimal>> GetTotalVentasByPeriodo(DateTime fechaInicio, DateTime fechaFin)
        {
            var totalVentas = await _orderService.GetTotalVentasByPeriodoAsync(fechaInicio, fechaFin);
            return Ok(new { FechaInicio = fechaInicio, FechaFin = fechaFin, TotalVentas = totalVentas });
        }

        /// <summary>
        /// Obtiene estadísticas de estados de pedidos
        /// </summary>
        /// <returns>Diccionario con cantidad de pedidos por estado</returns>
        [HttpGet("estadisticas-estados")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<Dictionary<EstadoPedido, int>>> GetEstadisticasEstados()
        {
            var estadisticas = await _orderService.GetEstadisticasEstadosAsync();
            return Ok(estadisticas);
        }

        #endregion
    }
}
