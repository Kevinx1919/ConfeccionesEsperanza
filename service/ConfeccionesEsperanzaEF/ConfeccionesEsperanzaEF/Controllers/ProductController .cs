using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ConfeccionesEsperanzaEF.Services;
using ConfeccionesEsperanzaEF.Models.DTOs.Product;

namespace ConfeccionesEsperanzaEF.Controllers
{
    /// <summary>
    /// Controlador para la gestión de productos
    /// Responsabilidad: CRUD de productos y gestión de materiales asociados
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    [Authorize] // Requiere autenticación para todos los endpoints
    public class ProductController : ControllerBase
    {
        private readonly IProductService _productService;
        private readonly ILogger<ProductController> _logger;

        public ProductController(IProductService productService, ILogger<ProductController> logger)
        {
            _productService = productService;
            _logger = logger;
        }

        #region Producto CRUD

        /// <summary>
        /// Obtiene todos los productos con filtros opcionales
        /// </summary>
        /// <param name="filter">Filtros de búsqueda</param>
        /// <returns>Lista paginada de productos</returns>
        [HttpGet]
        public async Task<ActionResult<ProductoListDto>> GetProductos([FromQuery] ProductoFilterDto? filter)
        {
            var result = await _productService.GetProductosAsync(filter);
            return Ok(result);
        }

        /// <summary>
        /// Obtiene un producto específico por ID
        /// </summary>
        /// <param name="id">ID del producto</param>
        /// <returns>Información detallada del producto</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<ProductoInfoDto>> GetProducto(int id)
        {
            var producto = await _productService.GetProductoByIdAsync(id);

            if (producto == null)
            {
                return NotFound(new { message = "Producto no encontrado" });
            }

            return Ok(producto);
        }

        /// <summary>
        /// Busca productos por término de búsqueda
        /// </summary>
        /// <param name="searchTerm">Término de búsqueda</param>
        /// <param name="pageNumber">Número de página</param>
        /// <param name="pageSize">Tamaño de página</param>
        /// <returns>Lista paginada de productos que coinciden con la búsqueda</returns>
        [HttpGet("search/{searchTerm}")]
        public async Task<ActionResult<ProductoListDto>> SearchProductos(string searchTerm, int pageNumber = 1, int pageSize = 10)
        {
            var result = await _productService.SearchProductosAsync(searchTerm, pageNumber, pageSize);
            return Ok(result);
        }

        /// <summary>
        /// Crea un nuevo producto
        /// </summary>
        /// <param name="createProductoDto">Datos del producto a crear</param>
        /// <returns>Información del producto creado</returns>
        [HttpPost]
        [Authorize(Roles = "Admin,Manager")] // Solo admin y managers pueden crear productos
        public async Task<ActionResult<ProductoResponseDto>> CreateProducto([FromBody] CreateProductoDto createProductoDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new ProductoResponseDto
                {
                    IsSuccess = false,
                    Message = "Datos de entrada inválidos"
                });
            }

            var result = await _productService.CreateProductoAsync(createProductoDto);

            if (result.IsSuccess)
            {
                return CreatedAtAction(nameof(GetProducto), new { id = result.Producto?.IdProducto }, result);
            }

            return BadRequest(result);
        }

        /// <summary>
        /// Actualiza un producto existente
        /// </summary>
        /// <param name="id">ID del producto a actualizar</param>
        /// <param name="updateProductoDto">Datos actualizados del producto</param>
        /// <returns>Información del producto actualizado</returns>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<ProductoResponseDto>> UpdateProducto(int id, [FromBody] UpdateProductoDto updateProductoDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new ProductoResponseDto
                {
                    IsSuccess = false,
                    Message = "Datos de entrada inválidos"
                });
            }

            var result = await _productService.UpdateProductoAsync(id, updateProductoDto);

            if (result.IsSuccess)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }

        /// <summary>
        /// Elimina un producto
        /// </summary>
        /// <param name="id">ID del producto a eliminar</param>
        /// <returns>Confirmación de eliminación</returns>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")] // Solo admin puede eliminar productos
        public async Task<ActionResult<ProductoResponseDto>> DeleteProducto(int id)
        {
            var result = await _productService.DeleteProductoAsync(id);

            if (result.IsSuccess)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }

        #endregion

        #region Gestión de Materiales del Producto

        /// <summary>
        /// Agrega un material a un producto
        /// </summary>
        /// <param name="id">ID del producto</param>
        /// <param name="materialDto">Datos del material a agregar</param>
        /// <returns>Confirmación de agregado</returns>
        [HttpPost("{id}/materials")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<ProductoResponseDto>> AddMaterialToProducto(int id, [FromBody] ProductoMaterialDto materialDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new ProductoResponseDto
                {
                    IsSuccess = false,
                    Message = "Datos de entrada inválidos"
                });
            }

            var result = await _productService.AddMaterialToProductoAsync(id, materialDto);

            if (result.IsSuccess)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }

        /// <summary>
        /// Remueve un material de un producto
        /// </summary>
        /// <param name="id">ID del producto</param>
        /// <param name="materialId">ID del material a remover</param>
        /// <returns>Confirmación de eliminación</returns>
        [HttpDelete("{id}/materials/{materialId}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ProductoResponseDto>> RemoveMaterialFromProducto(int id, int materialId)
        {
            var result = await _productService.RemoveMaterialFromProductoAsync(id, materialId);

            if (result.IsSuccess)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }

        #endregion
    }
}