using ConfeccionesEsperanzaEF.Models.Common;
using System.ComponentModel.DataAnnotations;

namespace ConfeccionesEsperanzaEF.Models.DTOs.Production
{
    public class UpdateUsuarioProductoTareaDto
    {
        public DateTime FechaInicio { get; set; }
        public DateTime? FechaFin { get; set; }

        [Required(ErrorMessage = "El estado es obligatorio")]
        public EstadoTarea Estado { get; set; }
    }
}
