using System.ComponentModel.DataAnnotations;

namespace ConfeccionesEsperanzaEF.Models.DTOs.Product
{
    public class ProductoMaterialDto
    {
        [Required(ErrorMessage = "El ID del material es obligatorio")]
        public int Material_IdMaterial { get; set; }

        [Required(ErrorMessage = "La cantidad requerida es obligatoria")]
        [Range(0.01, 999999.99, ErrorMessage = "La cantidad debe ser mayor a 0")]
        public decimal CantidadRequerida { get; set; }

        [StringLength(100, ErrorMessage = "Las notas no pueden exceder los 100 caracteres")]
        public string? Notas { get; set; }
    }
}
