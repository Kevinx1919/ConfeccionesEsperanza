namespace ConfeccionesEsperanzaEF.Models.DTOs.Production
{
    public class TareaInfoDto
    {
        public int IdTarea { get; set; }
        public string NombreTarea { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public string? Comentarios { get; set; }
        public DateTime FechaCreacion { get; set; }
        public DateTime? FechaActualizacion { get; set; }
        public int AsignacionesActivas { get; set; }
        public int AsignacionesCompletadas { get; set; }
    }
}
