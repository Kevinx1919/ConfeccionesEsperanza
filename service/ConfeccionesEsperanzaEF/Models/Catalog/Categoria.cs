using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConfeccionesEsperanzaEF.Models.Catalog
{
    [Table("Categoria")]
    public class Categoria
    {
        [Key]
        public int IdCategoria { get; set; }

        [Required]
        [StringLength(450)]
        public string DescripcionCategoria { get; set; } = string.Empty;

        // Navigation properties
        public virtual ICollection<Product.Producto> Productos { get; set; } = new List<Product.Producto>();
    }
}
