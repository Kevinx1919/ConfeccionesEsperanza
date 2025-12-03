using System.ComponentModel.DataAnnotations;

namespace ConfeccionesEsperanzaEF.Models.DTOs.Product
{
    public class CreateProductoDto
    {
        [Required(ErrorMessage = "El nombre del producto es obligatorio")]
        [StringLength(45, ErrorMessage = "El nombre no puede exceder los 45 caracteres")]
        public string NombreProducto { get; set; } = string.Empty;

        [Required(ErrorMessage = "La descripción del producto es obligatoria")]
        [StringLength(450, ErrorMessage = "La descripción no puede exceder los 450 caracteres")]
        public string DescripcionProducto { get; set; } = string.Empty;

        [Required(ErrorMessage = "El color es obligatorio")]
        public int Color_IdColor { get; set; }

        [Required(ErrorMessage = "La talla es obligatoria")]
        public int Talla_IdTalla { get; set; }

        [Required(ErrorMessage = "La categoría es obligatoria")]
        public int Categoria_IdCategoria { get; set; }

        [Required(ErrorMessage = "La familia es obligatoria")]
        public int Familia_IdFamilia { get; set; }

        [Required(ErrorMessage = "La línea es obligatoria")]
        public int Linea_IdLinea { get; set; }

        // Lista de materiales con cantidades requeridas
        public List<ProductoMaterialDto> Materiales { get; set; } = new();
    }
}
