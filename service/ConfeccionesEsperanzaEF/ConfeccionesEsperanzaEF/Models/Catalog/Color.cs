using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConfeccionesEsperanzaEF.Models.Catalog
{
    [Table("Color")]
    public class Color
    {
        [Key]
        public int IdColor { get; set; }

        [Required]
        [StringLength(450)]
        public string DescripcionColor { get; set; } = string.Empty;

        // Navigation properties
        public virtual ICollection<Product.Producto> Productos { get; set; } = new List<Product.Producto>();
        public virtual ICollection<Material.Material> Materiales { get; set; } = new List<Material.Material>();
    }
}
