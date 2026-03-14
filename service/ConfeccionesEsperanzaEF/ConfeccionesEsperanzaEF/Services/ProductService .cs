using Microsoft.EntityFrameworkCore;
using ConfeccionesEsperanzaEF.Data;
using ConfeccionesEsperanzaEF.Models.Product;
using ConfeccionesEsperanzaEF.Models.DTOs.Product;

namespace ConfeccionesEsperanzaEF.Services
{
    public interface IProductService
    {
        Task<ProductoResponseDto> CreateProductoAsync(CreateProductoDto createProductoDto);
        Task<ProductoResponseDto> UpdateProductoAsync(int id, UpdateProductoDto updateProductoDto);
        Task<ProductoResponseDto> DeleteProductoAsync(int id);
        Task<ProductoInfoDto?> GetProductoByIdAsync(int id);
        Task<ProductoListDto> GetProductosAsync(ProductoFilterDto? filter = null);
        Task<ProductoListDto> SearchProductosAsync(string searchTerm, int pageNumber = 1, int pageSize = 10);
        Task<ProductoResponseDto> AddMaterialToProductoAsync(int productoId, ProductoMaterialDto materialDto);
        Task<ProductoResponseDto> RemoveMaterialFromProductoAsync(int productoId, int materialId);
    }

    public class ProductService : IProductService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ProductService> _logger;

        public ProductService(ApplicationDbContext context, ILogger<ProductService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<ProductoResponseDto> CreateProductoAsync(CreateProductoDto createProductoDto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Validar que todas las referencias existen
                var validationResult = await ValidateReferencesAsync(createProductoDto);
                if (!validationResult.IsValid)
                {
                    return new ProductoResponseDto
                    {
                        IsSuccess = false,
                        Message = validationResult.ErrorMessage
                    };
                }

                var producto = new Producto
                {
                    NombreProducto = createProductoDto.NombreProducto.Trim(),
                    DescripcionProducto = createProductoDto.DescripcionProducto.Trim(),
                    Color_IdColor = createProductoDto.Color_IdColor,
                    Talla_IdTalla = createProductoDto.Talla_IdTalla,
                    Categoria_IdCategoria = createProductoDto.Categoria_IdCategoria,
                    Familia_IdFamilia = createProductoDto.Familia_IdFamilia,
                    Linea_IdLinea = createProductoDto.Linea_IdLinea
                };

                _context.Productos.Add(producto);
                await _context.SaveChangesAsync();

                // Agregar materiales si se proporcionaron
                if (createProductoDto.Materiales.Any())
                {
                    await AddMaterialesToProductoAsync(producto.IdProducto, createProductoDto.Materiales);
                }

                await transaction.CommitAsync();

                var productoInfo = await GetProductoByIdAsync(producto.IdProducto);

                _logger.LogInformation($"Producto creado: {producto.NombreProducto} con ID {producto.IdProducto}");

                return new ProductoResponseDto
                {
                    IsSuccess = true,
                    Message = "Producto creado exitosamente",
                    Producto = productoInfo
                };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error al crear producto");
                return new ProductoResponseDto
                {
                    IsSuccess = false,
                    Message = "Error interno del servidor"
                };
            }
        }

        public async Task<ProductoResponseDto> UpdateProductoAsync(int id, UpdateProductoDto updateProductoDto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var producto = await _context.Productos.FindAsync(id);
                if (producto == null)
                {
                    return new ProductoResponseDto
                    {
                        IsSuccess = false,
                        Message = "Producto no encontrado"
                    };
                }

                // Validar referencias
                var validationResult = await ValidateReferencesAsync(updateProductoDto);
                if (!validationResult.IsValid)
                {
                    return new ProductoResponseDto
                    {
                        IsSuccess = false,
                        Message = validationResult.ErrorMessage
                    };
                }

                // Actualizar propiedades del producto
                producto.NombreProducto = updateProductoDto.NombreProducto.Trim();
                producto.DescripcionProducto = updateProductoDto.DescripcionProducto.Trim();
                producto.Color_IdColor = updateProductoDto.Color_IdColor;
                producto.Talla_IdTalla = updateProductoDto.Talla_IdTalla;
                producto.Categoria_IdCategoria = updateProductoDto.Categoria_IdCategoria;
                producto.Familia_IdFamilia = updateProductoDto.Familia_IdFamilia;
                producto.Linea_IdLinea = updateProductoDto.Linea_IdLinea;

                // Actualizar materiales
                await UpdateProductoMaterialesAsync(id, updateProductoDto.Materiales);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                var productoInfo = await GetProductoByIdAsync(id);

                _logger.LogInformation($"Producto actualizado: {producto.NombreProducto} con ID {id}");

                return new ProductoResponseDto
                {
                    IsSuccess = true,
                    Message = "Producto actualizado exitosamente",
                    Producto = productoInfo
                };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error al actualizar producto con ID {Id}", id);
                return new ProductoResponseDto
                {
                    IsSuccess = false,
                    Message = "Error interno del servidor"
                };
            }
        }

        public async Task<ProductoResponseDto> DeleteProductoAsync(int id)
        {
            try
            {
                var producto = await _context.Productos.FindAsync(id);
                if (producto == null)
                {
                    return new ProductoResponseDto
                    {
                        IsSuccess = false,
                        Message = "Producto no encontrado"
                    };
                }

                // Verificar si el producto está en pedidos
                var isInOrders = await _context.DetallesPedido
                    .AnyAsync(dp => dp.Producto_IdProducto == id);

                if (isInOrders)
                {
                    return new ProductoResponseDto
                    {
                        IsSuccess = false,
                        Message = "No se puede eliminar el producto porque está incluido en pedidos"
                    };
                }

                // Verificar si tiene tareas asignadas
                var hasTasks = await _context.UsuarioProductoTareas
                    .AnyAsync(upt => upt.Producto_IdProducto == id);

                if (hasTasks)
                {
                    return new ProductoResponseDto
                    {
                        IsSuccess = false,
                        Message = "No se puede eliminar el producto porque tiene tareas asignadas"
                    };
                }

                _context.Productos.Remove(producto);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Producto eliminado: {producto.NombreProducto} con ID {id}");

                return new ProductoResponseDto
                {
                    IsSuccess = true,
                    Message = "Producto eliminado exitosamente"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar producto con ID {Id}", id);
                return new ProductoResponseDto
                {
                    IsSuccess = false,
                    Message = "Error interno del servidor"
                };
            }
        }

        public async Task<ProductoInfoDto?> GetProductoByIdAsync(int id)
        {
            try
            {
                var producto = await _context.Productos
                    .Include(p => p.Color)
                    .Include(p => p.Talla)
                    .Include(p => p.Categoria)
                    .Include(p => p.Familia)
                    .Include(p => p.Linea)
                    .Include(p => p.ProductoMateriales)
                        .ThenInclude(pm => pm.Material)
                            .ThenInclude(m => m.TipoMaterial)
                    .Include(p => p.ProductoMateriales)
                        .ThenInclude(pm => pm.Material)
                            .ThenInclude(m => m.Color)
                    .FirstOrDefaultAsync(p => p.IdProducto == id);

                if (producto == null) return null;

                return new ProductoInfoDto
                {
                    IdProducto = producto.IdProducto,
                    NombreProducto = producto.NombreProducto,
                    DescripcionProducto = producto.DescripcionProducto,
                    NombreCompleto = producto.NombreCompleto,
                    Color_IdColor = producto.Color_IdColor,
                    ColorDescripcion = producto.Color.DescripcionColor,
                    Talla_IdTalla = producto.Talla_IdTalla,
                    TallaDescripcion = producto.Talla.DescripcionTalla,
                    Categoria_IdCategoria = producto.Categoria_IdCategoria,
                    CategoriaDescripcion = producto.Categoria.DescripcionCategoria,
                    Familia_IdFamilia = producto.Familia_IdFamilia,
                    FamiliaDescripcion = producto.Familia.DescripcionFamilia,
                    Linea_IdLinea = producto.Linea_IdLinea,
                    LineaDescripcion = producto.Linea.DescripcionLinea,
                    FechaCreacion = (DateTime)producto.FechaCreacion,
                    FechaActualizacion = producto.FechaActualizacion,
                    Materiales = producto.ProductoMateriales.Select(pm => new ProductoMaterialInfoDto
                    {
                        Id = pm.Id,
                        Material_IdMaterial = pm.Material_IdMaterial,
                        MaterialNombre = pm.Material.Nombre,
                        TipoMaterialDescripcion = pm.Material.TipoMaterial.DescripcionMaterial,
                        ColorDescripcion = pm.Material.Color.DescripcionColor,
                        CantidadRequerida = pm.CantidadRequerida,
                        Notas = pm.Notas,
                        FechaCreacion = (DateTime)pm.FechaCreacion
                    }).ToList()
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener producto con ID {Id}", id);
                return null;
            }
        }

        public async Task<ProductoListDto> GetProductosAsync(ProductoFilterDto? filter = null)
        {
            try
            {
                filter ??= new ProductoFilterDto();

                var query = _context.Productos
                    .Include(p => p.Color)
                    .Include(p => p.Talla)
                    .Include(p => p.Categoria)
                    .Include(p => p.Familia)
                    .Include(p => p.Linea)
                    .AsQueryable();

                // Aplicar filtros
                if (!string.IsNullOrEmpty(filter.Nombre))
                {
                    query = query.Where(p => p.NombreProducto.Contains(filter.Nombre));
                }

                if (filter.ColorId.HasValue)
                {
                    query = query.Where(p => p.Color_IdColor == filter.ColorId.Value);
                }

                if (filter.TallaId.HasValue)
                {
                    query = query.Where(p => p.Talla_IdTalla == filter.TallaId.Value);
                }

                if (filter.CategoriaId.HasValue)
                {
                    query = query.Where(p => p.Categoria_IdCategoria == filter.CategoriaId.Value);
                }

                if (filter.FamiliaId.HasValue)
                {
                    query = query.Where(p => p.Familia_IdFamilia == filter.FamiliaId.Value);
                }

                if (filter.LineaId.HasValue)
                {
                    query = query.Where(p => p.Linea_IdLinea == filter.LineaId.Value);
                }

                var totalCount = await query.CountAsync();

                var productos = await query
                    .OrderBy(p => p.NombreProducto)
                    .Skip((filter.PageNumber - 1) * filter.PageSize)
                    .Take(filter.PageSize)
                    .Select(p => new ProductoInfoDto
                    {
                        IdProducto = p.IdProducto,
                        NombreProducto = p.NombreProducto,
                        DescripcionProducto = p.DescripcionProducto,
                        NombreCompleto = p.NombreCompleto,
                        Color_IdColor = p.Color_IdColor,
                        ColorDescripcion = p.Color.DescripcionColor,
                        Talla_IdTalla = p.Talla_IdTalla,
                        TallaDescripcion = p.Talla.DescripcionTalla,
                        Categoria_IdCategoria = p.Categoria_IdCategoria,
                        CategoriaDescripcion = p.Categoria.DescripcionCategoria,
                        Familia_IdFamilia = p.Familia_IdFamilia,
                        FamiliaDescripcion = p.Familia.DescripcionFamilia,
                        Linea_IdLinea = p.Linea_IdLinea,
                        LineaDescripcion = p.Linea.DescripcionLinea,
                        FechaCreacion = (DateTime)p.FechaCreacion,
                        FechaActualizacion = p.FechaActualizacion,
                        Materiales = new List<ProductoMaterialInfoDto>() // Para el listado no incluimos materiales por performance
                    })
                    .ToListAsync();

                return new ProductoListDto
                {
                    Productos = productos,
                    TotalCount = totalCount,
                    PageNumber = filter.PageNumber,
                    PageSize = filter.PageSize
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener lista de productos");
                return new ProductoListDto();
            }
        }

        public async Task<ProductoListDto> SearchProductosAsync(string searchTerm, int pageNumber = 1, int pageSize = 10)
        {
            try
            {
                var query = _context.Productos
                    .Include(p => p.Color)
                    .Include(p => p.Talla)
                    .Include(p => p.Categoria)
                    .Include(p => p.Familia)
                    .Include(p => p.Linea)
                    .Where(p => p.NombreProducto.Contains(searchTerm) ||
                              p.DescripcionProducto.Contains(searchTerm) ||
                              p.Color.DescripcionColor.Contains(searchTerm) ||
                              p.Familia.DescripcionFamilia.Contains(searchTerm));

                var totalCount = await query.CountAsync();

                var productos = await query
                    .OrderBy(p => p.NombreProducto)
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .Select(p => new ProductoInfoDto
                    {
                        IdProducto = p.IdProducto,
                        NombreProducto = p.NombreProducto,
                        DescripcionProducto = p.DescripcionProducto,
                        NombreCompleto = p.NombreCompleto,
                        Color_IdColor = p.Color_IdColor,
                        ColorDescripcion = p.Color.DescripcionColor,
                        Talla_IdTalla = p.Talla_IdTalla,
                        TallaDescripcion = p.Talla.DescripcionTalla,
                        Categoria_IdCategoria = p.Categoria_IdCategoria,
                        CategoriaDescripcion = p.Categoria.DescripcionCategoria,
                        Familia_IdFamilia = p.Familia_IdFamilia,
                        FamiliaDescripcion = p.Familia.DescripcionFamilia,
                        Linea_IdLinea = p.Linea_IdLinea,
                        LineaDescripcion = p.Linea.DescripcionLinea,
                        FechaCreacion = (DateTime)p.FechaCreacion,
                        FechaActualizacion = p.FechaActualizacion,
                        Materiales = new List<ProductoMaterialInfoDto>()
                    })
                    .ToListAsync();

                return new ProductoListDto
                {
                    Productos = productos,
                    TotalCount = totalCount,
                    PageNumber = pageNumber,
                    PageSize = pageSize
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al buscar productos con término {SearchTerm}", searchTerm);
                return new ProductoListDto();
            }
        }

        public async Task<ProductoResponseDto> AddMaterialToProductoAsync(int productoId, ProductoMaterialDto materialDto)
        {
            try
            {
                // Verificar que el producto existe
                var producto = await _context.Productos.FindAsync(productoId);
                if (producto == null)
                {
                    return new ProductoResponseDto
                    {
                        IsSuccess = false,
                        Message = "Producto no encontrado"
                    };
                }

                // Verificar que el material existe
                var material = await _context.Materiales.FindAsync(materialDto.Material_IdMaterial);
                if (material == null)
                {
                    return new ProductoResponseDto
                    {
                        IsSuccess = false,
                        Message = "Material no encontrado"
                    };
                }

                // Verificar que no exista ya la relación
                var existingRelation = await _context.ProductoMateriales
                    .AnyAsync(pm => pm.Producto_IdProducto == productoId &&
                                   pm.Material_IdMaterial == materialDto.Material_IdMaterial);

                if (existingRelation)
                {
                    return new ProductoResponseDto
                    {
                        IsSuccess = false,
                        Message = "El material ya está asociado al producto"
                    };
                }

                var productoMaterial = new ProductoMaterial
                {
                    Producto_IdProducto = productoId,
                    Material_IdMaterial = materialDto.Material_IdMaterial,
                    CantidadRequerida = materialDto.CantidadRequerida,
                    Notas = materialDto.Notas
                };

                _context.ProductoMateriales.Add(productoMaterial);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Material {materialDto.Material_IdMaterial} agregado al producto {productoId}");

                return new ProductoResponseDto
                {
                    IsSuccess = true,
                    Message = "Material agregado al producto exitosamente"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al agregar material {MaterialId} al producto {ProductoId}", materialDto.Material_IdMaterial, productoId);
                return new ProductoResponseDto
                {
                    IsSuccess = false,
                    Message = "Error interno del servidor"
                };
            }
        }

        public async Task<ProductoResponseDto> RemoveMaterialFromProductoAsync(int productoId, int materialId)
        {
            try
            {
                var productoMaterial = await _context.ProductoMateriales
                    .FirstOrDefaultAsync(pm => pm.Producto_IdProducto == productoId &&
                                              pm.Material_IdMaterial == materialId);

                if (productoMaterial == null)
                {
                    return new ProductoResponseDto
                    {
                        IsSuccess = false,
                        Message = "La relación producto-material no existe"
                    };
                }

                _context.ProductoMateriales.Remove(productoMaterial);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Material {materialId} removido del producto {productoId}");

                return new ProductoResponseDto
                {
                    IsSuccess = true,
                    Message = "Material removido del producto exitosamente"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al remover material {MaterialId} del producto {ProductoId}", materialId, productoId);
                return new ProductoResponseDto
                {
                    IsSuccess = false,
                    Message = "Error interno del servidor"
                };
            }
        }

        #region Private Helper Methods

        private async Task<(bool IsValid, string ErrorMessage)> ValidateReferencesAsync(CreateProductoDto dto)
        {
            // Validar Color
            var colorExists = await _context.Colores.AnyAsync(c => c.IdColor == dto.Color_IdColor);
            if (!colorExists)
                return (false, "El color especificado no existe");

            // Validar Talla
            var tallaExists = await _context.Tallas.AnyAsync(t => t.IdTalla == dto.Talla_IdTalla);
            if (!tallaExists)
                return (false, "La talla especificada no existe");

            // Validar Categoria
            var categoriaExists = await _context.Categorias.AnyAsync(c => c.IdCategoria == dto.Categoria_IdCategoria);
            if (!categoriaExists)
                return (false, "La categoría especificada no existe");

            // Validar Familia
            var familiaExists = await _context.Familias.AnyAsync(f => f.IdFamilia == dto.Familia_IdFamilia);
            if (!familiaExists)
                return (false, "La familia especificada no existe");

            // Validar Linea
            var lineaExists = await _context.Lineas.AnyAsync(l => l.IdLinea == dto.Linea_IdLinea);
            if (!lineaExists)
                return (false, "La línea especificada no existe");

            return (true, string.Empty);
        }

        private async Task<(bool IsValid, string ErrorMessage)> ValidateReferencesAsync(UpdateProductoDto dto)
        {
            // Validar Color
            var colorExists = await _context.Colores.AnyAsync(c => c.IdColor == dto.Color_IdColor);
            if (!colorExists)
                return (false, "El color especificado no existe");

            // Validar Talla
            var tallaExists = await _context.Tallas.AnyAsync(t => t.IdTalla == dto.Talla_IdTalla);
            if (!tallaExists)
                return (false, "La talla especificada no existe");

            // Validar Categoria
            var categoriaExists = await _context.Categorias.AnyAsync(c => c.IdCategoria == dto.Categoria_IdCategoria);
            if (!categoriaExists)
                return (false, "La categoría especificada no existe");

            // Validar Familia
            var familiaExists = await _context.Familias.AnyAsync(f => f.IdFamilia == dto.Familia_IdFamilia);
            if (!familiaExists)
                return (false, "La familia especificada no existe");

            // Validar Linea
            var lineaExists = await _context.Lineas.AnyAsync(l => l.IdLinea == dto.Linea_IdLinea);
            if (!lineaExists)
                return (false, "La línea especificada no existe");

            return (true, string.Empty);
        }

        private async Task AddMaterialesToProductoAsync(int productoId, List<ProductoMaterialDto> materiales)
        {
            foreach (var materialDto in materiales)
            {
                var productoMaterial = new ProductoMaterial
                {
                    Producto_IdProducto = productoId,
                    Material_IdMaterial = materialDto.Material_IdMaterial,
                    CantidadRequerida = materialDto.CantidadRequerida,
                    Notas = materialDto.Notas
                };

                _context.ProductoMateriales.Add(productoMaterial);
            }

            await _context.SaveChangesAsync();
        }

        private async Task UpdateProductoMaterialesAsync(int productoId, List<ProductoMaterialDto> nuevosMateriales)
        {
            // Eliminar relaciones existentes
            var existingMateriales = await _context.ProductoMateriales
                .Where(pm => pm.Producto_IdProducto == productoId)
                .ToListAsync();

            _context.ProductoMateriales.RemoveRange(existingMateriales);

            // Agregar nuevas relaciones
            await AddMaterialesToProductoAsync(productoId, nuevosMateriales);
        }

        #endregion
    }
}
