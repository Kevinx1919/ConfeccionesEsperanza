using ConfeccionesEsperanzaEF.Models.Common;
using System.ComponentModel.DataAnnotations;

namespace ConfeccionesEsperanzaEF.Models.DTOs.Production
{
    public class CreateUsuarioProductoTareaDto
    {
        [Required(ErrorMessage = "El usuario es obligatorio")]
        public string Usuario_IdUsuario { get; set; } = string.Empty;

        [Required(ErrorMessage = "El producto es obligatorio")]
        public int Producto_IdProducto { get; set; }

        [Required(ErrorMessage = "La tarea es obligatoria")]
        public int Tarea_IdTarea { get; set; }

        [Required(ErrorMessage = "La fecha de inicio es obligatoria")]
        public DateTime FechaInicio { get; set; } = DateTime.UtcNow;

        public DateTime? FechaFin { get; set; }

        public EstadoTarea Estado { get; set; } = EstadoTarea.Pendiente;
    }
}
