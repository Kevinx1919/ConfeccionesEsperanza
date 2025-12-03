using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using ConfeccionesEsperanzaEF.Services;
using ConfeccionesEsperanzaEF.Models.DTOs.Auth;
using ConfeccionesEsperanzaEF.Models.DTOs.Role;
using ConfeccionesEsperanzaEF.Models.DTOs.User;

namespace ConfeccionesEsperanzaEF.Controllers
{
    /// <summary>
    /// Controlador para la gestión de roles y administración de usuarios
    /// Responsabilidad: Administración del sistema, roles y usuarios
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    [Authorize(Roles = "Admin")] // Todos los endpoints requieren rol Admin
    public class RolesController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<RolesController> _logger;

        public RolesController(IAuthService authService, ILogger<RolesController> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        #region User Management

        /// <summary>
        /// Obtiene la lista de usuarios (Solo Administradores)
        /// </summary>
        /// <param name="pageNumber">Número de página</param>
        /// <param name="pageSize">Tamaño de página</param>
        /// <returns>Lista paginada de usuarios</returns>
        [HttpGet("users")]
        public async Task<ActionResult<UserListDto>> GetUsers(int pageNumber = 1, int pageSize = 10)
        {
            var result = await _authService.GetUsersAsync(pageNumber, pageSize);
            return Ok(result);
        }

        /// <summary>
        /// Bloquea un usuario (Solo Administradores)
        /// </summary>
        /// <param name="userId">ID del usuario a bloquear</param>
        /// <param name="lockoutMinutes">Minutos de bloqueo (opcional, default: 30)</param>
        /// <returns>Respuesta de bloqueo</returns>
        [HttpPost("users/{userId}/lock")]
        public async Task<ActionResult<AuthResponseDto>> LockUser(string userId, int lockoutMinutes = 30)
        {
            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest(new AuthResponseDto
                {
                    IsSuccess = false,
                    Message = "ID de usuario inválido"
                });
            }

            // Prevenir que los administradores se bloqueen a sí mismos
            var currentUserId = GetCurrentUserId();
            if (currentUserId == userId)
            {
                return BadRequest(new AuthResponseDto
                {
                    IsSuccess = false,
                    Message = "No puedes bloquearte a ti mismo"
                });
            }

            var lockoutEnd = DateTimeOffset.UtcNow.AddMinutes(lockoutMinutes);
            var result = await _authService.LockUserAsync(userId, lockoutEnd);

            if (result.IsSuccess)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }

        /// <summary>
        /// Desbloquea un usuario (Solo Administradores)
        /// </summary>
        /// <param name="userId">ID del usuario a desbloquear</param>
        /// <returns>Respuesta de desbloqueo</returns>
        [HttpPost("users/{userId}/unlock")]
        public async Task<ActionResult<AuthResponseDto>> UnlockUser(string userId)
        {
            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest(new AuthResponseDto
                {
                    IsSuccess = false,
                    Message = "ID de usuario inválido"
                });
            }

            var result = await _authService.UnlockUserAsync(userId);

            if (result.IsSuccess)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }

        #endregion

        #region Role Management

        /// <summary>
        /// Crea un nuevo rol (Solo Administradores)
        /// </summary>
        /// <param name="createRoleDto">Datos del rol a crear</param>
        /// <returns>Respuesta de creación de rol</returns>
        [HttpPost]
        public async Task<ActionResult<AuthResponseDto>> CreateRole([FromBody] CreateRoleDto createRoleDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new AuthResponseDto
                {
                    IsSuccess = false,
                    Message = "Datos de entrada inválidos"
                });
            }

            var result = await _authService.CreateRoleAsync(createRoleDto);

            if (result.IsSuccess)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }

        /// <summary>
        /// Obtiene la lista de roles (Solo Administradores)
        /// </summary>
        /// <returns>Lista de roles disponibles</returns>
        [HttpGet]
        public async Task<ActionResult<List<RoleInfoDto>>> GetRoles()
        {
            var roles = await _authService.GetRolesAsync();
            return Ok(roles);
        }

        /// <summary>
        /// Asigna un rol a un usuario (Solo Administradores)
        /// </summary>
        /// <param name="assignRoleDto">Datos para asignar rol</param>
        /// <returns>Respuesta de asignación de rol</returns>
        [HttpPost("assign")]
        public async Task<ActionResult<AuthResponseDto>> AssignRole([FromBody] AssignRoleDto assignRoleDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new AuthResponseDto
                {
                    IsSuccess = false,
                    Message = "Datos de entrada inválidos"
                });
            }

            var result = await _authService.AssignRoleAsync(assignRoleDto);

            if (result.IsSuccess)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }

        /// <summary>
        /// Remueve un rol de un usuario (Solo Administradores)
        /// </summary>
        /// <param name="removeRoleDto">Datos para remover rol</param>
        /// <returns>Respuesta de remoción de rol</returns>
        [HttpPost("remove")]
        public async Task<ActionResult<AuthResponseDto>> RemoveRole([FromBody] AssignRoleDto removeRoleDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new AuthResponseDto
                {
                    IsSuccess = false,
                    Message = "Datos de entrada inválidos"
                });
            }

            // Prevenir que los administradores se remuevan el rol Admin a sí mismos
            var currentUserId = GetCurrentUserId();
            if (currentUserId == removeRoleDto.UserId && removeRoleDto.RoleName.Equals("Admin", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new AuthResponseDto
                {
                    IsSuccess = false,
                    Message = "No puedes removerte el rol de administrador a ti mismo"
                });
            }

            var result = await _authService.RemoveRoleAsync(removeRoleDto);

            if (result.IsSuccess)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }

        #endregion

        #region Claim Management

        /// <summary>
        /// Agrega un claim a un usuario (Solo Administradores)
        /// </summary>
        /// <param name="addUserClaimDto">Datos del claim a agregar</param>
        /// <returns>Respuesta de agregado de claim</returns>
        [HttpPost("users/claims/add")]
        public async Task<ActionResult<AuthResponseDto>> AddUserClaim([FromBody] AddUserClaimDto addUserClaimDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new AuthResponseDto
                {
                    IsSuccess = false,
                    Message = "Datos de entrada inválidos"
                });
            }

            var result = await _authService.AddUserClaimAsync(addUserClaimDto);

            if (result.IsSuccess)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }

        /// <summary>
        /// Remueve un claim de un usuario (Solo Administradores)
        /// </summary>
        /// <param name="removeUserClaimDto">Datos del claim a remover</param>
        /// <returns>Respuesta de remoción de claim</returns>
        [HttpPost("users/claims/remove")]
        public async Task<ActionResult<AuthResponseDto>> RemoveUserClaim([FromBody] AddUserClaimDto removeUserClaimDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new AuthResponseDto
                {
                    IsSuccess = false,
                    Message = "Datos de entrada inválidos"
                });
            }

            var result = await _authService.RemoveUserClaimAsync(removeUserClaimDto);

            if (result.IsSuccess)
            {
                return Ok(result);
            }

            return BadRequest(result);
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

        #endregion
    }
}
