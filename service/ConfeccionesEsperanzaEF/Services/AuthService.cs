using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ConfeccionesEsperanzaEF.Models.DTOs.Auth;
using ConfeccionesEsperanzaEF.Models.DTOs.User;
using ConfeccionesEsperanzaEF.Models.DTOs.Role;

namespace ConfeccionesEsperanzaEF.Services
{
    public interface IAuthService
    {
        Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto);
        Task<AuthResponseDto> LoginAsync(LoginDto loginDto);
        Task<AuthResponseDto> LogoutAsync(string userId);
        Task<AuthResponseDto> ChangePasswordAsync(string userId, ChangePasswordDto changePasswordDto);
        Task<AuthResponseDto> UpdateProfileAsync(string userId, UpdateProfileDto updateProfileDto);
        Task<UserInfoDto?> GetUserInfoAsync(string userId);
        Task<UserListDto> GetUsersAsync(int pageNumber = 1, int pageSize = 10);
        Task<AuthResponseDto> ConfirmEmailAsync(ConfirmEmailDto confirmEmailDto);
        Task<AuthResponseDto> CreateRoleAsync(CreateRoleDto createRoleDto);
        Task<AuthResponseDto> AssignRoleAsync(AssignRoleDto assignRoleDto);
        Task<AuthResponseDto> RemoveRoleAsync(AssignRoleDto removeRoleDto);
        Task<List<RoleInfoDto>> GetRolesAsync();
        Task<AuthResponseDto> AddUserClaimAsync(AddUserClaimDto addUserClaimDto);
        Task<AuthResponseDto> RemoveUserClaimAsync(AddUserClaimDto removeUserClaimDto);
        Task<AuthResponseDto> LockUserAsync(string userId, DateTimeOffset? lockoutEnd = null);
        Task<AuthResponseDto> UnlockUserAsync(string userId);
        Task<AuthResponseDto> EnableTwoFactorAsync(string userId);
        Task<AuthResponseDto> DisableTwoFactorAsync(string userId);
    }

    public class AuthService : IAuthService
    {
        private readonly UserManager<IdentityUser> _userManager;
        private readonly SignInManager<IdentityUser> _signInManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthService> _logger;

        public AuthService(
            UserManager<IdentityUser> userManager,
            SignInManager<IdentityUser> signInManager,
            RoleManager<IdentityRole> roleManager,
            IConfiguration configuration,
            ILogger<AuthService> logger)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _roleManager = roleManager;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto)
        {
            try
            {
                var existingUser = await _userManager.FindByEmailAsync(registerDto.Email);
                if (existingUser != null)
                {
                    return new AuthResponseDto
                    {
                        IsSuccess = false,
                        Message = "El usuario con este email ya existe"
                    };
                }

                var user = new IdentityUser
                {
                    UserName = registerDto.UserName,
                    Email = registerDto.Email,
                    PhoneNumber = registerDto.PhoneNumber,
                    EmailConfirmed = false
                };

                var result = await _userManager.CreateAsync(user, registerDto.Password);

                if (result.Succeeded)
                {
                    _logger.LogInformation($"Usuario creado exitosamente: {user.Email}");

                    var userInfo = await GetUserInfoDtoAsync(user);

                    return new AuthResponseDto
                    {
                        IsSuccess = true,
                        Message = "Usuario registrado exitosamente",
                        User = userInfo
                    };
                }

                var errors = string.Join("; ", result.Errors.Select(e => e.Description));
                return new AuthResponseDto
                {
                    IsSuccess = false,
                    Message = $"Error al registrar usuario: {errors}"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error en RegisterAsync");
                return new AuthResponseDto
                {
                    IsSuccess = false,
                    Message = "Error interno del servidor"
                };
            }
        }

        public async Task<AuthResponseDto> LoginAsync(LoginDto loginDto)
        {
            try
            {
                var user = await _userManager.FindByEmailAsync(loginDto.Email);
                if (user == null)
                {
                    return new AuthResponseDto
                    {
                        IsSuccess = false,
                        Message = "Credenciales inválidas"
                    };
                }

                var result = await _signInManager.PasswordSignInAsync(user, loginDto.Password, loginDto.RememberMe, lockoutOnFailure: true);

                if (result.Succeeded)
                {
                    var token = await GenerateJwtTokenAsync(user);
                    var userInfo = await GetUserInfoDtoAsync(user);

                    _logger.LogInformation($"Usuario logueado exitosamente: {user.Email}");

                    return new AuthResponseDto
                    {
                        IsSuccess = true,
                        Message = "Login exitoso",
                        Token = token,
                        TokenExpiration = DateTime.UtcNow.AddMinutes(Convert.ToDouble(_configuration["Jwt:ExpireMinutes"])),
                        User = userInfo
                    };
                }

                if (result.IsLockedOut)
                {
                    return new AuthResponseDto
                    {
                        IsSuccess = false,
                        Message = "Cuenta bloqueada temporalmente"
                    };
                }

                if (result.RequiresTwoFactor)
                {
                    return new AuthResponseDto
                    {
                        IsSuccess = false,
                        Message = "Se requiere autenticación de dos factores"
                    };
                }

                return new AuthResponseDto
                {
                    IsSuccess = false,
                    Message = "Credenciales inválidas"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error en LoginAsync");
                return new AuthResponseDto
                {
                    IsSuccess = false,
                    Message = "Error interno del servidor"
                };
            }
        }

        public async Task<AuthResponseDto> LogoutAsync(string userId)
        {
            try
            {
                await _signInManager.SignOutAsync();
                _logger.LogInformation($"Usuario deslogueado: {userId}");

                return new AuthResponseDto
                {
                    IsSuccess = true,
                    Message = "Logout exitoso"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error en LogoutAsync");
                return new AuthResponseDto
                {
                    IsSuccess = false,
                    Message = "Error interno del servidor"
                };
            }
        }

        public async Task<AuthResponseDto> ChangePasswordAsync(string userId, ChangePasswordDto changePasswordDto)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    return new AuthResponseDto
                    {
                        IsSuccess = false,
                        Message = "Usuario no encontrado"
                    };
                }

                var result = await _userManager.ChangePasswordAsync(user, changePasswordDto.CurrentPassword, changePasswordDto.NewPassword);

                if (result.Succeeded)
                {
                    _logger.LogInformation($"Contraseña cambiada exitosamente para usuario: {user.Email}");
                    return new AuthResponseDto
                    {
                        IsSuccess = true,
                        Message = "Contraseña cambiada exitosamente"
                    };
                }

                var errors = string.Join("; ", result.Errors.Select(e => e.Description));
                return new AuthResponseDto
                {
                    IsSuccess = false,
                    Message = $"Error al cambiar contraseña: {errors}"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error en ChangePasswordAsync");
                return new AuthResponseDto
                {
                    IsSuccess = false,
                    Message = "Error interno del servidor"
                };
            }
        }

        public async Task<AuthResponseDto> UpdateProfileAsync(string userId, UpdateProfileDto updateProfileDto)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    return new AuthResponseDto
                    {
                        IsSuccess = false,
                        Message = "Usuario no encontrado"
                    };
                }

                user.UserName = updateProfileDto.UserName;
                user.Email = updateProfileDto.Email;
                user.PhoneNumber = updateProfileDto.PhoneNumber;

                var result = await _userManager.UpdateAsync(user);

                if (result.Succeeded)
                {
                    var userInfo = await GetUserInfoDtoAsync(user);
                    _logger.LogInformation($"Perfil actualizado exitosamente para usuario: {user.Email}");

                    return new AuthResponseDto
                    {
                        IsSuccess = true,
                        Message = "Perfil actualizado exitosamente",
                        User = userInfo
                    };
                }

                var errors = string.Join("; ", result.Errors.Select(e => e.Description));
                return new AuthResponseDto
                {
                    IsSuccess = false,
                    Message = $"Error al actualizar perfil: {errors}"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error en UpdateProfileAsync");
                return new AuthResponseDto
                {
                    IsSuccess = false,
                    Message = "Error interno del servidor"
                };
            }
        }

        public async Task<UserInfoDto?> GetUserInfoAsync(string userId)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null) return null;

                return await GetUserInfoDtoAsync(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error en GetUserInfoAsync");
                return null;
            }
        }

        public async Task<UserListDto> GetUsersAsync(int pageNumber = 1, int pageSize = 10)
        {
            try
            {
                var totalUsers = _userManager.Users.Count();
                var users = _userManager.Users
                    .OrderBy(u => u.UserName)
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToList();

                var userInfoList = new List<UserInfoDto>();
                foreach (var user in users)
                {
                    var userInfo = await GetUserInfoDtoAsync(user);
                    userInfoList.Add(userInfo);
                }

                return new UserListDto
                {
                    Users = userInfoList,
                    TotalCount = totalUsers,
                    PageNumber = pageNumber,
                    PageSize = pageSize
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error en GetUsersAsync");
                return new UserListDto();
            }
        }

        public async Task<AuthResponseDto> ConfirmEmailAsync(ConfirmEmailDto confirmEmailDto)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(confirmEmailDto.UserId);
                if (user == null)
                {
                    return new AuthResponseDto
                    {
                        IsSuccess = false,
                        Message = "Usuario no encontrado"
                    };
                }

                var result = await _userManager.ConfirmEmailAsync(user, confirmEmailDto.Token);

                if (result.Succeeded)
                {
                    return new AuthResponseDto
                    {
                        IsSuccess = true,
                        Message = "Email confirmado exitosamente"
                    };
                }

                return new AuthResponseDto
                {
                    IsSuccess = false,
                    Message = "Error al confirmar email"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error en ConfirmEmailAsync");
                return new AuthResponseDto
                {
                    IsSuccess = false,
                    Message = "Error interno del servidor"
                };
            }
        }

        public async Task<AuthResponseDto> CreateRoleAsync(CreateRoleDto createRoleDto)
        {
            try
            {
                if (await _roleManager.RoleExistsAsync(createRoleDto.Name))
                {
                    return new AuthResponseDto
                    {
                        IsSuccess = false,
                        Message = "El rol ya existe"
                    };
                }

                var role = new IdentityRole(createRoleDto.Name);
                var result = await _roleManager.CreateAsync(role);

                if (result.Succeeded)
                {
                    return new AuthResponseDto
                    {
                        IsSuccess = true,
                        Message = "Rol creado exitosamente"
                    };
                }

                var errors = string.Join("; ", result.Errors.Select(e => e.Description));
                return new AuthResponseDto
                {
                    IsSuccess = false,
                    Message = $"Error al crear rol: {errors}"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error en CreateRoleAsync");
                return new AuthResponseDto
                {
                    IsSuccess = false,
                    Message = "Error interno del servidor"
                };
            }
        }

        public async Task<AuthResponseDto> AssignRoleAsync(AssignRoleDto assignRoleDto)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(assignRoleDto.UserId);
                if (user == null)
                {
                    return new AuthResponseDto
                    {
                        IsSuccess = false,
                        Message = "Usuario no encontrado"
                    };
                }

                if (!await _roleManager.RoleExistsAsync(assignRoleDto.RoleName))
                {
                    return new AuthResponseDto
                    {
                        IsSuccess = false,
                        Message = "El rol no existe"
                    };
                }

                if (await _userManager.IsInRoleAsync(user, assignRoleDto.RoleName))
                {
                    return new AuthResponseDto
                    {
                        IsSuccess = false,
                        Message = "El usuario ya tiene este rol"
                    };
                }

                var result = await _userManager.AddToRoleAsync(user, assignRoleDto.RoleName);

                if (result.Succeeded)
                {
                    return new AuthResponseDto
                    {
                        IsSuccess = true,
                        Message = "Rol asignado exitosamente"
                    };
                }

                var errors = string.Join("; ", result.Errors.Select(e => e.Description));
                return new AuthResponseDto
                {
                    IsSuccess = false,
                    Message = $"Error al asignar rol: {errors}"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error en AssignRoleAsync");
                return new AuthResponseDto
                {
                    IsSuccess = false,
                    Message = "Error interno del servidor"
                };
            }
        }

        public async Task<AuthResponseDto> RemoveRoleAsync(AssignRoleDto removeRoleDto)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(removeRoleDto.UserId);
                if (user == null)
                {
                    return new AuthResponseDto
                    {
                        IsSuccess = false,
                        Message = "Usuario no encontrado"
                    };
                }

                if (!await _userManager.IsInRoleAsync(user, removeRoleDto.RoleName))
                {
                    return new AuthResponseDto
                    {
                        IsSuccess = false,
                        Message = "El usuario no tiene este rol"
                    };
                }

                var result = await _userManager.RemoveFromRoleAsync(user, removeRoleDto.RoleName);

                if (result.Succeeded)
                {
                    return new AuthResponseDto
                    {
                        IsSuccess = true,
                        Message = "Rol removido exitosamente"
                    };
                }

                var errors = string.Join("; ", result.Errors.Select(e => e.Description));
                return new AuthResponseDto
                {
                    IsSuccess = false,
                    Message = $"Error al remover rol: {errors}"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error en RemoveRoleAsync");
                return new AuthResponseDto
                {
                    IsSuccess = false,
                    Message = "Error interno del servidor"
                };
            }
        }

        public async Task<List<RoleInfoDto>> GetRolesAsync()
        {
            try
            {
                var roles = _roleManager.Roles.ToList();
                return roles.Select(r => new RoleInfoDto
                {
                    Id = r.Id,
                    Name = r.Name ?? string.Empty,
                    NormalizedName = r.NormalizedName ?? string.Empty,
                    ConcurrencyStamp = r.ConcurrencyStamp
                }).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error en GetRolesAsync");
                return new List<RoleInfoDto>();
            }
        }

        public async Task<AuthResponseDto> AddUserClaimAsync(AddUserClaimDto addUserClaimDto)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(addUserClaimDto.UserId);
                if (user == null)
                {
                    return new AuthResponseDto
                    {
                        IsSuccess = false,
                        Message = "Usuario no encontrado"
                    };
                }

                var claim = new Claim(addUserClaimDto.ClaimType, addUserClaimDto.ClaimValue);
                var result = await _userManager.AddClaimAsync(user, claim);

                if (result.Succeeded)
                {
                    return new AuthResponseDto
                    {
                        IsSuccess = true,
                        Message = "Claim agregado exitosamente"
                    };
                }

                var errors = string.Join("; ", result.Errors.Select(e => e.Description));
                return new AuthResponseDto
                {
                    IsSuccess = false,
                    Message = $"Error al agregar claim: {errors}"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error en AddUserClaimAsync");
                return new AuthResponseDto
                {
                    IsSuccess = false,
                    Message = "Error interno del servidor"
                };
            }
        }

        public async Task<AuthResponseDto> RemoveUserClaimAsync(AddUserClaimDto removeUserClaimDto)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(removeUserClaimDto.UserId);
                if (user == null)
                {
                    return new AuthResponseDto
                    {
                        IsSuccess = false,
                        Message = "Usuario no encontrado"
                    };
                }

                var claim = new Claim(removeUserClaimDto.ClaimType, removeUserClaimDto.ClaimValue);
                var result = await _userManager.RemoveClaimAsync(user, claim);

                if (result.Succeeded)
                {
                    return new AuthResponseDto
                    {
                        IsSuccess = true,
                        Message = "Claim removido exitosamente"
                    };
                }

                var errors = string.Join("; ", result.Errors.Select(e => e.Description));
                return new AuthResponseDto
                {
                    IsSuccess = false,
                    Message = $"Error al remover claim: {errors}"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error en RemoveUserClaimAsync");
                return new AuthResponseDto
                {
                    IsSuccess = false,
                    Message = "Error interno del servidor"
                };
            }
        }

        public async Task<AuthResponseDto> LockUserAsync(string userId, DateTimeOffset? lockoutEnd = null)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    return new AuthResponseDto
                    {
                        IsSuccess = false,
                        Message = "Usuario no encontrado"
                    };
                }

                lockoutEnd ??= DateTimeOffset.UtcNow.AddMinutes(30);
                var result = await _userManager.SetLockoutEndDateAsync(user, lockoutEnd);

                if (result.Succeeded)
                {
                    return new AuthResponseDto
                    {
                        IsSuccess = true,
                        Message = "Usuario bloqueado exitosamente"
                    };
                }

                var errors = string.Join("; ", result.Errors.Select(e => e.Description));
                return new AuthResponseDto
                {
                    IsSuccess = false,
                    Message = $"Error al bloquear usuario: {errors}"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error en LockUserAsync");
                return new AuthResponseDto
                {
                    IsSuccess = false,
                    Message = "Error interno del servidor"
                };
            }
        }

        public async Task<AuthResponseDto> UnlockUserAsync(string userId)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    return new AuthResponseDto
                    {
                        IsSuccess = false,
                        Message = "Usuario no encontrado"
                    };
                }

                var result = await _userManager.SetLockoutEndDateAsync(user, null);

                if (result.Succeeded)
                {
                    await _userManager.ResetAccessFailedCountAsync(user);

                    return new AuthResponseDto
                    {
                        IsSuccess = true,
                        Message = "Usuario desbloqueado exitosamente"
                    };
                }

                var errors = string.Join("; ", result.Errors.Select(e => e.Description));
                return new AuthResponseDto
                {
                    IsSuccess = false,
                    Message = $"Error al desbloquear usuario: {errors}"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error en UnlockUserAsync");
                return new AuthResponseDto
                {
                    IsSuccess = false,
                    Message = "Error interno del servidor"
                };
            }
        }

        public async Task<AuthResponseDto> EnableTwoFactorAsync(string userId)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    return new AuthResponseDto
                    {
                        IsSuccess = false,
                        Message = "Usuario no encontrado"
                    };
                }

                var result = await _userManager.SetTwoFactorEnabledAsync(user, true);

                if (result.Succeeded)
                {
                    return new AuthResponseDto
                    {
                        IsSuccess = true,
                        Message = "Autenticación de dos factores habilitada"
                    };
                }

                var errors = string.Join("; ", result.Errors.Select(e => e.Description));
                return new AuthResponseDto
                {
                    IsSuccess = false,
                    Message = $"Error al habilitar 2FA: {errors}"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error en EnableTwoFactorAsync");
                return new AuthResponseDto
                {
                    IsSuccess = false,
                    Message = "Error interno del servidor"
                };
            }
        }

        public async Task<AuthResponseDto> DisableTwoFactorAsync(string userId)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    return new AuthResponseDto
                    {
                        IsSuccess = false,
                        Message = "Usuario no encontrado"
                    };
                }

                var result = await _userManager.SetTwoFactorEnabledAsync(user, false);

                if (result.Succeeded)
                {
                    return new AuthResponseDto
                    {
                        IsSuccess = true,
                        Message = "Autenticación de dos factores deshabilitada"
                    };
                }

                var errors = string.Join("; ", result.Errors.Select(e => e.Description));
                return new AuthResponseDto
                {
                    IsSuccess = false,
                    Message = $"Error al deshabilitar 2FA: {errors}"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error en DisableTwoFactorAsync");
                return new AuthResponseDto
                {
                    IsSuccess = false,
                    Message = "Error interno del servidor"
                };
            }
        }

        #region Private Methods

        private async Task<string> GenerateJwtTokenAsync(IdentityUser user)
        {
            var jwtSettings = _configuration.GetSection("Jwt");
            var key = Encoding.ASCII.GetBytes(jwtSettings["Key"]!);

            var claims = new List<Claim>
            {
                new(JwtRegisteredClaimNames.Sub, user.Id),
                new(JwtRegisteredClaimNames.Email, user.Email!),
                new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new(ClaimTypes.NameIdentifier, user.Id),
                new(ClaimTypes.Name, user.UserName!),
                new(ClaimTypes.Email, user.Email!)
            };

            var roles = await _userManager.GetRolesAsync(user);
            claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

            var userClaims = await _userManager.GetClaimsAsync(user);
            claims.AddRange(userClaims);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(Convert.ToDouble(jwtSettings["ExpireMinutes"])),
                Issuer = jwtSettings["Issuer"],
                Audience = jwtSettings["Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        private async Task<UserInfoDto> GetUserInfoDtoAsync(IdentityUser user)
        {
            var roles = await _userManager.GetRolesAsync(user);
            var claims = await _userManager.GetClaimsAsync(user);

            return new UserInfoDto
            {
                Id = user.Id,
                UserName = user.UserName ?? string.Empty,
                Email = user.Email ?? string.Empty,
                EmailConfirmed = user.EmailConfirmed,
                PhoneNumber = user.PhoneNumber,
                PhoneNumberConfirmed = user.PhoneNumberConfirmed,
                TwoFactorEnabled = user.TwoFactorEnabled,
                LockoutEnd = user.LockoutEnd,
                LockoutEnabled = user.LockoutEnabled,
                AccessFailedCount = user.AccessFailedCount,
                Roles = roles.ToList(),
                Claims = claims.Select(c => new UserClaimDto
                {
                    Type = c.Type,
                    Value = c.Value
                }).ToList()
            };
        }

        #endregion
    }
}
