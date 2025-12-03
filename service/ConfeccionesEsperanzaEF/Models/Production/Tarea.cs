using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConfeccionesEsperanzaEF.Models.Production
{
    [Table("Tarea")]
    public class Tarea
    {
        [Key]
        public int IdTarea { get; set; }

        [Required]
        [StringLength(100)]
        public string NombreTarea { get; set; } = string.Empty;

        [StringLength(1000)]
        public string? Descripcion { get; set; }

        [StringLength(1000)]
        public string? Comentarios { get; set; }

        // Navigation properties
        public virtual ICollection<UsuarioProductoTarea> UsuarioProductoTareas { get; set; } = new List<UsuarioProductoTarea>();

        // Timestamps
        public DateTime? FechaCreacion { get; set; } = DateTime.UtcNow;
        public DateTime? FechaActualizacion { get; set; }
    }
}
