using Microsoft.EntityFrameworkCore;
using ConfeccionesEsperanzaEF.Data;
using ConfeccionesEsperanzaEF.Models.Material;
using ConfeccionesEsperanzaEF.Models.DTOs.Material;

namespace ConfeccionesEsperanzaEF.Services
{
    public interface IMaterialService
    {
        Task<MaterialResponseDto> CreateMaterialAsync(CreateMaterialDto createMaterialDto);
        Task<MaterialResponseDto> UpdateMaterialAsync(int id, UpdateMaterialDto updateMaterialDto);
        Task<MaterialResponseDto> DeleteMaterialAsync(int id);
        Task<MaterialInfoDto?> GetMaterialByIdAsync(int id);
        Task<MaterialListDto> GetMaterialsAsync(/*int pageNumber = 1, int pageSize = 10, */string? searchTerm = null);
        Task<MaterialListDto> GetMaterialsByTipoAsync(int tipoMaterialId /*int pageNumber = 1, int pageSize = 10*/);
        Task<List<TipoMaterialInfoDto>> GetTiposMaterialAsync();
        Task<MaterialResponseDto> CreateTipoMaterialAsync(CreateTipoMaterialDto createTipoDto);
    }

    public class MaterialService : IMaterialService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<MaterialService> _logger;

        public MaterialService(ApplicationDbContext context, ILogger<MaterialService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<MaterialResponseDto> CreateMaterialAsync(CreateMaterialDto createMaterialDto)
        {
            try
            {
                // Validar que el tipo de material existe
                var tipoMaterial = await _context.TiposMaterial
                    .FirstOrDefaultAsync(tm => tm.IdTipoMaterial == createMaterialDto.TipoMaterial_IdTipoMaterial);

                if (tipoMaterial == null)
                {
                    return new MaterialResponseDto
                    {
                        IsSuccess = false,
                        Message = "El tipo de material especificado no existe"
                    };
                }

                // Validar que el color existe
                var color = await _context.Colores
                    .FirstOrDefaultAsync(c => c.IdColor == createMaterialDto.Color_IdColor);

                if (color == null)
                {
                    return new MaterialResponseDto
                    {
                        IsSuccess = false,
                        Message = "El color especificado no existe"
                    };
                }

                var material = new Material
                {
                    Nombre = createMaterialDto.Nombre,
                    Cantidad = createMaterialDto.Cantidad,
                    FechaEntrada = createMaterialDto.FechaEntrada,
                    Proveedor = createMaterialDto.Proveedor,
                    TipoMaterial_IdTipoMaterial = createMaterialDto.TipoMaterial_IdTipoMaterial,
                    Color_IdColor = createMaterialDto.Color_IdColor
                };

                _context.Materiales.Add(material);
                await _context.SaveChangesAsync();

                var materialInfo = await GetMaterialByIdAsync(material.IdMaterial);

                _logger.LogInformation($"Material creado: {material.Nombre} con ID {material.IdMaterial}");

                return new MaterialResponseDto
                {
                    IsSuccess = true,
                    Message = "Material creado exitosamente",
                    Material = materialInfo
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear material");
                return new MaterialResponseDto
                {
                    IsSuccess = false,
                    Message = "Error interno del servidor"
                };
            }
        }

        public async Task<MaterialResponseDto> UpdateMaterialAsync(int id, UpdateMaterialDto updateMaterialDto)
        {
            try
            {
                var material = await _context.Materiales.FindAsync(id);
                if (material == null)
                {
                    return new MaterialResponseDto
                    {
                        IsSuccess = false,
                        Message = "Material no encontrado"
                    };
                }

                // Validar referencias
                var tipoMaterial = await _context.TiposMaterial
                    .FirstOrDefaultAsync(tm => tm.IdTipoMaterial == updateMaterialDto.TipoMaterial_IdTipoMaterial);

                var color = await _context.Colores
                    .FirstOrDefaultAsync(c => c.IdColor == updateMaterialDto.Color_IdColor);

                if (tipoMaterial == null || color == null)
                {
                    return new MaterialResponseDto
                    {
                        IsSuccess = false,
                        Message = "Tipo de material o color especificado no existe"
                    };
                }

                // Actualizar propiedades
                material.Nombre = updateMaterialDto.Nombre;
                material.Cantidad = updateMaterialDto.Cantidad;
                material.FechaEntrada = updateMaterialDto.FechaEntrada;
                material.Proveedor = updateMaterialDto.Proveedor;
                material.TipoMaterial_IdTipoMaterial = updateMaterialDto.TipoMaterial_IdTipoMaterial;
                material.Color_IdColor = updateMaterialDto.Color_IdColor;

                await _context.SaveChangesAsync();

                var materialInfo = await GetMaterialByIdAsync(id);

                _logger.LogInformation($"Material actualizado: {material.Nombre} con ID {id}");

                return new MaterialResponseDto
                {
                    IsSuccess = true,
                    Message = "Material actualizado exitosamente",
                    Material = materialInfo
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar material con ID {Id}", id);
                return new MaterialResponseDto
                {
                    IsSuccess = false,
                    Message = "Error interno del servidor"
                };
            }
        }

        public async Task<MaterialResponseDto> DeleteMaterialAsync(int id)
        {
            try
            {
                var material = await _context.Materiales.FindAsync(id);
                if (material == null)
                {
                    return new MaterialResponseDto
                    {
                        IsSuccess = false,
                        Message = "Material no encontrado"
                    };
                }

                // Verificar si el material está siendo usado en algún producto
                var isUsed = await _context.ProductoMateriales
                    .AnyAsync(pm => pm.Material_IdMaterial == id);

                if (isUsed)
                {
                    return new MaterialResponseDto
                    {
                        IsSuccess = false,
                        Message = "No se puede eliminar el material porque está siendo usado en productos"
                    };
                }

                _context.Materiales.Remove(material);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Material eliminado: {material.Nombre} con ID {id}");

                return new MaterialResponseDto
                {
                    IsSuccess = true,
                    Message = "Material eliminado exitosamente"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar material con ID {Id}", id);
                return new MaterialResponseDto
                {
                    IsSuccess = false,
                    Message = "Error interno del servidor"
                };
            }
        }

        public async Task<MaterialInfoDto?> GetMaterialByIdAsync(int id)
        {
            try
            {
                var material = await _context.Materiales
                    .Include(m => m.TipoMaterial)
                    .Include(m => m.Color)
                    .FirstOrDefaultAsync(m => m.IdMaterial == id);

                if (material == null) return null;

                return new MaterialInfoDto
                {
                    IdMaterial = material.IdMaterial,
                    Nombre = material.Nombre,
                    Cantidad = material.Cantidad,
                    FechaEntrada = material.FechaEntrada,
                    Proveedor = material.Proveedor,
                    TipoMaterial_IdTipoMaterial = material.TipoMaterial_IdTipoMaterial,
                    TipoMaterialDescripcion = material.TipoMaterial.DescripcionMaterial,
                    UnidadMedida = material.TipoMaterial.UnidadMedida,
                    Color_IdColor = material.Color_IdColor,
                    ColorDescripcion = material.Color.DescripcionColor,
                    FechaCreacion = material.FechaCreacion,
                    FechaActualizacion = material.FechaActualizacion
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener material con ID {Id}", id);
                return null;
            }
        }

        public async Task<MaterialListDto> GetMaterialsAsync(/*int pageNumber = 1, int pageSize = 10, */string? searchTerm = null)
        {
            try
            {
                var query = _context.Materiales
                    .Include(m => m.TipoMaterial)
                    .Include(m => m.Color)
                    .AsQueryable();

                if (!string.IsNullOrEmpty(searchTerm))
                {
                    query = query.Where(m => m.Nombre.Contains(searchTerm) ||
                                           m.TipoMaterial.DescripcionMaterial.Contains(searchTerm) ||
                                           m.Color.DescripcionColor.Contains(searchTerm));
                }

                var totalCount = await query.CountAsync();

                var materiales = await query
                    .OrderBy(m => m.Nombre)
                    //.Skip((pageNumber - 1) * pageSize)
                    //.Take(pageSize)
                    .Select(m => new MaterialInfoDto
                    {
                        IdMaterial = m.IdMaterial,
                        Nombre = m.Nombre,
                        Cantidad = m.Cantidad,
                        FechaEntrada = m.FechaEntrada,
                        Proveedor = m.Proveedor,
                        TipoMaterial_IdTipoMaterial = m.TipoMaterial_IdTipoMaterial,
                        TipoMaterialDescripcion = m.TipoMaterial.DescripcionMaterial,
                        UnidadMedida = m.TipoMaterial.UnidadMedida,
                        Color_IdColor = m.Color_IdColor,
                        ColorDescripcion = m.Color.DescripcionColor,
                        FechaCreacion = m.FechaCreacion,
                        FechaActualizacion = m.FechaActualizacion
                    })
                    .ToListAsync();

                return new MaterialListDto
                {
                    Materiales = materiales,
                    TotalCount = totalCount,
                    //PageNumber = pageNumber,
                    //PageSize = pageSize
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener lista de materiales");
                return new MaterialListDto();
            }
        }

        public async Task<MaterialListDto> GetMaterialsByTipoAsync(int tipoMaterialId/*, int pageNumber = 1, int pageSize = 10*/)
        {
            try
            {
                var query = _context.Materiales
                    .Include(m => m.TipoMaterial)
                    .Include(m => m.Color)
                    .Where(m => m.TipoMaterial_IdTipoMaterial == tipoMaterialId);

                var totalCount = await query.CountAsync();

                var materiales = await query
                    .OrderBy(m => m.Nombre)
                    //.Skip((pageNumber - 1) * pageSize)
                    //.Take(pageSize)
                    .Select(m => new MaterialInfoDto
                    {
                        IdMaterial = m.IdMaterial,
                        Nombre = m.Nombre,
                        Cantidad = m.Cantidad,
                        FechaEntrada = m.FechaEntrada,
                        Proveedor = m.Proveedor,
                        TipoMaterial_IdTipoMaterial = m.TipoMaterial_IdTipoMaterial,
                        TipoMaterialDescripcion = m.TipoMaterial.DescripcionMaterial,
                        UnidadMedida = m.TipoMaterial.UnidadMedida,
                        Color_IdColor = m.Color_IdColor,
                        ColorDescripcion = m.Color.DescripcionColor,
                        FechaCreacion = m.FechaCreacion,
                        FechaActualizacion = m.FechaActualizacion
                    })
                    .ToListAsync();

                return new MaterialListDto
                {
                    Materiales = materiales,
                    TotalCount = totalCount,
                    //PageNumber = pageNumber,
                    //PageSize = pageSize
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener materiales por tipo {TipoId}", tipoMaterialId);
                return new MaterialListDto();
            }
        }

        public async Task<List<TipoMaterialInfoDto>> GetTiposMaterialAsync()
        {
            try
            {
                return await _context.TiposMaterial
                    .Select(tm => new TipoMaterialInfoDto
                    {
                        IdTipoMaterial = tm.IdTipoMaterial,
                        DescripcionMaterial = tm.DescripcionMaterial,
                        UnidadMedida = tm.UnidadMedida
                    })
                    .OrderBy(tm => tm.DescripcionMaterial)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener tipos de material");
                return new List<TipoMaterialInfoDto>();
            }
        }

        public async Task<MaterialResponseDto> CreateTipoMaterialAsync(CreateTipoMaterialDto createTipoDto)
        {
            try
            {
                // Verificar que no existe ya un tipo con la misma descripción
                var existingTipo = await _context.TiposMaterial
                    .FirstOrDefaultAsync(tm => tm.DescripcionMaterial.ToLower() == createTipoDto.DescripcionMaterial.ToLower());

                if (existingTipo != null)
                {
                    return new MaterialResponseDto
                    {
                        IsSuccess = false,
                        Message = "Ya existe un tipo de material con esa descripción"
                    };
                }

                var tipoMaterial = new TipoMaterial
                {
                    DescripcionMaterial = createTipoDto.DescripcionMaterial,
                    UnidadMedida = createTipoDto.UnidadMedida
                };

                _context.TiposMaterial.Add(tipoMaterial);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Tipo de material creado: {tipoMaterial.DescripcionMaterial} con ID {tipoMaterial.IdTipoMaterial}");

                return new MaterialResponseDto
                {
                    IsSuccess = true,
                    Message = "Tipo de material creado exitosamente"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear tipo de material");
                return new MaterialResponseDto
                {
                    IsSuccess = false,
                    Message = "Error interno del servidor"
                };
            }
        }
    }
}
