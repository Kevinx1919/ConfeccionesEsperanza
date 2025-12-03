using System.ComponentModel.DataAnnotations;

namespace ConfeccionesEsperanzaEF.Models.DTOs.Order
{
    public class UpdateDetallePedidoDto
    {
        public int? Id { get; set; } // Si tiene ID, se actualiza; si no, se crea nuevo

        [Required(ErrorMessage = "El producto es obligatorio")]
        public int Producto_IdProducto { get; set; }

        [Required(ErrorMessage = "La cantidad es obligatoria")]
        [Range(1, int.MaxValue, ErrorMessage = "La cantidad debe ser mayor a 0")]
        public int Cantidad { get; set; }

        [Required(ErrorMessage = "El precio unitario es obligatorio")]
        [Range(0.01, double.MaxValue, ErrorMessage = "El precio debe ser mayor a 0")]
        public decimal PrecioUnitario { get; set; }
    }
}
