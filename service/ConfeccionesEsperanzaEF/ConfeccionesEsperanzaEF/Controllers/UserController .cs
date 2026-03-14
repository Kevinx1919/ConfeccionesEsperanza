using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using ConfeccionesEsperanzaEF.Services;
using ConfeccionesEsperanzaEF.Models.DTOs.User;

namespace ConfeccionesEsperanzaEF.Controllers
{
    /// <summary>
    /// Controlador para la gestión de usuarios registrados
    /// Responsabilidad: CRUD de usuarios del sistema (no clientes)
    /// Permisos: Lectura para todos los roles autenticados, escritura solo para Admin
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    [Authorize] // Requiere autenticación para todos los endpoints
    public class UserController : ControllerBase
    {
        private readonly IUserManagementService _userManagementService;
        private readonly ILogger<UserController> _logger;

        public UserController(IUserManagementService userManagementService, ILogger<UserController> logger)
        {
            _userManagementService = userManagementService;
            _logger = logger;
        }

        #region Read Operations (Todos los roles autenticados)

        /// <summary>
        /// Obtiene todos los usuarios del sistema con filtros opcionales
        /// </summary>
        /// <param name="filter">Filtros de búsqueda</param>
        /// <returns>Lista paginada de usuarios</returns>
        [HttpGet]
        public async Task<ActionResult<UserListDto>> GetUsers([FromQuery] UserFilterDto? filter)
        {
            var result = await _userManagementService.GetUsersAsync(filter);
            return Ok(result);
        }

        /// <summary>
        /// Obtiene un usuario específico por ID
        /// </summary>
        /// <param name="id">ID del usuario</param>
        /// <returns>Información detallada del usuario</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<UserInfoDto>> GetUser(string id)
        {
            var user = await _userManagementService.GetUserByIdAsync(id);

            if (user == null)
            {
                return NotFound(new { message = "Usuario no encontrado" });
            }

            return Ok(user);
        }

        /// <summary>
        /// Busca un usuario por email
        /// </summary>
        /// <param name="email">Email del usuario</param>
        /// <returns>Información del usuario</returns>
        [HttpGet("by-email/{email}")]
        public async Task<ActionResult<UserInfoDto>> GetUserByEmail(string email)
        {
            var user = await _userManagementService.GetUserByEmailAsync(email);

            if (user == null)
            {
                return NotFound(new { message = "Usuario no encontrado con ese email" });
            }

            return Ok(user);
        }

        /// <summary>
        /// Obtiene los roles de un usuario específico
        /// </summary>
        /// <param name="id">ID del usuario</param>
        /// <returns>Lista de roles del usuario</returns>
        [HttpGet("{id}/roles")]
        public async Task<ActionResult<List<string>>> GetUserRoles(string id)
        {
            var roles = await _userManagementService.GetUserRolesAsync(id);
            return Ok(roles);
        }

        #endregion

        #region Write Operations (Solo Admin)

        /// <summary>
        /// Crea un nuevo usuario del sistema
        /// </summary>
        /// <param name="createUserDto">Datos del usuario a crear</param>
        /// <returns>Información del usuario creado</returns>
        [HttpPost]
        [Authorize(Roles = "Admin")] // Solo Admin puede crear usuarios
        public async Task<ActionResult<UserResponseDto>> CreateUser([FromBody] CreateUserDto createUserDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new UserResponseDto
                {
                    IsSuccess = false,
                    Message = "Datos de entrada inválidos"
                });
            }

            var result = await _userManagementService.CreateUserAsync(createUserDto);

            if (result.IsSuccess)
            {
                return CreatedAtAction(nameof(GetUser), new { id = result.User?.Id }, result);
            }

            return BadRequest(result);
        }

        /// <summary>
        /// Actualiza un usuario existente
        /// </summary>
        /// <param name="id">ID del usuario a actualizar</param>
        /// <param name="updateUserDto">Datos actualizados del usuario</param>
        /// <returns>Información del usuario actualizado</returns>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<UserResponseDto>> UpdateUser(string id, [FromBody] UpdateUserDto updateUserDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new UserResponseDto
                {
                    IsSuccess = false,
                    Message = "Datos de entrada inválidos"
                });
            }

            // Prevenir que los administradores se modifiquen a sí mismos de forma peligrosa
            var currentUserId = GetCurrentUserId();
            if (currentUserId == id)
            {
                // Verificar que no se está removiendo el rol Admin de sí mismo
                if (!updateUserDto.Roles.Contains("Admin", StringComparer.OrdinalIgnoreCase))
                {
                    return BadRequest(new UserResponseDto
                    {
                        IsSuccess = false,
                        Message = "No puedes removerte el rol de administrador a ti mismo"
                    });
                }
            }

            var result = await _userManagementService.UpdateUserAsync(id, updateUserDto);

            if (result.IsSuccess)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }

        /// <summary>
        /// Elimina un usuario del sistema
        /// </summary>
        /// <param name="id">ID del usuario a eliminar</param>
        /// <returns>Confirmación de eliminación</returns>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<UserResponseDto>> DeleteUser(string id)
        {
            // Prevenir que los administradores se eliminen a sí mismos
            var currentUserId = GetCurrentUserId();
            if (currentUserId == id)
            {
                return BadRequest(new UserResponseDto
                {
                    IsSuccess = false,
                    Message = "No puedes eliminarte a ti mismo"
                });
            }

            var result = await _userManagementService.DeleteUserAsync(id);

            if (result.IsSuccess)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }

        /// <summary>
        /// Establece una nueva contraseña para un usuario (sin requerir la anterior)
        /// </summary>
        /// <param name="id">ID del usuario</param>
        /// <param name="setPasswordDto">Nueva contraseña</param>
        /// <returns>Confirmación del cambio</returns>
        [HttpPost("{id}/set-password")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<UserResponseDto>> SetUserPassword(string id, [FromBody] SetPasswordDto setPasswordDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new UserResponseDto
                {
                    IsSuccess = false,
                    Message = "Datos de entrada inválidos"
                });
            }

            var result = await _userManagementService.SetUserPasswordAsync(id, setPasswordDto);

            if (result.IsSuccess)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }

        /// <summary>
        /// Bloquea o desbloquea un usuario
        /// </summary>
        /// <param name="id">ID del usuario</param>
        /// <param name="lockUser">True para bloquear, False para desbloquear</param>
        /// <param name="lockoutMinutes">Minutos de bloqueo (solo si lockUser es true)</param>
        /// <returns>Confirmación del cambio</returns>
        [HttpPost("{id}/toggle-lock")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<UserResponseDto>> ToggleUserLock(string id, bool lockUser, int lockoutMinutes = 30)
        {
            // Prevenir que los administradores se bloqueen a sí mismos
            var currentUserId = GetCurrentUserId();
            if (currentUserId == id && lockUser)
            {
                return BadRequest(new UserResponseDto
                {
                    IsSuccess = false,
                    Message = "No puedes bloquearte a ti mismo"
                });
            }

            var result = await _userManagementService.ToggleUserLockAsync(id, lockUser, lockoutMinutes);

            if (result.IsSuccess)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }

        /// <summary>
        /// Confirma o desconfirma el email de un usuario
        /// </summary>
        /// <param name="id">ID del usuario</param>
        /// <param name="confirmed">True para confirmar, False para desconfirmar</param>
        /// <returns>Confirmación del cambio</returns>
        [HttpPost("{id}/confirm-email")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<UserResponseDto>> ConfirmUserEmail(string id, bool confirmed = true)
        {
            var result = await _userManagementService.ConfirmUserEmailAsync(id, confirmed);

            if (result.IsSuccess)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }

        /// <summary>
        /// Habilita o deshabilita la autenticación de dos factores para un usuario
        /// </summary>
        /// <param name="id">ID del usuario</param>
        /// <param name="enabled">True para habilitar, False para deshabilitar</param>
        /// <returns>Confirmación del cambio</returns>
        [HttpPost("{id}/toggle-2fa")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<UserResponseDto>> ToggleTwoFactor(string id, bool enabled)
        {
            var result = await _userManagementService.ToggleTwoFactorAsync(id, enabled);

            if (result.IsSuccess)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }

        /// <summary>
        /// Actualiza los roles de un usuario
        /// </summary>
        /// <param name="id">ID del usuario</param>
        /// <param name="roles">Nueva lista de roles</param>
        /// <returns>Confirmación del cambio</returns>
        [HttpPut("{id}/roles")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<UserResponseDto>> UpdateUserRoles(string id, [FromBody] List<string> roles)
        {
            // Prevenir que los administradores se remuevan el rol Admin a sí mismos
            var currentUserId = GetCurrentUserId();
            if (currentUserId == id)
            {
                if (!roles.Contains("Admin", StringComparer.OrdinalIgnoreCase))
                {
                    return BadRequest(new UserResponseDto
                    {
                        IsSuccess = false,
                        Message = "No puedes removerte el rol de administrador a ti mismo"
                    });
                }
            }

            var result = await _userManagementService.UpdateUserRolesAsync(id, roles);

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

        /// <summary>
        /// Verifica si el usuario actual es administrador
        /// </summary>
        /// <returns>True si es administrador</returns>
        private bool IsCurrentUserAdmin()
        {
            return CurrentUserHasRole("Admin");
        }

        #endregion
    }
}
