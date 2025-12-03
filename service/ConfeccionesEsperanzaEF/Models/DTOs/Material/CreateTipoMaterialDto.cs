using System.ComponentModel.DataAnnotations;

namespace ConfeccionesEsperanzaEF.Models.DTOs.Material
{
    public class CreateTipoMaterialDto
    {
        [Required(ErrorMessage = "La descripción del material es obligatoria")]
        [StringLength(450, ErrorMessage = "La descripción no puede exceder los 450 caracteres")]
        public string DescripcionMaterial { get; set; } = string.Empty;

        [Required(ErrorMessage = "La unidad de medida es obligatoria")]
        [Range(0.01, 999999.99, ErrorMessage = "La unidad de medida debe ser un valor positivo")]
        public decimal UnidadMedida { get; set; }
    }
}
