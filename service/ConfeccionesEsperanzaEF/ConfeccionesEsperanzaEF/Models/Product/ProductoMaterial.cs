using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConfeccionesEsperanzaEF.Models.Product
{
    [Table("ProductoMaterial")]
    public class ProductoMaterial
    {
        [Key]
        public int Id { get; set; }

        // Foreign Keys
        public int Material_IdMaterial { get; set; }
        public int Producto_IdProducto { get; set; }

        // Navigation properties
        [ForeignKey("Material_IdMaterial")]
        public virtual Material.Material Material { get; set; } = null!;

        [ForeignKey("Producto_IdProducto")]
        public virtual Producto Producto { get; set; } = null!;

        // Additional properties for the relationship
        public decimal CantidadRequerida { get; set; }

        [StringLength(100)]
        public string? Notas { get; set; }

        // Timestamps
        public DateTime? FechaCreacion { get; set; } = DateTime.UtcNow;
        public DateTime? FechaActualizacion { get; set; }
    }
}
