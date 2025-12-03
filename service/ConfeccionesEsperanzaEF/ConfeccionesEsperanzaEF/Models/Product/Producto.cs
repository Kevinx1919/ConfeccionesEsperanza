using ConfeccionesEsperanzaEF.Models.Catalog;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ConfeccionesEsperanzaEF.Models.Order;
using ConfeccionesEsperanzaEF.Models.Production;

namespace ConfeccionesEsperanzaEF.Models.Product
{
    [Table("Producto")]
    public class Producto
    {
        [Key]
        public int IdProducto { get; set; }

        [Required]
        [StringLength(45)]
        public string NombreProducto { get; set; } = string.Empty;

        [Required]
        [StringLength(450)]
        public string DescripcionProducto { get; set; } = string.Empty;

        // Foreign Keys
        public int Color_IdColor { get; set; }
        public int Talla_IdTalla { get; set; }
        public int Categoria_IdCategoria { get; set; }
        public int Familia_IdFamilia { get; set; }
        public int Linea_IdLinea { get; set; }

        // Navigation properties
        [ForeignKey("Color_IdColor")]
        public virtual Color Color { get; set; } = null!;

        [ForeignKey("Talla_IdTalla")]
        public virtual Talla Talla { get; set; } = null!;

        [ForeignKey("Categoria_IdCategoria")]
        public virtual Categoria Categoria { get; set; } = null!;

        [ForeignKey("Familia_IdFamilia")]
        public virtual Familia Familia { get; set; } = null!;

        [ForeignKey("Linea_IdLinea")]
        public virtual Linea Linea { get; set; } = null!;

        public virtual ICollection<DetallePedido> DetallesPedido { get; set; } = new List<DetallePedido>();
        public virtual ICollection<ProductoMaterial> ProductoMateriales { get; set; } = new List<ProductoMaterial>();
        public virtual ICollection<UsuarioProductoTarea> UsuarioProductoTareas { get; set; } = new List<UsuarioProductoTarea>();

        // Computed property
        [NotMapped]
        public string NombreCompleto => $"{NombreProducto} - {Color.DescripcionColor} - {Talla.DescripcionTalla}";

        // Timestamps
        public DateTime? FechaCreacion { get; set; } = DateTime.UtcNow;
        public DateTime? FechaActualizacion { get; set; }
    }
}
