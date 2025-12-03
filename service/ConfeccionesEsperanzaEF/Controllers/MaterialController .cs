using ConfeccionesEsperanzaEF.Models.DTOs.Material;
using ConfeccionesEsperanzaEF.Models.Material;
using ConfeccionesEsperanzaEF.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ConfeccionesEsperanzaEF.Controllers
{
    /// <summary>
    /// Controlador para la gestión de materiales e inventario
    /// Responsabilidad: CRUD de materiales y tipos de material
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    [Authorize] // Requiere autenticación para todos los endpoints
    public class MaterialController : ControllerBase
    {
        private readonly IMaterialService _materialService;
        private readonly ILogger<MaterialController> _logger;

        public MaterialController(IMaterialService materialService, ILogger<MaterialController> logger)
        {
            _materialService = materialService;
            _logger = logger;
        }

        #region Material CRUD

        /// <summary>
        /// Obtiene todos los materiales con paginación y búsqueda
        /// </summary>
        /// <param name="pageNumber">Número de página (default: 1)</param>
        /// <param name="pageSize">Tamaño de página (default: 10)</param>
        /// <param name="searchTerm">Término de búsqueda opcional</param>
        /// <returns>Lista paginada de materiales</returns>
        [HttpGet]
        public async Task<ActionResult<MaterialListDto>> GetMateriales(/*int pageNumber = 1, int pageSize = 10,*/ string? searchTerm = null)
        {
            var result = await _materialService.GetMaterialsAsync(/*pageNumber, pageSize, */searchTerm);
            var MaterialOrdenado = result.Materiales.OrderBy(m => m.IdMaterial).ToList();
            result.Materiales = MaterialOrdenado;
            return Ok(result);
        }

        /// <summary>
        /// Obtiene un material específico por ID
        /// </summary>
        /// <param name="id">ID del material</param>
        /// <returns>Información detallada del material</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<MaterialInfoDto>> GetMaterial(int id)
        {
            var material = await _materialService.GetMaterialByIdAsync(id);

            if (material == null)
            {
                return NotFound(new { message = "Material no encontrado" });
            }

            return Ok(material);
        }

        /// <summary>
        /// Obtiene materiales por tipo de material
        /// </summary>
        /// <param name="tipoId">ID del tipo de material</param>
        /// <param name="pageNumber">Número de página</param>
        /// <param name="pageSize">Tamaño de página</param>
        /// <returns>Lista paginada de materiales del tipo especificado</returns>
        [HttpGet("by-type/{tipoId}")]
        public async Task<ActionResult<MaterialListDto>> GetMaterialesByTipo(int tipoId/*, int pageNumber = 1, int pageSize = 10*/)
        {
            var result = await _materialService.GetMaterialsByTipoAsync(tipoId/*, pageNumber, pageSize*/);
            return Ok(result);
        }

        /// <summary>
        /// Crea un nuevo material
        /// </summary>
        /// <param name="createMaterialDto">Datos del material a crear</param>
        /// <returns>Información del material creado</returns>
        [HttpPost]
        [Authorize(Roles = "Admin,Manager")] // Solo admin y managers pueden crear
        public async Task<ActionResult<MaterialResponseDto>> CreateMaterial([FromBody] CreateMaterialDto createMaterialDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new MaterialResponseDto
                {
                    IsSuccess = false,
                    Message = "Datos de entrada inválidos"
                });
            }

            var result = await _materialService.CreateMaterialAsync(createMaterialDto);

            if (result.IsSuccess)
            {
                return CreatedAtAction(nameof(GetMaterial), new { id = result.Material?.IdMaterial }, result);
            }

            return BadRequest(result);
        }

        /// <summary>
        /// Actualiza un material existente
        /// </summary>
        /// <param name="id">ID del material a actualizar</param>
        /// <param name="updateMaterialDto">Datos actualizados del material</param>
        /// <returns>Información del material actualizado</returns>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<MaterialResponseDto>> UpdateMaterial(int id, [FromBody] UpdateMaterialDto updateMaterialDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new MaterialResponseDto
                {
                    IsSuccess = false,
                    Message = "Datos de entrada inválidos"
                });
            }

            var result = await _materialService.UpdateMaterialAsync(id, updateMaterialDto);

            if (result.IsSuccess)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }

        /// <summary>
        /// Elimina un material
        /// </summary>
        /// <param name="id">ID del material a eliminar</param>
        /// <returns>Confirmación de eliminación</returns>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")] // Solo admin puede eliminar
        public async Task<ActionResult<MaterialResponseDto>> DeleteMaterial(int id)
        {
            var result = await _materialService.DeleteMaterialAsync(id);

            if (result.IsSuccess)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }

        #endregion

        #region Tipo Material Management

        /// <summary>
        /// Obtiene todos los tipos de material
        /// </summary>
        /// <returns>Lista de tipos de material</returns>
        [HttpGet("tipos")]
        public async Task<ActionResult<List<TipoMaterialInfoDto>>> GetTiposMaterial()
        {
            var tipos = await _materialService.GetTiposMaterialAsync();
            return Ok(tipos);
        }

        /// <summary>
        /// Crea un nuevo tipo de material
        /// </summary>
        /// <param name="createTipoDto">Datos del tipo de material a crear</param>
        /// <returns>Confirmación de creación</returns>
        [HttpPost("tipos")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<MaterialResponseDto>> CreateTipoMaterial([FromBody] CreateTipoMaterialDto createTipoDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new MaterialResponseDto
                {
                    IsSuccess = false,
                    Message = "Datos de entrada inválidos"
                });
            }

            var result = await _materialService.CreateTipoMaterialAsync(createTipoDto);

            if (result.IsSuccess)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }

        #endregion
    }
}
