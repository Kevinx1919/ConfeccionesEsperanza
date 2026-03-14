using ConfeccionesEsperanzaEF.Data;
using ConfeccionesEsperanzaEF.Models.Common;
using ConfeccionesEsperanzaEF.Models.DTOs.Production;
using ConfeccionesEsperanzaEF.Models.Production;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel;

namespace ConfeccionesEsperanzaEF.Services
{
    public interface ITaskService
    {
        // CRUD de Tareas
        Task<TaskResponseDto> CreateTareaAsync(CreateTareaDto createTareaDto);
        Task<TaskResponseDto> UpdateTareaAsync(int id, UpdateTareaDto updateTareaDto);
        Task<TaskResponseDto> DeleteTareaAsync(int id);
        Task<TareaInfoDto?> GetTareaByIdAsync(int id);
        Task<TareaListDto> GetTareasAsync(/*int pageNumber = 1, int pageSize = 10,*/ string? searchTerm = null);

        // CRUD de Asignaciones
        Task<TaskResponseDto> CreateAsignacionAsync(CreateUsuarioProductoTareaDto createAsignacionDto);
        Task<TaskResponseDto> UpdateAsignacionAsync(int id, UpdateUsuarioProductoTareaDto updateAsignacionDto);
        Task<TaskResponseDto> DeleteAsignacionAsync(int id);
        Task<UsuarioProductoTareaInfoDto?> GetAsignacionByIdAsync(int id);
        Task<UsuarioProductoTareaListDto> GetAsignacionesAsync(AsignacionFilterDto? filter = null);

        // Operaciones específicas de asignaciones
        Task<UsuarioProductoTareaListDto> GetAsignacionesByUsuarioAsync(string usuarioId/*, int pageNumber = 1, int pageSize = 10*/);
        Task<TaskResponseDto> CambiarEstadoAsignacionAsync(int id, EstadoTarea nuevoEstado);
        Task<TaskResponseDto> IniciarTareaAsync(int id);
        Task<TaskResponseDto> CompletarTareaAsync(int id);
        Task<TaskResponseDto> PausarTareaAsync(int id);

        // Asignaciones masivas
        Task<TaskResponseDto> AsignarTareasMasivasAsync(AsignarTareasMasivasDto asignacionMasiva);

        // Reportes y estadísticas
        Task<Dictionary<EstadoTarea, int>> GetEstadisticasEstadosAsync();
        Task<List<UsuarioProductoTareaInfoDto>> GetTareasVencidasAsync();
        Task<Dictionary<string, int>> GetProductividadPorUsuarioAsync(DateTime fechaInicio, DateTime fechaFin);
    }

    public class TaskService : ITaskService
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<IdentityUser> _userManager;
        private readonly ILogger<TaskService> _logger;

        public TaskService(
            ApplicationDbContext context,
            UserManager<IdentityUser> userManager,
            ILogger<TaskService> logger)
        {
            _context = context;
            _userManager = userManager;
            _logger = logger;
        }

        #region CRUD de Tareas

        public async Task<TaskResponseDto> CreateTareaAsync(CreateTareaDto createTareaDto)
        {
            try
            {
                var tarea = new Tarea
                {
                    NombreTarea = createTareaDto.NombreTarea.Trim(),
                    Descripcion = createTareaDto.Descripcion?.Trim(),
                    Comentarios = createTareaDto.Comentarios?.Trim()
                };

                _context.Tareas.Add(tarea);
                await _context.SaveChangesAsync();

                var tareaInfo = await GetTareaByIdAsync(tarea.IdTarea);

                _logger.LogInformation($"Tarea creada: {tarea.NombreTarea} con ID {tarea.IdTarea}");

                return new TaskResponseDto
                {
                    IsSuccess = true,
                    Message = "Tarea creada exitosamente",
                    Data = tareaInfo
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear tarea");
                return new TaskResponseDto
                {
                    IsSuccess = false,
                    Message = "Error interno del servidor"
                };
            }
        }

        public async Task<TaskResponseDto> UpdateTareaAsync(int id, UpdateTareaDto updateTareaDto)
        {
            try
            {
                var tarea = await _context.Tareas.FindAsync(id);
                if (tarea == null)
                {
                    return new TaskResponseDto
                    {
                        IsSuccess = false,
                        Message = "Tarea no encontrada"
                    };
                }

                tarea.NombreTarea = updateTareaDto.NombreTarea.Trim();
                tarea.Descripcion = updateTareaDto.Descripcion?.Trim();
                tarea.Comentarios = updateTareaDto.Comentarios?.Trim();

                await _context.SaveChangesAsync();

                var tareaInfo = await GetTareaByIdAsync(id);

                _logger.LogInformation($"Tarea actualizada: {tarea.NombreTarea} con ID {id}");

                return new TaskResponseDto
                {
                    IsSuccess = true,
                    Message = "Tarea actualizada exitosamente",
                    Data = tareaInfo
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar tarea con ID {Id}", id);
                return new TaskResponseDto
                {
                    IsSuccess = false,
                    Message = "Error interno del servidor"
                };
            }
        }

        public async Task<TaskResponseDto> DeleteTareaAsync(int id)
        {
            try
            {
                var tarea = await _context.Tareas.FindAsync(id);
                if (tarea == null)
                {
                    return new TaskResponseDto
                    {
                        IsSuccess = false,
                        Message = "Tarea no encontrada"
                    };
                }

                // Verificar si tiene asignaciones activas
                var tieneAsignaciones = await _context.UsuarioProductoTareas
                    .AnyAsync(upt => upt.Tarea_IdTarea == id && upt.Estado != EstadoTarea.Completada && upt.Estado != EstadoTarea.Cancelada);

                if (tieneAsignaciones)
                {
                    return new TaskResponseDto
                    {
                        IsSuccess = false,
                        Message = "No se puede eliminar la tarea porque tiene asignaciones activas"
                    };
                }

                _context.Tareas.Remove(tarea);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Tarea eliminada: {tarea.NombreTarea} con ID {id}");

                return new TaskResponseDto
                {
                    IsSuccess = true,
                    Message = "Tarea eliminada exitosamente"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar tarea con ID {Id}", id);
                return new TaskResponseDto
                {
                    IsSuccess = false,
                    Message = "Error interno del servidor"
                };
            }
        }

        public async Task<TareaInfoDto?> GetTareaByIdAsync(int id)
        {
            try
            {
                var tarea = await _context.Tareas
                    .Include(t => t.UsuarioProductoTareas)
                    .FirstOrDefaultAsync(t => t.IdTarea == id);

                if (tarea == null) return null;

                return new TareaInfoDto
                {
                    IdTarea = tarea.IdTarea,
                    NombreTarea = tarea.NombreTarea,
                    Descripcion = tarea.Descripcion,
                    Comentarios = tarea.Comentarios,
                    FechaCreacion = (DateTime)tarea.FechaCreacion,
                    FechaActualizacion = tarea.FechaActualizacion,
                    AsignacionesActivas = tarea.UsuarioProductoTareas.Count(upt => upt.Estado != EstadoTarea.Completada && upt.Estado != EstadoTarea.Cancelada),
                    AsignacionesCompletadas = tarea.UsuarioProductoTareas.Count(upt => upt.Estado == EstadoTarea.Completada)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener tarea con ID {Id}", id);
                return null;
            }
        }

        public async Task<TareaListDto> GetTareasAsync(/*int pageNumber = 1, int pageSize = 10, */string? searchTerm = null)
        {
            try
            {
                var query = _context.Tareas
                    .Include(t => t.UsuarioProductoTareas)
                    .AsQueryable();

                if (!string.IsNullOrEmpty(searchTerm))
                {
                    query = query.Where(t => t.NombreTarea.Contains(searchTerm) ||
                                           (t.Descripcion != null && t.Descripcion.Contains(searchTerm)));
                }

                var totalCount = await query.CountAsync();

                var tareas = await query
                    .OrderBy(t => t.NombreTarea)
                    //.Skip((pageNumber - 1) * pageSize)
                    //.Take(pageSize)
                    .Select(t => new TareaInfoDto
                    {
                        IdTarea = t.IdTarea,
                        NombreTarea = t.NombreTarea,
                        Descripcion = t.Descripcion,
                        Comentarios = t.Comentarios,
                        FechaCreacion = (DateTime)t.FechaCreacion,
                        FechaActualizacion = t.FechaActualizacion,
                        AsignacionesActivas = t.UsuarioProductoTareas.Count(upt => upt.Estado != EstadoTarea.Completada && upt.Estado != EstadoTarea.Cancelada),
                        AsignacionesCompletadas = t.UsuarioProductoTareas.Count(upt => upt.Estado == EstadoTarea.Completada)
                    })
                    .ToListAsync();

                return new TareaListDto
                {
                    Tareas = tareas,
                    TotalCount = totalCount,
                    //PageNumber = pageNumber,
                    //PageSize = pageSize
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener lista de tareas");
                return new TareaListDto();
            }
        }

        #endregion

        #region CRUD de Asignaciones

        public async Task<TaskResponseDto> CreateAsignacionAsync(CreateUsuarioProductoTareaDto createAsignacionDto)
        {
            try
            {
                // Validar que el usuario existe
                var usuario = await _userManager.FindByIdAsync(createAsignacionDto.Usuario_IdUsuario);
                if (usuario == null)
                {
                    return new TaskResponseDto
                    {
                        IsSuccess = false,
                        Message = "El usuario especificado no existe"
                    };
                }

                // Validar que el producto existe
                var producto = await _context.Productos.FindAsync(createAsignacionDto.Producto_IdProducto);
                if (producto == null)
                {
                    return new TaskResponseDto
                    {
                        IsSuccess = false,
                        Message = "El producto especificado no existe"
                    };
                }

                // Validar que la tarea existe
                var tarea = await _context.Tareas.FindAsync(createAsignacionDto.Tarea_IdTarea);
                if (tarea == null)
                {
                    return new TaskResponseDto
                    {
                        IsSuccess = false,
                        Message = "La tarea especificada no existe"
                    };
                }

                // Verificar que no existe ya una asignación activa para la misma combinación
                var asignacionExistente = await _context.UsuarioProductoTareas
                    .AnyAsync(upt => upt.Usuario_IdUsuario == createAsignacionDto.Usuario_IdUsuario &&
                                    upt.Producto_IdProducto == createAsignacionDto.Producto_IdProducto &&
                                    upt.Tarea_IdTarea == createAsignacionDto.Tarea_IdTarea &&
                                    upt.Estado != EstadoTarea.Completada &&
                                    upt.Estado != EstadoTarea.Cancelada);

                if (asignacionExistente)
                {
                    return new TaskResponseDto
                    {
                        IsSuccess = false,
                        Message = "Ya existe una asignación activa para esta combinación de usuario, producto y tarea"
                    };
                }

                var asignacion = new UsuarioProductoTarea
                {
                    Usuario_IdUsuario = createAsignacionDto.Usuario_IdUsuario,
                    Producto_IdProducto = createAsignacionDto.Producto_IdProducto,
                    Tarea_IdTarea = createAsignacionDto.Tarea_IdTarea,
                    FechaInicio = createAsignacionDto.FechaInicio,
                    FechaFin = createAsignacionDto.FechaFin,
                    Estado = createAsignacionDto.Estado
                };

                _context.UsuarioProductoTareas.Add(asignacion);
                await _context.SaveChangesAsync();

                var asignacionInfo = await GetAsignacionByIdAsync(asignacion.Id);

                _logger.LogInformation($"Asignación creada: Usuario {createAsignacionDto.Usuario_IdUsuario}, Producto {createAsignacionDto.Producto_IdProducto}, Tarea {createAsignacionDto.Tarea_IdTarea}");

                return new TaskResponseDto
                {
                    IsSuccess = true,
                    Message = "Asignación creada exitosamente",
                    Data = asignacionInfo
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear asignación");
                return new TaskResponseDto
                {
                    IsSuccess = false,
                    Message = "Error interno del servidor"
                };
            }
        }

        public async Task<TaskResponseDto> UpdateAsignacionAsync(int id, UpdateUsuarioProductoTareaDto updateAsignacionDto)
        {
            try
            {
                var asignacion = await _context.UsuarioProductoTareas.FindAsync(id);
                if (asignacion == null)
                {
                    return new TaskResponseDto
                    {
                        IsSuccess = false,
                        Message = "Asignación no encontrada"
                    };
                }

                asignacion.FechaInicio = updateAsignacionDto.FechaInicio;
                asignacion.FechaFin = updateAsignacionDto.FechaFin;
                asignacion.Estado = updateAsignacionDto.Estado;

                await _context.SaveChangesAsync();

                var asignacionInfo = await GetAsignacionByIdAsync(id);

                _logger.LogInformation($"Asignación actualizada: ID {id}");

                return new TaskResponseDto
                {
                    IsSuccess = true,
                    Message = "Asignación actualizada exitosamente",
                    Data = asignacionInfo
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar asignación con ID {Id}", id);
                return new TaskResponseDto
                {
                    IsSuccess = false,
                    Message = "Error interno del servidor"
                };
            }
        }

        public async Task<TaskResponseDto> DeleteAsignacionAsync(int id)
        {
            try
            {
                var asignacion = await _context.UsuarioProductoTareas.FindAsync(id);
                if (asignacion == null)
                {
                    return new TaskResponseDto
                    {
                        IsSuccess = false,
                        Message = "Asignación no encontrada"
                    };
                }

                // Solo permitir eliminar si no está completada
                if (asignacion.Estado == EstadoTarea.Completada)
                {
                    return new TaskResponseDto
                    {
                        IsSuccess = false,
                        Message = "No se puede eliminar una asignación completada"
                    };
                }

                _context.UsuarioProductoTareas.Remove(asignacion);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Asignación eliminada: ID {id}");

                return new TaskResponseDto
                {
                    IsSuccess = true,
                    Message = "Asignación eliminada exitosamente"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar asignación con ID {Id}", id);
                return new TaskResponseDto
                {
                    IsSuccess = false,
                    Message = "Error interno del servidor"
                };
            }
        }

        public async Task<UsuarioProductoTareaInfoDto?> GetAsignacionByIdAsync(int id)
        {
            try
            {
                var asignacion = await _context.UsuarioProductoTareas
                    .Include(upt => upt.Usuario)
                    .Include(upt => upt.Producto)
                    .Include(upt => upt.Tarea)
                    .FirstOrDefaultAsync(upt => upt.Id == id);

                if (asignacion == null) return null;

                return new UsuarioProductoTareaInfoDto
                {
                    Id = asignacion.Id,
                    Usuario_IdUsuario = asignacion.Usuario_IdUsuario,
                    UsuarioNombre = asignacion.Usuario.UserName ?? string.Empty,
                    UsuarioEmail = asignacion.Usuario.Email ?? string.Empty,
                    Producto_IdProducto = asignacion.Producto_IdProducto,
                    ProductoNombre = asignacion.Producto.NombreProducto,
                    ProductoDescripcion = asignacion.Producto.DescripcionProducto,
                    Tarea_IdTarea = asignacion.Tarea_IdTarea,
                    TareaNombre = asignacion.Tarea.NombreTarea,
                    TareaDescripcion = asignacion.Tarea.Descripcion,
                    FechaInicio = asignacion.FechaInicio,
                    FechaFin = asignacion.FechaFin,
                    Estado = asignacion.Estado,
                    EstadoDescripcion = GetEstadoDescription(asignacion.Estado),
                    DuracionTrabajo = asignacion.DuracionTrabajo,
                    EstaVencida = asignacion.EstaVencida,
                    FechaCreacion = (DateTime)asignacion.FechaCreacion,
                    FechaActualizacion = asignacion.FechaActualizacion
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener asignación con ID {Id}", id);
                return null;
            }
        }

        public async Task<UsuarioProductoTareaListDto> GetAsignacionesAsync(AsignacionFilterDto? filter = null)
        {
            try
            {
                filter ??= new AsignacionFilterDto();

                var query = _context.UsuarioProductoTareas
                    .Include(upt => upt.Usuario)
                    .Include(upt => upt.Producto)
                    .Include(upt => upt.Tarea)
                    .AsQueryable();

                // Aplicar filtros
                if (!string.IsNullOrEmpty(filter.UsuarioId))
                {
                    query = query.Where(upt => upt.Usuario_IdUsuario == filter.UsuarioId);
                }

                if (filter.ProductoId.HasValue)
                {
                    query = query.Where(upt => upt.Producto_IdProducto == filter.ProductoId.Value);
                }

                if (filter.TareaId.HasValue)
                {
                    query = query.Where(upt => upt.Tarea_IdTarea == filter.TareaId.Value);
                }

                if (filter.Estado.HasValue)
                {
                    query = query.Where(upt => upt.Estado == filter.Estado.Value);
                }

                if (filter.FechaDesde.HasValue)
                {
                    query = query.Where(upt => upt.FechaInicio >= filter.FechaDesde.Value);
                }

                if (filter.FechaHasta.HasValue)
                {
                    query = query.Where(upt => upt.FechaInicio <= filter.FechaHasta.Value);
                }

                if (filter.SoloVencidas.HasValue && filter.SoloVencidas.Value)
                {
                    query = query.Where(upt => upt.FechaFin.HasValue &&
                                              DateTime.Now > upt.FechaFin.Value &&
                                              upt.Estado != EstadoTarea.Completada);
                }

                var totalCount = await query.CountAsync();

                var asignaciones = await query
                    .OrderByDescending(upt => upt.FechaCreacion)
                    //.Skip((filter.PageNumber - 1) * filter.PageSize)
                    //.Take(filter.PageSize)
                    .Select(upt => new UsuarioProductoTareaInfoDto
                    {
                        Id = upt.Id,
                        Usuario_IdUsuario = upt.Usuario_IdUsuario,
                        UsuarioNombre = upt.Usuario.UserName ?? string.Empty,
                        UsuarioEmail = upt.Usuario.Email ?? string.Empty,
                        Producto_IdProducto = upt.Producto_IdProducto,
                        ProductoNombre = upt.Producto.NombreProducto,
                        ProductoDescripcion = upt.Producto.DescripcionProducto,
                        Tarea_IdTarea = upt.Tarea_IdTarea,
                        TareaNombre = upt.Tarea.NombreTarea,
                        TareaDescripcion = upt.Tarea.Descripcion,
                        FechaInicio = upt.FechaInicio,
                        FechaFin = upt.FechaFin,
                        Estado = upt.Estado,
                        EstadoDescripcion = GetEstadoDescription(upt.Estado),
                        DuracionTrabajo = upt.FechaFin.HasValue ? upt.FechaFin.Value - upt.FechaInicio : null,
                        EstaVencida = upt.FechaFin.HasValue && DateTime.Now > upt.FechaFin.Value && upt.Estado != EstadoTarea.Completada,
                        FechaCreacion = (DateTime)upt.FechaCreacion,
                        FechaActualizacion = upt.FechaActualizacion
                    })
                    .ToListAsync();

                return new UsuarioProductoTareaListDto
                {
                    Asignaciones = asignaciones,
                    TotalCount = totalCount,
                    //PageNumber = filter.PageNumber,
                    //PageSize = filter.PageSize
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener lista de asignaciones");
                return new UsuarioProductoTareaListDto();
            }
        }

        #endregion

        #region Operaciones Específicas de Asignaciones

        public async Task<UsuarioProductoTareaListDto> GetAsignacionesByUsuarioAsync(string usuarioId/*, int pageNumber = 1, int pageSize = 10*/)
        {
            var filter = new AsignacionFilterDto
            {
                UsuarioId = usuarioId,
                //PageNumber = pageNumber,
                //PageSize = pageSize
            };

            return await GetAsignacionesAsync(filter);
        }

        public async Task<TaskResponseDto> CambiarEstadoAsignacionAsync(int id, EstadoTarea nuevoEstado)
        {
            try
            {
                var asignacion = await _context.UsuarioProductoTareas.FindAsync(id);
                if (asignacion == null)
                {
                    return new TaskResponseDto
                    {
                        IsSuccess = false,
                        Message = "Asignación no encontrada"
                    };
                }

                var estadoAnterior = asignacion.Estado;
                asignacion.Estado = nuevoEstado;

                // Si se está completando la tarea, establecer fecha fin
                if (nuevoEstado == EstadoTarea.Completada && !asignacion.FechaFin.HasValue)
                {
                    asignacion.FechaFin = DateTime.UtcNow;
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation($"Estado de asignación {id} cambiado de {estadoAnterior} a {nuevoEstado}");

                return new TaskResponseDto
                {
                    IsSuccess = true,
                    Message = $"Estado actualizado de {GetEstadoDescription(estadoAnterior)} a {GetEstadoDescription(nuevoEstado)}"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al cambiar estado de asignación {Id}", id);
                return new TaskResponseDto
                {
                    IsSuccess = false,
                    Message = "Error interno del servidor"
                };
            }
        }

        public async Task<TaskResponseDto> IniciarTareaAsync(int id)
        {
            return await CambiarEstadoAsignacionAsync(id, EstadoTarea.EnProceso);
        }

        public async Task<TaskResponseDto> CompletarTareaAsync(int id)
        {
            return await CambiarEstadoAsignacionAsync(id, EstadoTarea.Completada);
        }

        public async Task<TaskResponseDto> PausarTareaAsync(int id)
        {
            return await CambiarEstadoAsignacionAsync(id, EstadoTarea.EnPausa);
        }

        public async Task<TaskResponseDto> AsignarTareasMasivasAsync(AsignarTareasMasivasDto asignacionMasiva)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var asignacionesCreadas = 0;
                var errores = new List<string>();

                foreach (var usuarioId in asignacionMasiva.UsuariosIds)
                {
                    foreach (var productoId in asignacionMasiva.ProductosIds)
                    {
                        foreach (var tareaId in asignacionMasiva.TareasIds)
                        {
                            // Verificar que no existe ya una asignación activa
                            var existe = await _context.UsuarioProductoTareas
                                .AnyAsync(upt => upt.Usuario_IdUsuario == usuarioId &&
                                               upt.Producto_IdProducto == productoId &&
                                               upt.Tarea_IdTarea == tareaId &&
                                               upt.Estado != EstadoTarea.Completada &&
                                               upt.Estado != EstadoTarea.Cancelada);

                            if (!existe)
                            {
                                var asignacion = new UsuarioProductoTarea
                                {
                                    Usuario_IdUsuario = usuarioId,
                                    Producto_IdProducto = productoId,
                                    Tarea_IdTarea = tareaId,
                                    FechaInicio = asignacionMasiva.FechaInicio,
                                    FechaFin = asignacionMasiva.FechaFinEstimada,
                                    Estado = EstadoTarea.Pendiente
                                };

                                _context.UsuarioProductoTareas.Add(asignacion);
                                asignacionesCreadas++;
                            }
                            else
                            {
                                errores.Add($"Ya existe asignación activa para Usuario {usuarioId}, Producto {productoId}, Tarea {tareaId}");
                            }
                        }
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                var mensaje = $"Se crearon {asignacionesCreadas} asignaciones exitosamente";
                if (errores.Any())
                {
                    mensaje += $". {errores.Count} asignaciones ya existían";
                }

                _logger.LogInformation($"Asignación masiva completada: {asignacionesCreadas} asignaciones creadas");

                return new TaskResponseDto
                {
                    IsSuccess = true,
                    Message = mensaje,
                    Data = new { AsignacionesCreadas = asignacionesCreadas, Errores = errores }
                };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error en asignación masiva");
                return new TaskResponseDto
                {
                    IsSuccess = false,
                    Message = "Error interno del servidor"
                };
            }
        }

        #endregion

        #region Reportes y Estadísticas

        public async Task<Dictionary<EstadoTarea, int>> GetEstadisticasEstadosAsync()
        {
            try
            {
                var estadisticas = await _context.UsuarioProductoTareas
                    .GroupBy(upt => upt.Estado)
                    .Select(g => new { Estado = g.Key, Cantidad = g.Count() })
                    .ToDictionaryAsync(x => x.Estado, x => x.Cantidad);

                return estadisticas;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener estadísticas de estados de tareas");
                return new Dictionary<EstadoTarea, int>();
            }
        }

        public async Task<List<UsuarioProductoTareaInfoDto>> GetTareasVencidasAsync()
        {
            try
            {
                var tareasVencidas = await _context.UsuarioProductoTareas
                    .Include(upt => upt.Usuario)
                    .Include(upt => upt.Producto)
                    .Include(upt => upt.Tarea)
                    .Where(upt => upt.FechaFin.HasValue &&
                                 DateTime.Now > upt.FechaFin.Value &&
                                 upt.Estado != EstadoTarea.Completada &&
                                 upt.Estado != EstadoTarea.Cancelada)
                    .Select(upt => new UsuarioProductoTareaInfoDto
                    {
                        Id = upt.Id,
                        Usuario_IdUsuario = upt.Usuario_IdUsuario,
                        UsuarioNombre = upt.Usuario.UserName ?? string.Empty,
                        UsuarioEmail = upt.Usuario.Email ?? string.Empty,
                        Producto_IdProducto = upt.Producto_IdProducto,
                        ProductoNombre = upt.Producto.NombreProducto,
                        ProductoDescripcion = upt.Producto.DescripcionProducto,
                        Tarea_IdTarea = upt.Tarea_IdTarea,
                        TareaNombre = upt.Tarea.NombreTarea,
                        TareaDescripcion = upt.Tarea.Descripcion,
                        FechaInicio = upt.FechaInicio,
                        FechaFin = upt.FechaFin,
                        Estado = upt.Estado,
                        EstadoDescripcion = GetEstadoDescription(upt.Estado),
                        DuracionTrabajo = null,
                        EstaVencida = true,
                        FechaCreacion = (DateTime)upt.FechaCreacion,
                        FechaActualizacion = upt.FechaActualizacion
                    })
                    .ToListAsync();

                return tareasVencidas;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener tareas vencidas");
                return new List<UsuarioProductoTareaInfoDto>();
            }
        }

        public async Task<Dictionary<string, int>> GetProductividadPorUsuarioAsync(DateTime fechaInicio, DateTime fechaFin)
        {
            try
            {
                var productividad = await _context.UsuarioProductoTareas
                    .Include(upt => upt.Usuario)
                    .Where(upt => upt.FechaInicio >= fechaInicio &&
                                 upt.FechaInicio <= fechaFin &&
                                 upt.Estado == EstadoTarea.Completada)
                    .GroupBy(upt => upt.Usuario.UserName)
                    .Select(g => new { Usuario = g.Key ?? "Usuario Desconocido", TareasCompletadas = g.Count() })
                    .ToDictionaryAsync(x => x.Usuario, x => x.TareasCompletadas);

                return productividad;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener productividad por usuario");
                return new Dictionary<string, int>();
            }
        }

        #endregion

        #region Private Helper Methods

        private static string GetEstadoDescription(EstadoTarea estado)
        {
            var field = estado.GetType().GetField(estado.ToString());
            var attribute = (DescriptionAttribute?)field?.GetCustomAttributes(typeof(DescriptionAttribute), false).FirstOrDefault();
            return attribute?.Description ?? estado.ToString();
        }

        #endregion
    }
}
