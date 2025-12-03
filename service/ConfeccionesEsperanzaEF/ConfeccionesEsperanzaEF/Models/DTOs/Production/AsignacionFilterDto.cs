using ConfeccionesEsperanzaEF.Models.Common;

namespace ConfeccionesEsperanzaEF.Models.DTOs.Production
{
    public class AsignacionFilterDto
    {
        public string? UsuarioId { get; set; }
        public int? ProductoId { get; set; }
        public int? TareaId { get; set; }
        public EstadoTarea? Estado { get; set; }
        public DateTime? FechaDesde { get; set; }
        public DateTime? FechaHasta { get; set; }
        public bool? SoloVencidas { get; set; }
        //public int PageNumber { get; set; } = 1;
        //public int PageSize { get; set; } = 10;
    }
}
