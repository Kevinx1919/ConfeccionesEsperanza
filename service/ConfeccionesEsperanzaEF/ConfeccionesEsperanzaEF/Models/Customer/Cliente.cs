using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ConfeccionesEsperanzaEF.Models.Order;

namespace ConfeccionesEsperanzaEF.Models.Customer
{
    [Table("Cliente")]
    public class Cliente
    {
        [Key]
        public int IdCliente { get; set; }

        [Required]
        [StringLength(45)]
        public string NombreCliente { get; set; } = string.Empty;

        [Required]
        [StringLength(45)]
        public string ApellidoCliente { get; set; } = string.Empty;

        [Required]
        [StringLength(45)]
        [EmailAddress]
        public string EmailCliente { get; set; } = string.Empty;

        [StringLength(45)]
        public string? TelefonoCliente { get; set; }

        public int NumeroDocCliente { get; set; }

        [StringLength(450)]
        public string? DireccionCliente { get; set; }

        [StringLength(45)]
        public string? CodigoPostalCliente { get; set; }

        // Computed property
        [NotMapped]
        public string NombreCompleto => $"{NombreCliente} {ApellidoCliente}";

        // Navigation properties
        public virtual ICollection<Pedidos> Pedidos { get; set; } = new List<Pedidos>();

        // Timestamps
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
        public DateTime? FechaActualizacion { get; set; }
    }
}
