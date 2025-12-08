using ConfeccionesEsperanzaEF.Models.Common;
using ConfeccionesEsperanzaEF.Models.DTOs.Customer;
using ConfeccionesEsperanzaEF.Models.DTOs.Production;
using ConfeccionesEsperanzaEF.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ConfeccionesEsperanzaEF.Controllers
{
    /// <summary>
    /// Controlador para la gestión de tareas de producción
    /// Responsabilidad: CRUD de tareas y gestión de asignaciones de trabajo
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    [Authorize] // Requiere autenticación para todos los endpoints
    public class TaskController : ControllerBase
    {
        private readonly ITaskService _taskService;
        private readonly ILogger<TaskController> _logger;

        public TaskController(ITaskService taskService, ILogger<TaskController> logger)
        {
            _taskService = taskService;
            _logger = logger;
        }

        #region CRUD de Tareas

        /// <summary>
        /// Obtiene todas las tareas con paginación y búsqueda
        /// </summary>
        /// <param name="pageNumber">Número de página</param>
        /// <param name="pageSize">Tamaño de página</param>
        /// <param name="searchTerm">Término de búsqueda opcional</param>
        /// <returns>Lista paginada de tareas</returns>
        [HttpGet]
        public async Task<ActionResult<TareaListDto>> GetTareas(/*int pageNumber = 1, int pageSize = 10,*/ string? searchTerm = null)
        {
            var result = await _taskService.GetTareasAsync(/*pageNumber, pageSize, */searchTerm);

            return Ok(result);
        }

        /// <summary>
        /// Obtiene una tarea específica por ID
        /// </summary>
        /// <param name="id">ID de la tarea</param>
        /// <returns>Información detallada de la tarea</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<TareaInfoDto>> GetTarea(int id)
        {
            var tarea = await _taskService.GetTareaByIdAsync(id);

            if (tarea == null)
            {
                return NotFound(new { message = "Tarea no encontrada" });
            }

            return Ok(tarea);
        }

        /// <summary>
        /// Crea una nueva tarea
        /// </summary>
        /// <param name="createTareaDto">Datos de la tarea a crear</param>
        /// <returns>Información de la tarea creada</returns>
        [HttpPost]
        [Authorize(Roles = "Admin,Manager")] // Solo admin y managers pueden crear tareas
        public async Task<ActionResult<TaskResponseDto>> CreateTarea([FromBody] CreateTareaDto createTareaDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new TaskResponseDto
                {
                    IsSuccess = false,
                    Message = "Datos de entrada inválidos"
                });
            }

            var result = await _taskService.CreateTareaAsync(createTareaDto);

            if (result.IsSuccess)
            {
                return CreatedAtAction(nameof(GetTarea), new { id = ((TareaInfoDto?)result.Data)?.IdTarea }, result);
            }

            return BadRequest(result);
        }

        /// <summary>
        /// Actualiza una tarea existente
        /// </summary>
        /// <param name="id">ID de la tarea a actualizar</param>
        /// <param name="updateTareaDto">Datos actualizados de la tarea</param>
        /// <returns>Información de la tarea actualizada</returns>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<TaskResponseDto>> UpdateTarea(int id, [FromBody] UpdateTareaDto updateTareaDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new TaskResponseDto
                {
                    IsSuccess = false,
                    Message = "Datos de entrada inválidos"
                });
            }

            var result = await _taskService.UpdateTareaAsync(id, updateTareaDto);

            if (result.IsSuccess)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }

        /// <summary>
        /// Elimina una tarea
        /// </summary>
        /// <param name="id">ID de la tarea a eliminar</param>
        /// <returns>Confirmación de eliminación</returns>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")] // Solo admin puede eliminar tareas
        public async Task<ActionResult<TaskResponseDto>> DeleteTarea(int id)
        {
            var result = await _taskService.DeleteTareaAsync(id);

            if (result.IsSuccess)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }

        #endregion

        #region CRUD de Asignaciones

        /// <summary>
        /// Obtiene todas las asignaciones con filtros opcionales
        /// </summary>
        /// <param name="filter">Filtros de búsqueda</param>
        /// <returns>Lista paginada de asignaciones</returns>
        [HttpGet("asignaciones")]
        public async Task<ActionResult<UsuarioProductoTareaListDto>> GetAsignaciones([FromQuery] AsignacionFilterDto? filter)
        {
            var result = await _taskService.GetAsignacionesAsync(filter);
            return Ok(result);
        }

        /// <summary>
        /// Obtiene una asignación específica por ID
        /// </summary>
        /// <param name="id">ID de la asignación</param>
        /// <returns>Información detallada de la asignación</returns>
        [HttpGet("asignaciones/{id}")]
        public async Task<ActionResult<UsuarioProductoTareaInfoDto>> GetAsignacion(int id)
        {
            var asignacion = await _taskService.GetAsignacionByIdAsync(id);

            if (asignacion == null)
            {
                return NotFound(new { message = "Asignación no encontrada" });
            }

            return Ok(asignacion);
        }

        /// <summary>
        /// Obtiene asignaciones de un usuario específico
        /// </summary>
        /// <param name="usuarioId">ID del usuario</param>
        /// <param name="pageNumber">Número de página</param>
        /// <param name="pageSize">Tamaño de página</param>
        /// <returns>Lista paginada de asignaciones del usuario</returns>
        [HttpGet("mis-asignaciones")]
        public async Task<ActionResult<UsuarioProductoTareaListDto>> GetMisAsignaciones(/*int pageNumber = 1, int pageSize = 10*/)
        {
            var currentUserId = GetCurrentUserId();
            var result = await _taskService.GetAsignacionesByUsuarioAsync(currentUserId/*, pageNumber, pageSize*/);
            return Ok(result);
        }

        /// <summary>
        /// Obtiene asignaciones de un usuario específico (para managers/admin)
        /// </summary>
        /// <param name="usuarioId">ID del usuario</param>
        /// <param name="pageNumber">Número de página</param>
        /// <param name="pageSize">Tamaño de página</param>
        /// <returns>Lista paginada de asignaciones del usuario</returns>
        [HttpGet("usuario/{usuarioId}/asignaciones")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<UsuarioProductoTareaListDto>> GetAsignacionesByUsuario(string usuarioId/*, int pageNumber = 1, int pageSize = 10*/)
        {
            var result = await _taskService.GetAsignacionesByUsuarioAsync(usuarioId/*, pageNumber, pageSize*/);
            return Ok(result);
        }

        /// <summary>
        /// Crea una nueva asignación de tarea
        /// </summary>
        /// <param name="createAsignacionDto">Datos de la asignación a crear</param>
        /// <returns>Información de la asignación creada</returns>
        [HttpPost("asignaciones")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<TaskResponseDto>> CreateAsignacion([FromBody] CreateUsuarioProductoTareaDto createAsignacionDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new TaskResponseDto
                {
                    IsSuccess = false,
                    Message = "Datos de entrada inválidos"
                });
            }

            var result = await _taskService.CreateAsignacionAsync(createAsignacionDto);

            if (result.IsSuccess)
            {
                return CreatedAtAction(nameof(GetAsignacion), new { id = ((UsuarioProductoTareaInfoDto?)result.Data)?.Id }, result);
            }

            return BadRequest(result);
        }

        /// <summary>
        /// Actualiza una asignación existente
        /// </summary>
        /// <param name="id">ID de la asignación a actualizar</param>
        /// <param name="updateAsignacionDto">Datos actualizados de la asignación</param>
        /// <returns>Información de la asignación actualizada</returns>
        [HttpPut("asignaciones/{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<TaskResponseDto>> UpdateAsignacion(int id, [FromBody] UpdateUsuarioProductoTareaDto updateAsignacionDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new TaskResponseDto
                {
                    IsSuccess = false,
                    Message = "Datos de entrada inválidos"
                });
            }

            var result = await _taskService.UpdateAsignacionAsync(id, updateAsignacionDto);

            if (result.IsSuccess)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }

        /// <summary>
        /// Elimina una asignación
        /// </summary>
        /// <param name="id">ID de la asignación a eliminar</param>
        /// <returns>Confirmación de eliminación</returns>
        [HttpDelete("asignaciones/{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<TaskResponseDto>> DeleteAsignacion(int id)
        {
            var result = await _taskService.DeleteAsignacionAsync(id);

            if (result.IsSuccess)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }

        #endregion

        #region Gestión de Estados de Asignaciones

        /// <summary>
        /// Cambia el estado de una asignación
        /// </summary>
        /// <param name="id">ID de la asignación</param>
        /// <param name="nuevoEstado">Nuevo estado</param>
        /// <returns>Confirmación del cambio</returns>
        [HttpPut("asignaciones/{id}/estado")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<TaskResponseDto>> CambiarEstadoAsignacion(int id, [FromBody] EstadoTarea nuevoEstado)
        {
            var result = await _taskService.CambiarEstadoAsignacionAsync(id, nuevoEstado);

            if (result.IsSuccess)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }

        /// <summary>
        /// Inicia una tarea (cambia estado a En Proceso)
        /// </summary>
        /// <param name="id">ID de la asignación</param>
        /// <returns>Confirmación del cambio</returns>
        [HttpPost("asignaciones/{id}/iniciar")]
        public async Task<ActionResult<TaskResponseDto>> IniciarTarea(int id)
        {
            // Los usuarios pueden iniciar sus propias tareas, managers/admin pueden iniciar cualquiera
            if (!await CanAccessAsignacion(id) && !CurrentUserHasRole("Manager") && !CurrentUserHasRole("Admin"))
            {
                return Forbid("No tienes permisos para iniciar esta tarea");
            }

            var result = await _taskService.IniciarTareaAsync(id);

            if (result.IsSuccess)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }

        /// <summary>
        /// Completa una tarea (cambia estado a Completada)
        /// </summary>
        /// <param name="id">ID de la asignación</param>
        /// <returns>Confirmación del cambio</returns>
        [HttpPost("asignaciones/{id}/completar")]
        public async Task<ActionResult<TaskResponseDto>> CompletarTarea(int id)
        {
            // Los usuarios pueden completar sus propias tareas, managers/admin pueden completar cualquiera
            if (!await CanAccessAsignacion(id) && !CurrentUserHasRole("Manager") && !CurrentUserHasRole("Admin"))
            {
                return Forbid("No tienes permisos para completar esta tarea");
            }

            var result = await _taskService.CompletarTareaAsync(id);

            if (result.IsSuccess)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }

        /// <summary>
        /// Pausa una tarea (cambia estado a En Pausa)
        /// </summary>
        /// <param name="id">ID de la asignación</param>
        /// <returns>Confirmación del cambio</returns>
        [HttpPost("asignaciones/{id}/pausar")]
        public async Task<ActionResult<TaskResponseDto>> PausarTarea(int id)
        {
            // Los usuarios pueden pausar sus propias tareas, managers/admin pueden pausar cualquiera
            if (!await CanAccessAsignacion(id) && !CurrentUserHasRole("Manager") && !CurrentUserHasRole("Admin"))
            {
                return Forbid("No tienes permisos para pausar esta tarea");
            }

            var result = await _taskService.PausarTareaAsync(id);

            if (result.IsSuccess)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }

        #endregion

        #region Asignaciones Masivas

        /// <summary>
        /// Asigna tareas de forma masiva a múltiples usuarios, productos y tareas
        /// </summary>
        /// <param name="asignacionMasiva">Datos para la asignación masiva</param>
        /// <returns>Resultado de las asignaciones</returns>
        [HttpPost("asignaciones/masivas")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<TaskResponseDto>> AsignarTareasMasivas([FromBody] AsignarTareasMasivasDto asignacionMasiva)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new TaskResponseDto
                {
                    IsSuccess = false,
                    Message = "Datos de entrada inválidos"
                });
            }

            var result = await _taskService.AsignarTareasMasivasAsync(asignacionMasiva);

            if (result.IsSuccess)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }

        #endregion

        #region Reportes y Estadísticas

        /// <summary>
        /// Obtiene estadísticas de estados de tareas
        /// </summary>
        /// <returns>Diccionario con cantidad de asignaciones por estado</returns>
        [HttpGet("estadisticas-estados")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<Dictionary<EstadoTarea, int>>> GetEstadisticasEstados()
        {
            var estadisticas = await _taskService.GetEstadisticasEstadosAsync();
            return Ok(estadisticas);
        }

        /// <summary>
        /// Obtiene tareas vencidas (fecha fin pasada y no completadas)
        /// </summary>
        /// <returns>Lista de tareas vencidas</returns>
        [HttpGet("vencidas")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<List<UsuarioProductoTareaInfoDto>>> GetTareasVencidas()
        {
            var tareasVencidas = await _taskService.GetTareasVencidasAsync();
            return Ok(tareasVencidas);
        }

        /// <summary>
        /// Obtiene productividad por usuario en un período
        /// </summary>
        /// <param name="fechaInicio">Fecha de inicio</param>
        /// <param name="fechaFin">Fecha de fin</param>
        /// <returns>Diccionario con tareas completadas por usuario</returns>
        [HttpGet("productividad")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<Dictionary<string, int>>> GetProductividadPorUsuario(DateTime fechaInicio, DateTime fechaFin)
        {
            var productividad = await _taskService.GetProductividadPorUsuarioAsync(fechaInicio, fechaFin);
            return Ok(new { FechaInicio = fechaInicio, FechaFin = fechaFin, Productividad = productividad });
        }

        #endregion

        #region Helper Methods

        /// <summary>
        /// Obtiene el ID del usuario actual desde el token JWT
        /// </summary>
        /// <returns>ID del usuario actual</returns>
        private string GetCurrentUserId()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
            {
                throw new UnauthorizedAccessException("No se pudo obtener el ID del usuario");
            }

            return userId;
        }

        /// <summary>
        /// Verifica si el usuario actual tiene un rol específico
        /// </summary>
        /// <param name="role">Nombre del rol</param>
        /// <returns>True si el usuario tiene el rol</returns>
        private bool CurrentUserHasRole(string role)
        {
            return User.IsInRole(role);
        }

        /// <summary>
        /// Verifica si el usuario actual puede acceder a una asignación específica
        /// </summary>
        /// <param name="asignacionId">ID de la asignación</param>
        /// <returns>True si puede acceder</returns>
        private async Task<bool> CanAccessAsignacion(int asignacionId)
        {
            var asignacion = await _taskService.GetAsignacionByIdAsync(asignacionId);
            var currentUserId = GetCurrentUserId();

            return asignacion?.Usuario_IdUsuario == currentUserId;
        }

        #endregion
    }
}
