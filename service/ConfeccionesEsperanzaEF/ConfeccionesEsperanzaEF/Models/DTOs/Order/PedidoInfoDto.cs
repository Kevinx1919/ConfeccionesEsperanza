using ConfeccionesEsperanzaEF.Models.Common;

namespace ConfeccionesEsperanzaEF.Models.DTOs.Order
{
    public class PedidoInfoDto
    {
        public int IdPedido { get; set; }
        public DateTime FechaRegistro { get; set; }
        public DateTime FechaEntrega { get; set; }
        public EstadoPedido Estado { get; set; }
        public string EstadoDescripcion { get; set; } = string.Empty;

        // Cliente
        public int Cliente_IdCliente { get; set; }
        public string ClienteNombre { get; set; } = string.Empty;
        public string ClienteEmail { get; set; } = string.Empty;

        // Detalles del pedido
        public List<DetallePedidoInfoDto> DetallesPedido { get; set; } = new();

        // Totales calculados
        public decimal TotalPedido { get; set; }
        public int TotalItems { get; set; }
        public bool EstaVencido { get; set; }

        public DateTime FechaCreacion { get; set; }
        public DateTime? FechaActualizacion { get; set; }
    }
}
