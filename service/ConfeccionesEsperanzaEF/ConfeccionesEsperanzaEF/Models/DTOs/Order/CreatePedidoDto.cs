using ConfeccionesEsperanzaEF.Models.Common;
using System.ComponentModel.DataAnnotations;

namespace ConfeccionesEsperanzaEF.Models.DTOs.Order
{
    public class CreatePedidoDto
    {
        [Required(ErrorMessage = "El cliente es obligatorio")]
        public int Cliente_IdCliente { get; set; }

        [Required(ErrorMessage = "La fecha de entrega es obligatoria")]
        public DateTime FechaEntrega { get; set; }

        public EstadoPedido Estado { get; set; } = EstadoPedido.Pendiente;

        [Required(ErrorMessage = "Debe incluir al menos un producto")]
        public List<CreateDetallePedidoDto> DetallesPedido { get; set; } = new();
    }
}
