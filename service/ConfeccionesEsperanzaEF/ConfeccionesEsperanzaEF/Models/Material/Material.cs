using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ConfeccionesEsperanzaEF.Models.Catalog;
using ConfeccionesEsperanzaEF.Models.Product;

namespace ConfeccionesEsperanzaEF.Models.Material
{
    [Table("Material")]
    public class Material
    {
        [Key]
        public int IdMaterial { get; set; }

        [Required]
        [StringLength(45)]
        public string Nombre { get; set; } = string.Empty;

        public int Cantidad { get; set; }

        public DateTime FechaEntrada { get; set; }

        [StringLength(45)]
        public string? Proveedor { get; set; }

        // Foreign Keys
        public int TipoMaterial_IdTipoMaterial { get; set; }
        public int Color_IdColor { get; set; }

        // Navigation properties
        [ForeignKey("TipoMaterial_IdTipoMaterial")]
        public virtual TipoMaterial TipoMaterial { get; set; } = null!;

        [ForeignKey("Color_IdColor")]
        public virtual Color Color { get; set; } = null!;

        public virtual ICollection<ProductoMaterial> ProductoMateriales { get; set; } = new List<ProductoMaterial>();

        // Timestamps
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
        public DateTime? FechaActualizacion { get; set; }
    }
}
