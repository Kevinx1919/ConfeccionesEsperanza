using ConfeccionesEsperanzaEF.Models.Product;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConfeccionesEsperanzaEF.Models.Order
{
    [Table("DetallePedido")]
    public class DetallePedido
    {
        [Key]
        public int Id { get; set; }

        // Foreign Keys
        public int Producto_IdProducto { get; set; }
        public int Pedido_IdPedido { get; set; }

        public int Cantidad { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal PrecioUnitario { get; set; }

        // Navigation properties
        [ForeignKey("Producto_IdProducto")]
        public virtual Producto Producto { get; set; } = null!;

        [ForeignKey("Pedido_IdPedido")]
        public virtual Pedidos Pedido { get; set; } = null!;

        // Computed properties
        [NotMapped]
        public decimal Subtotal => Cantidad * PrecioUnitario;

        // Timestamps
        public DateTime? FechaCreacion { get; set; } = DateTime.UtcNow;
        public DateTime? FechaActualizacion { get; set; }
    }
}
