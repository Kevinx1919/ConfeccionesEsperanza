using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ConfeccionesEsperanzaEF.Services;
using ConfeccionesEsperanzaEF.Models.DTOs.Customer;

namespace ConfeccionesEsperanzaEF.Controllers
{
    /// <summary>
    /// Controlador para la gestión de clientes
    /// Responsabilidad: CRUD de clientes y búsquedas relacionadas
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    [Authorize] // Requiere autenticación para todos los endpoints
    public class CustomerController : ControllerBase
    {
        private readonly ICustomerService _customerService;
        private readonly ILogger<CustomerController> _logger;

        public CustomerController(ICustomerService customerService, ILogger<CustomerController> logger)
        {
            _customerService = customerService;
            _logger = logger;
        }

        #region Cliente CRUD

        /// <summary>
        /// Obtiene todos los clientes con paginación y búsqueda
        /// </summary>
        /// <param name="pageNumber">Número de página (default: 1)</param>
        /// <param name="pageSize">Tamaño de página (default: 10)</param>
        /// <param name="searchTerm">Término de búsqueda opcional</param>
        /// <returns>Lista paginada de clientes</returns>
        [HttpGet]
        public async Task<ActionResult<ClienteListDto>> GetClientes(string? searchTerm = null)
        {
            // Obtienes los clientes (agrega la lógica de búsqueda si es necesario)
            var clientesListDto = await _customerService.GetClientesAsync(searchTerm);

            // Ordena los clientes por ID en la lista "Clientes"
            var clientesOrdenados = clientesListDto.Clientes.OrderBy(c => c.IdCliente).ToList();

            // Devuelves la lista ordenada
            clientesListDto.Clientes = clientesOrdenados;

            return Ok(clientesListDto);
        }

        /// <summary>
        /// Obtiene un cliente específico por ID
        /// </summary>
        /// <param name="id">ID del cliente</param>
        /// <returns>Información detallada del cliente</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<ClienteInfoDto>> GetCliente(int id)
        {
            var cliente = await _customerService.GetClienteByIdAsync(id);

            if (cliente == null)
            {
                return NotFound(new { message = "Cliente no encontrado" });
            }

            return Ok(cliente);
        }

        /// <summary>
        /// Busca un cliente por email
        /// </summary>
        /// <param name="email">Email del cliente</param>
        /// <returns>Información del cliente</returns>
        [HttpGet("by-email/{email}")]
        public async Task<ActionResult<ClienteInfoDto>> GetClienteByEmail(string email)
        {
            var cliente = await _customerService.GetClienteByEmailAsync(email);

            if (cliente == null)
            {
                return NotFound(new { message = "Cliente no encontrado con ese email" });
            }

            return Ok(cliente);
        }

        /// <summary>
        /// Busca un cliente por número de documento
        /// </summary>
        /// <param name="numeroDoc">Número de documento del cliente</param>
        /// <returns>Información del cliente</returns>
        [HttpGet("by-document/{numeroDoc}")]
        public async Task<ActionResult<ClienteInfoDto>> GetClienteByDocument(int numeroDoc)
        {
            var cliente = await _customerService.GetClienteByDocumentoAsync(numeroDoc);

            if (cliente == null)
            {
                return NotFound(new { message = "Cliente no encontrado con ese número de documento" });
            }

            return Ok(cliente);
        }

        /// <summary>
        /// Crea un nuevo cliente
        /// </summary>
        /// <param name="createClienteDto">Datos del cliente a crear</param>
        /// <returns>Información del cliente creado</returns>
        [HttpPost]
        [Authorize(Roles = "Admin,Manager,User")] // Usuarios normales pueden crear clientes
        public async Task<ActionResult<ClienteResponseDto>> CreateCliente([FromBody] CreateClienteDto createClienteDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new ClienteResponseDto
                {
                    IsSuccess = false,
                    Message = "Datos de entrada inválidos"
                });
            }

            var result = await _customerService.CreateClienteAsync(createClienteDto);

            if (result.IsSuccess)
            {
                return CreatedAtAction(nameof(GetCliente), new { id = result.Cliente?.IdCliente }, result);
            }

            return BadRequest(result);
        }

        /// <summary>
        /// Actualiza un cliente existente
        /// </summary>
        /// <param name="id">ID del cliente a actualizar</param>
        /// <param name="updateClienteDto">Datos actualizados del cliente</param>
        /// <returns>Información del cliente actualizado</returns>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Manager,User")]
        public async Task<ActionResult<ClienteResponseDto>> UpdateCliente(int id, [FromBody] UpdateClienteDto updateClienteDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new ClienteResponseDto
                {
                    IsSuccess = false,
                    Message = "Datos de entrada inválidos"
                });
            }

            var result = await _customerService.UpdateClienteAsync(id, updateClienteDto);

            if (result.IsSuccess)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }

        /// <summary>
        /// Elimina un cliente
        /// </summary>
        /// <param name="id">ID del cliente a eliminar</param>
        /// <returns>Confirmación de eliminación</returns>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")] // Solo admin y managers pueden eliminar
        public async Task<ActionResult<ClienteResponseDto>> DeleteCliente(int id)
        {
            var result = await _customerService.DeleteClienteAsync(id);

            if (result.IsSuccess)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }

        #endregion
    }
}
