using System.ComponentModel.DataAnnotations;

namespace ConfeccionesEsperanzaEF.Models.DTOs.Production
{
    public class CreateTareaDto
    {
        [Required(ErrorMessage = "El nombre de la tarea es obligatorio")]
        [StringLength(100, ErrorMessage = "El nombre no puede exceder los 100 caracteres")]
        public string NombreTarea { get; set; } = string.Empty;

        [StringLength(1000, ErrorMessage = "La descripción no puede exceder los 1000 caracteres")]
        public string? Descripcion { get; set; }

        [StringLength(1000, ErrorMessage = "Los comentarios no pueden exceder los 1000 caracteres")]
        public string? Comentarios { get; set; }
    }
}
