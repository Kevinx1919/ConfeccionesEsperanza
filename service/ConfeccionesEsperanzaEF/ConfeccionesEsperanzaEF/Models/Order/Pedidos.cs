using ConfeccionesEsperanzaEF.Models.Customer;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ConfeccionesEsperanzaEF.Models.Common;

namespace ConfeccionesEsperanzaEF.Models.Order
{
    [Table("Pedidos")]
    public class Pedidos
    {
        [Key]
        public int IdPedido { get; set; }

        public DateTime? FechaRegistro { get; set; } = DateTime.UtcNow;

        public DateTime FechaEntrega { get; set; }

        [Required]
        public EstadoPedido Estado { get; set; } = EstadoPedido.Pendiente;

        // Foreign Keys
        public int Cliente_IdCliente { get; set; }

        // Navigation properties
        [ForeignKey("Cliente_IdCliente")]
        public virtual Cliente Cliente { get; set; } = null!;

        public virtual ICollection<DetallePedido> DetallesPedido { get; set; } = new List<DetallePedido>();

        // Computed properties
        [NotMapped]
        public decimal TotalPedido => DetallesPedido.Sum(dp => dp.Subtotal);

        [NotMapped]
        public int TotalItems => DetallesPedido.Sum(dp => dp.Cantidad);

        [NotMapped]
        public bool EstaVencido => FechaEntrega < DateTime.Now && Estado != EstadoPedido.Completado;

        // Timestamps
        public DateTime? FechaCreacion { get; set; } = DateTime.UtcNow;
        public DateTime? FechaActualizacion { get; set; }
    }
}
