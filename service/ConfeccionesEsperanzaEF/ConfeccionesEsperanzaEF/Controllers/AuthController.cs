using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using ConfeccionesEsperanzaEF.Services;
using ConfeccionesEsperanzaEF.Models.DTOs.Auth;
using ConfeccionesEsperanzaEF.Models.DTOs.User;

namespace ConfeccionesEsperanzaEF.Controllers
{
    /// <summary>
    /// Controlador para la autenticación de usuarios
    /// Responsabilidad: Gestión personal de la cuenta del usuario
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IAuthService authService, ILogger<AuthController> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        #region Public Endpoints

        /// <summary>
        /// Registra un nuevo usuario en el sistema
        /// </summary>
        /// <param name="registerDto">Datos de registro del usuario</param>
        /// <returns>Respuesta de autenticación</returns>
        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterDto registerDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new AuthResponseDto
                {
                    IsSuccess = false,
                    Message = "Datos de entrada inválidos",
                });
            }

            var result = await _authService.RegisterAsync(registerDto);

            if (result.IsSuccess)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }

        /// <summary>
        /// Autentica un usuario en el sistema
        /// </summary>
        /// <param name="loginDto">Credenciales de login</param>
        /// <returns>Respuesta de autenticación con token JWT</returns>
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto loginDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new AuthResponseDto
                {
                    IsSuccess = false,
                    Message = "Datos de entrada inválidos"
                });
            }

            var result = await _authService.LoginAsync(loginDto);

            if (result.IsSuccess)
            {
                return Ok(result);
            }

            return Unauthorized(result);
        }

        /// <summary>
        /// Confirma el email del usuario
        /// </summary>
        /// <param name="confirmEmailDto">Datos para confirmar email</param>
        /// <returns>Respuesta de confirmación</returns>
        [HttpPost("confirm-email")]
        [AllowAnonymous]
        public async Task<ActionResult<AuthResponseDto>> ConfirmEmail([FromBody] ConfirmEmailDto confirmEmailDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new AuthResponseDto
                {
                    IsSuccess = false,
                    Message = "Datos de entrada inválidos"
                });
            }

            var result = await _authService.ConfirmEmailAsync(confirmEmailDto);

            if (result.IsSuccess)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }

        #endregion

        #region Authenticated User Endpoints

        /// <summary>
        /// Cierra la sesión del usuario actual
        /// </summary>
        /// <returns>Respuesta de logout</returns>
        [HttpPost("logout")]
        [Authorize]
        public async Task<ActionResult<AuthResponseDto>> Logout()
        {
            var userId = GetCurrentUserId();
            var result = await _authService.LogoutAsync(userId);
            return Ok(result);
        }

        /// <summary>
        /// Cambia la contraseña del usuario actual
        /// </summary>
        /// <param name="changePasswordDto">Datos para cambiar contraseña</param>
        /// <returns>Respuesta del cambio de contraseña</returns>
        [HttpPost("change-password")]
        [Authorize]
        public async Task<ActionResult<AuthResponseDto>> ChangePassword([FromBody] ChangePasswordDto changePasswordDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new AuthResponseDto
                {
                    IsSuccess = false,
                    Message = "Datos de entrada inválidos"
                });
            }

            var userId = GetCurrentUserId();
            var result = await _authService.ChangePasswordAsync(userId, changePasswordDto);

            if (result.IsSuccess)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }

        /// <summary>
        /// Actualiza el perfil del usuario actual
        /// </summary>
        /// <param name="updateProfileDto">Datos del perfil a actualizar</param>
        /// <returns>Respuesta con información actualizada del usuario</returns>
        [HttpPut("profile")]
        [Authorize]
        public async Task<ActionResult<AuthResponseDto>> UpdateProfile([FromBody] UpdateProfileDto updateProfileDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new AuthResponseDto
                {
                    IsSuccess = false,
                    Message = "Datos de entrada inválidos"
                });
            }

            var userId = GetCurrentUserId();
            var result = await _authService.UpdateProfileAsync(userId, updateProfileDto);

            if (result.IsSuccess)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }

        /// <summary>
        /// Obtiene la información del usuario actual
        /// </summary>
        /// <returns>Información del usuario</returns>
        [HttpGet("profile")]
        [Authorize]
        public async Task<ActionResult<UserInfoDto>> GetProfile()
        {
            var userId = GetCurrentUserId();
            var userInfo = await _authService.GetUserInfoAsync(userId);

            if (userInfo == null)
            {
                return NotFound(new { message = "Usuario no encontrado" });
            }

            return Ok(userInfo);
        }

        /// <summary>
        /// Habilita autenticación de dos factores para el usuario actual
        /// </summary>
        /// <returns>Respuesta de habilitación 2FA</returns>
        [HttpPost("enable-2fa")]
        [Authorize]
        public async Task<ActionResult<AuthResponseDto>> EnableTwoFactor()
        {
            var userId = GetCurrentUserId();
            var result = await _authService.EnableTwoFactorAsync(userId);

            if (result.IsSuccess)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }

        /// <summary>
        /// Deshabilita autenticación de dos factores para el usuario actual
        /// </summary>
        /// <returns>Respuesta de deshabilitación 2FA</returns>
        [HttpPost("disable-2fa")]
        [Authorize]
        public async Task<ActionResult<AuthResponseDto>> DisableTwoFactor()
        {
            var userId = GetCurrentUserId();
            var result = await _authService.DisableTwoFactorAsync(userId);

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
        /// Obtiene el email del usuario actual desde el token JWT
        /// </summary>
        /// <returns>Email del usuario actual</returns>
        private string GetCurrentUserEmail()
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;

            if (string.IsNullOrEmpty(email))
            {
                throw new UnauthorizedAccessException("No se pudo obtener el email del usuario");
            }

            return email;
        }

        #endregion
    }
}


