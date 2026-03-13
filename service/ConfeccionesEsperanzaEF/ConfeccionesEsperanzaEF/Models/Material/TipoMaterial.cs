using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConfeccionesEsperanzaEF.Models.Material
{
    [Table("TipoMaterial")]
    public class TipoMaterial
    {
        [Key]
        public int IdTipoMaterial { get; set; }

        [Required]
        [StringLength(450)]
        public string DescripcionMaterial { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,2)")]
        public decimal UnidadMedida { get; set; }

        // Navigation properties
        public virtual ICollection<Material> Materiales { get; set; } = new List<Material>();
    }
}
