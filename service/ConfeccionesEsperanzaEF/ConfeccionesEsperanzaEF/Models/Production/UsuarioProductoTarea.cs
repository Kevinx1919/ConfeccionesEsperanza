using ConfeccionesEsperanzaEF.Models.Product;
using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ConfeccionesEsperanzaEF.Models.Common;

namespace ConfeccionesEsperanzaEF.Models.Production
{
    [Table("UsuarioProductoTarea")]
    public class UsuarioProductoTarea
    {
        [Key]
        public int Id { get; set; }

        // Foreign Keys
        [StringLength(450)]
        public string Usuario_IdUsuario { get; set; } = string.Empty;

        public int Producto_IdProducto { get; set; }
        public int Tarea_IdTarea { get; set; }

        public DateTime FechaInicio { get; set; }
        public DateTime? FechaFin { get; set; }

        [Required]
        public EstadoTarea Estado { get; set; } = EstadoTarea.Pendiente;

        // Navigation properties
        [ForeignKey("Usuario_IdUsuario")]
        public virtual IdentityUser Usuario { get; set; } = null!;

        [ForeignKey("Producto_IdProducto")]
        public virtual Producto Producto { get; set; } = null!;

        [ForeignKey("Tarea_IdTarea")]
        public virtual Tarea Tarea { get; set; } = null!;

        // Computed properties
        [NotMapped]
        public TimeSpan? DuracionTrabajo => FechaFin.HasValue ? FechaFin.Value - FechaInicio : null;

        [NotMapped]
        public bool EstaVencida => FechaFin.HasValue && DateTime.Now > FechaFin.Value && Estado != EstadoTarea.Completada;

        // Timestamps
        public DateTime? FechaCreacion { get; set; } = DateTime.UtcNow;
        public DateTime? FechaActualizacion { get; set; }
    }
}
