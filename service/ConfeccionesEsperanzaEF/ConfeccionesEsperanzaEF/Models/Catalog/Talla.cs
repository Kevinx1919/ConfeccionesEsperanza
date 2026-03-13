using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConfeccionesEsperanzaEF.Models.Catalog
{
    [Table("Talla")]
    public class Talla
    {
        [Key]
        public int IdTalla { get; set; }

        [Required]
        [StringLength(450)]
        public string DescripcionTalla { get; set; } = string.Empty;

        // Navigation properties
        public virtual ICollection<Product.Producto> Productos { get; set; } = new List<Product.Producto>();
    }
}
