using System.ComponentModel.DataAnnotations;

namespace ConfeccionesEsperanzaEF.Models.DTOs.Production
{
    public class AsignarTareasMasivasDto
    {
        [Required(ErrorMessage = "Debe especificar al menos un usuario")]
        public List<string> UsuariosIds { get; set; } = new();

        [Required(ErrorMessage = "Debe especificar al menos un producto")]
        public List<int> ProductosIds { get; set; } = new();

        [Required(ErrorMessage = "Debe especificar al menos una tarea")]
        public List<int> TareasIds { get; set; } = new();

        public DateTime FechaInicio { get; set; } = DateTime.UtcNow;
        public DateTime? FechaFinEstimada { get; set; }

    }
}
