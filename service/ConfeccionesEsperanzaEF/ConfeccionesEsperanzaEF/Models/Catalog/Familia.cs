using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConfeccionesEsperanzaEF.Models.Catalog
{
    [Table("Familia")]
    public class Familia
    {
        [Key]
        public int IdFamilia { get; set; }

        [Required]
        [StringLength(450)]
        public string DescripcionFamilia { get; set; } = string.Empty;

        // Navigation properties
        public virtual ICollection<Product.Producto> Productos { get; set; } = new List<Product.Producto>();
    }
}
