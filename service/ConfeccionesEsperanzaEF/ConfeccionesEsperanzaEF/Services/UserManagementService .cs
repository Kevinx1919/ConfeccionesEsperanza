using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ConfeccionesEsperanzaEF.Models.DTOs.User;
using ConfeccionesEsperanzaEF.Models.DTOs.Auth;

namespace ConfeccionesEsperanzaEF.Services
{
    public interface IUserManagementService
    {
        Task<UserResponseDto> CreateUserAsync(CreateUserDto createUserDto);
        Task<UserResponseDto> UpdateUserAsync(string userId, UpdateUserDto updateUserDto);
        Task<UserResponseDto> DeleteUserAsync(string userId);
        Task<UserInfoDto?> GetUserByIdAsync(string userId);
        Task<UserListDto> GetUsersAsync(UserFilterDto? filter = null);
        Task<UserInfoDto?> GetUserByEmailAsync(string email);
        Task<UserResponseDto> SetUserPasswordAsync(string userId, SetPasswordDto setPasswordDto);
        Task<UserResponseDto> ToggleUserLockAsync(string userId, bool lockUser, int lockoutMinutes = 30);
        Task<UserResponseDto> ConfirmUserEmailAsync(string userId, bool confirmed = true);
        Task<UserResponseDto> ToggleTwoFactorAsync(string userId, bool enabled);
        Task<List<string>> GetUserRolesAsync(string userId);
        Task<UserResponseDto> UpdateUserRolesAsync(string userId, List<string> newRoles);
    }

    public class UserManagementService : IUserManagementService
    {
        private readonly UserManager<IdentityUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly ILogger<UserManagementService> _logger;

        public UserManagementService(
            UserManager<IdentityUser> userManager,
            RoleManager<IdentityRole> roleManager,
            ILogger<UserManagementService> logger)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _logger = logger;
        }

        public async Task<UserResponseDto> CreateUserAsync(CreateUserDto createUserDto)
        {
            try
            {
                // Validar que no existe un usuario con el mismo email
                var existingUser = await _userManager.FindByEmailAsync(createUserDto.Email);
                if (existingUser != null)
                {
                    return new UserResponseDto
                    {
                        IsSuccess = false,
                        Message = "Ya existe un usuario con este email"
                    };
                }

                // Validar que no existe un usuario con el mismo nombre
                var existingUserName = await _userManager.FindByNameAsync(createUserDto.UserName);
                if (existingUserName != null)
                {
                    return new UserResponseDto
                    {
                        IsSuccess = false,
                        Message = "Ya existe un usuario con este nombre de usuario"
                    };
                }

                // Validar que todos los roles existen
                foreach (var roleName in createUserDto.Roles)
                {
                    if (!await _roleManager.RoleExistsAsync(roleName))
                    {
                        return new UserResponseDto
                        {
                            IsSuccess = false,
                            Message = $"El rol '{roleName}' no existe"
                        };
                    }
                }

                var user = new IdentityUser
                {
                    UserName = createUserDto.UserName,
                    Email = createUserDto.Email,
                    PhoneNumber = createUserDto.PhoneNumber,
                    EmailConfirmed = true // Por defecto confirmamos el email cuando un admin crea el usuario
                };

                var result = await _userManager.CreateAsync(user, createUserDto.Password);

                if (result.Succeeded)
                {
                    // Asignar roles
                    if (createUserDto.Roles.Any())
                    {
                        await _userManager.AddToRolesAsync(user, createUserDto.Roles);
                    }

                    var userInfo = await GetUserInfoDtoAsync(user);

                    _logger.LogInformation($"Usuario creado por admin: {user.Email} con ID {user.Id}");

                    return new UserResponseDto
                    {
                        IsSuccess = true,
                        Message = "Usuario creado exitosamente",
                        User = userInfo
                    };
                }

                var errors = string.Join("; ", result.Errors.Select(e => e.Description));
                return new UserResponseDto
                {
                    IsSuccess = false,
                    Message = $"Error al crear usuario: {errors}"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear usuario");
                return new UserResponseDto
                {
                    IsSuccess = false,
                    Message = "Error interno del servidor"
                };
            }
        }

        public async Task<UserResponseDto> UpdateUserAsync(string userId, UpdateUserDto updateUserDto)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    return new UserResponseDto
                    {
                        IsSuccess = false,
                        Message = "Usuario no encontrado"
                    };
                }

                // Validar email único (excluyendo el usuario actual)
                var existingEmail = await _userManager.Users
                    .AnyAsync(u => u.Email!.ToLower() == updateUserDto.Email.ToLower() && u.Id != userId);

                if (existingEmail)
                {
                    return new UserResponseDto
                    {
                        IsSuccess = false,
                        Message = "Ya existe otro usuario con este email"
                    };
                }

                // Validar username único (excluyendo el usuario actual)
                var existingUserName = await _userManager.Users
                    .AnyAsync(u => u.UserName!.ToLower() == updateUserDto.UserName.ToLower() && u.Id != userId);

                if (existingUserName)
                {
                    return new UserResponseDto
                    {
                        IsSuccess = false,
                        Message = "Ya existe otro usuario con este nombre de usuario"
                    };
                }

                // Validar roles
                foreach (var roleName in updateUserDto.Roles)
                {
                    if (!await _roleManager.RoleExistsAsync(roleName))
                    {
                        return new UserResponseDto
                        {
                            IsSuccess = false,
                            Message = $"El rol '{roleName}' no existe"
                        };
                    }
                }

                // Actualizar propiedades básicas
                user.Email = updateUserDto.Email;
                user.UserName = updateUserDto.UserName;
                user.PhoneNumber = updateUserDto.PhoneNumber;
                user.EmailConfirmed = updateUserDto.EmailConfirmed;
                user.PhoneNumberConfirmed = updateUserDto.PhoneNumberConfirmed;
                user.TwoFactorEnabled = updateUserDto.TwoFactorEnabled;
                user.LockoutEnabled = updateUserDto.LockoutEnabled;

                var result = await _userManager.UpdateAsync(user);

                if (result.Succeeded)
                {
                    // Actualizar roles
                    await UpdateUserRolesAsync(userId, updateUserDto.Roles);

                    var userInfo = await GetUserInfoDtoAsync(user);

                    _logger.LogInformation($"Usuario actualizado: {user.Email} con ID {userId}");

                    return new UserResponseDto
                    {
                        IsSuccess = true,
                        Message = "Usuario actualizado exitosamente",
                        User = userInfo
                    };
                }

                var errors = string.Join("; ", result.Errors.Select(e => e.Description));
                return new UserResponseDto
                {
                    IsSuccess = false,
                    Message = $"Error al actualizar usuario: {errors}"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar usuario con ID {UserId}", userId);
                return new UserResponseDto
                {
                    IsSuccess = false,
                    Message = "Error interno del servidor"
                };
            }
        }

        public async Task<UserResponseDto> DeleteUserAsync(string userId)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    return new UserResponseDto
                    {
                        IsSuccess = false,
                        Message = "Usuario no encontrado"
                    };
                }

                // Verificar que no es el último administrador
                var isAdmin = await _userManager.IsInRoleAsync(user, "Admin");
                if (isAdmin)
                {
                    var adminUsers = await _userManager.GetUsersInRoleAsync("Admin");
                    if (adminUsers.Count <= 1)
                    {
                        return new UserResponseDto
                        {
                            IsSuccess = false,
                            Message = "No se puede eliminar el último administrador del sistema"
                        };
                    }
                }

                var result = await _userManager.DeleteAsync(user);

                if (result.Succeeded)
                {
                    _logger.LogInformation($"Usuario eliminado: {user.Email} con ID {userId}");

                    return new UserResponseDto
                    {
                        IsSuccess = true,
                        Message = "Usuario eliminado exitosamente"
                    };
                }

                var errors = string.Join("; ", result.Errors.Select(e => e.Description));
                return new UserResponseDto
                {
                    IsSuccess = false,
                    Message = $"Error al eliminar usuario: {errors}"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar usuario con ID {UserId}", userId);
                return new UserResponseDto
                {
                    IsSuccess = false,
                    Message = "Error interno del servidor"
                };
            }
        }

        public async Task<UserInfoDto?> GetUserByIdAsync(string userId)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null) return null;

                return await GetUserInfoDtoAsync(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener usuario con ID {UserId}", userId);
                return null;
            }
        }

        public async Task<UserListDto> GetUsersAsync(UserFilterDto? filter = null)
        {
            try
            {
                filter ??= new UserFilterDto();

                var query = _userManager.Users.AsQueryable();

                // Aplicar filtros
                if (!string.IsNullOrEmpty(filter.Email))
                {
                    query = query.Where(u => u.Email!.Contains(filter.Email));
                }

                if (!string.IsNullOrEmpty(filter.UserName))
                {
                    query = query.Where(u => u.UserName!.Contains(filter.UserName));
                }

                if (filter.EmailConfirmed.HasValue)
                {
                    query = query.Where(u => u.EmailConfirmed == filter.EmailConfirmed.Value);
                }

                if (filter.IsLocked.HasValue)
                {
                    if (filter.IsLocked.Value)
                    {
                        query = query.Where(u => u.LockoutEnd != null && u.LockoutEnd > DateTimeOffset.UtcNow);
                    }
                    else
                    {
                        query = query.Where(u => u.LockoutEnd == null || u.LockoutEnd <= DateTimeOffset.UtcNow);
                    }
                }

                if (filter.TwoFactorEnabled.HasValue)
                {
                    query = query.Where(u => u.TwoFactorEnabled == filter.TwoFactorEnabled.Value);
                }

                var totalCount = await query.CountAsync();

                var users = await query
                    .OrderBy(u => u.UserName)
                    .Skip((filter.PageNumber - 1) * filter.PageSize)
                    .Take(filter.PageSize)
                    .ToListAsync();

                var userInfoList = new List<UserInfoDto>();

                foreach (var user in users)
                {
                    var userInfo = await GetUserInfoDtoAsync(user);

                    // Filtrar por rol si se especifica
                    if (!string.IsNullOrEmpty(filter.Role))
                    {
                        if (userInfo.Roles.Contains(filter.Role, StringComparer.OrdinalIgnoreCase))
                        {
                            userInfoList.Add(userInfo);
                        }
                    }
                    else
                    {
                        userInfoList.Add(userInfo);
                    }
                }

                return new UserListDto
                {
                    Users = userInfoList,
                    TotalCount = totalCount,
                    PageNumber = filter.PageNumber,
                    PageSize = filter.PageSize
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener lista de usuarios");
                return new UserListDto();
            }
        }

        public async Task<UserInfoDto?> GetUserByEmailAsync(string email)
        {
            try
            {
                var user = await _userManager.FindByEmailAsync(email);
                if (user == null) return null;

                return await GetUserInfoDtoAsync(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener usuario por email {Email}", email);
                return null;
            }
        }

        public async Task<UserResponseDto> SetUserPasswordAsync(string userId, SetPasswordDto setPasswordDto)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    return new UserResponseDto
                    {
                        IsSuccess = false,
                        Message = "Usuario no encontrado"
                    };
                }

                // Remover la contraseña actual
                await _userManager.RemovePasswordAsync(user);

                // Establecer la nueva contraseña
                var result = await _userManager.AddPasswordAsync(user, setPasswordDto.NewPassword);

                if (result.Succeeded)
                {
                    _logger.LogInformation($"Contraseña establecida para usuario: {user.Email}");

                    return new UserResponseDto
                    {
                        IsSuccess = true,
                        Message = "Contraseña establecida exitosamente"
                    };
                }

                var errors = string.Join("; ", result.Errors.Select(e => e.Description));
                return new UserResponseDto
                {
                    IsSuccess = false,
                    Message = $"Error al establecer contraseña: {errors}"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al establecer contraseña para usuario {UserId}", userId);
                return new UserResponseDto
                {
                    IsSuccess = false,
                    Message = "Error interno del servidor"
                };
            }
        }

        public async Task<UserResponseDto> ToggleUserLockAsync(string userId, bool lockUser, int lockoutMinutes = 30)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    return new UserResponseDto
                    {
                        IsSuccess = false,
                        Message = "Usuario no encontrado"
                    };
                }

                DateTimeOffset? lockoutEnd = null;
                if (lockUser)
                {
                    lockoutEnd = DateTimeOffset.UtcNow.AddMinutes(lockoutMinutes);
                }

                var result = await _userManager.SetLockoutEndDateAsync(user, lockoutEnd);

                if (result.Succeeded)
                {
                    if (!lockUser)
                    {
                        // También resetear el contador de intentos fallidos
                        await _userManager.ResetAccessFailedCountAsync(user);
                    }

                    var action = lockUser ? "bloqueado" : "desbloqueado";
                    _logger.LogInformation($"Usuario {action}: {user.Email}");

                    return new UserResponseDto
                    {
                        IsSuccess = true,
                        Message = $"Usuario {action} exitosamente"
                    };
                }

                var errors = string.Join("; ", result.Errors.Select(e => e.Description));
                return new UserResponseDto
                {
                    IsSuccess = false,
                    Message = $"Error al modificar bloqueo de usuario: {errors}"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al modificar bloqueo de usuario {UserId}", userId);
                return new UserResponseDto
                {
                    IsSuccess = false,
                    Message = "Error interno del servidor"
                };
            }
        }

        public async Task<UserResponseDto> ConfirmUserEmailAsync(string userId, bool confirmed = true)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    return new UserResponseDto
                    {
                        IsSuccess = false,
                        Message = "Usuario no encontrado"
                    };
                }

                if (confirmed && !user.EmailConfirmed)
                {
                    var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
                    await _userManager.ConfirmEmailAsync(user, token);
                }
                else if (!confirmed && user.EmailConfirmed)
                {
                    user.EmailConfirmed = false;
                    await _userManager.UpdateAsync(user);
                }

                var status = confirmed ? "confirmado" : "desconfirmado";
                _logger.LogInformation($"Email {status} para usuario: {user.Email}");

                return new UserResponseDto
                {
                    IsSuccess = true,
                    Message = $"Email {status} exitosamente"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al confirmar email de usuario {UserId}", userId);
                return new UserResponseDto
                {
                    IsSuccess = false,
                    Message = "Error interno del servidor"
                };
            }
        }

        public async Task<UserResponseDto> ToggleTwoFactorAsync(string userId, bool enabled)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    return new UserResponseDto
                    {
                        IsSuccess = false,
                        Message = "Usuario no encontrado"
                    };
                }

                var result = await _userManager.SetTwoFactorEnabledAsync(user, enabled);

                if (result.Succeeded)
                {
                    var status = enabled ? "habilitada" : "deshabilitada";
                    _logger.LogInformation($"Autenticación 2FA {status} para usuario: {user.Email}");

                    return new UserResponseDto
                    {
                        IsSuccess = true,
                        Message = $"Autenticación de dos factores {status} exitosamente"
                    };
                }

                var errors = string.Join("; ", result.Errors.Select(e => e.Description));
                return new UserResponseDto
                {
                    IsSuccess = false,
                    Message = $"Error al modificar 2FA: {errors}"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al modificar 2FA de usuario {UserId}", userId);
                return new UserResponseDto
                {
                    IsSuccess = false,
                    Message = "Error interno del servidor"
                };
            }
        }

        public async Task<List<string>> GetUserRolesAsync(string userId)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null) return new List<string>();

                var roles = await _userManager.GetRolesAsync(user);
                return roles.ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener roles de usuario {UserId}", userId);
                return new List<string>();
            }
        }

        public async Task<UserResponseDto> UpdateUserRolesAsync(string userId, List<string> newRoles)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    return new UserResponseDto
                    {
                        IsSuccess = false,
                        Message = "Usuario no encontrado"
                    };
                }

                // Obtener roles actuales
                var currentRoles = await _userManager.GetRolesAsync(user);

                // Remover roles actuales
                if (currentRoles.Any())
                {
                    await _userManager.RemoveFromRolesAsync(user, currentRoles);
                }

                // Agregar nuevos roles
                if (newRoles.Any())
                {
                    await _userManager.AddToRolesAsync(user, newRoles);
                }

                _logger.LogInformation($"Roles actualizados para usuario: {user.Email}");

                return new UserResponseDto
                {
                    IsSuccess = true,
                    Message = "Roles actualizados exitosamente"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar roles de usuario {UserId}", userId);
                return new UserResponseDto
                {
                    IsSuccess = false,
                    Message = "Error interno del servidor"
                };
            }
        }

        #region Private Helper Methods

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
