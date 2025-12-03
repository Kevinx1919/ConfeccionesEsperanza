using System.ComponentModel.DataAnnotations;

namespace ConfeccionesEsperanzaEF.Models.DTOs.Material
{
    public class CreateMaterialDto
    {
        [Required(ErrorMessage = "El nombre del material es obligatorio")]
        [StringLength(45, ErrorMessage = "El nombre no puede exceder los 45 caracteres")]
        public string Nombre { get; set; } = string.Empty;

        [Required(ErrorMessage = "La cantidad es obligatoria")]
        [Range(0, int.MaxValue, ErrorMessage = "La cantidad debe ser un número positivo")]
        public int Cantidad { get; set; }

        [Required(ErrorMessage = "La fecha de entrada es obligatoria")]
        public DateTime FechaEntrada { get; set; } = DateTime.UtcNow;

        [StringLength(45, ErrorMessage = "El proveedor no puede exceder los 45 caracteres")]
        public string? Proveedor { get; set; }

        [Required(ErrorMessage = "El tipo de material es obligatorio")]
        public int TipoMaterial_IdTipoMaterial { get; set; }

        [Required(ErrorMessage = "El color es obligatorio")]
        public int Color_IdColor { get; set; }
    }
}
