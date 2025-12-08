using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConfeccionesEsperanzaEF.Models.Catalog
{
    [Table("Linea")]
    public class Linea
    {
        [Key]
        public int IdLinea { get; set; }

        [Required]
        [StringLength(450)]
        public string DescripcionLinea { get; set; } = string.Empty;

        // Navigation properties
        public virtual ICollection<Product.Producto> Productos { get; set; } = new List<Product.Producto>();
    }
}
