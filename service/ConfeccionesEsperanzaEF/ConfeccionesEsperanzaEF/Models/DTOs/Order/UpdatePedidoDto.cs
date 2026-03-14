using ConfeccionesEsperanzaEF.Models.Common;
using System.ComponentModel.DataAnnotations;

namespace ConfeccionesEsperanzaEF.Models.DTOs.Order
{
    public class UpdatePedidoDto
    {
        [Required(ErrorMessage = "El cliente es obligatorio")]
        public int Cliente_IdCliente { get; set; }

        [Required(ErrorMessage = "La fecha de entrega es obligatoria")]
        public DateTime FechaEntrega { get; set; }

        [Required(ErrorMessage = "El estado es obligatorio")]
        public EstadoPedido Estado { get; set; }

        [Required(ErrorMessage = "Debe incluir al menos un producto")]
        public List<UpdateDetallePedidoDto> DetallesPedido { get; set; } = new();
    }
}
