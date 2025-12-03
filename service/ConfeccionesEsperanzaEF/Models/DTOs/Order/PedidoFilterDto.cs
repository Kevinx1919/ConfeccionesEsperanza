using ConfeccionesEsperanzaEF.Models.Common;

namespace ConfeccionesEsperanzaEF.Models.DTOs.Order
{
    public class PedidoFilterDto
    {
        public int? ClienteId { get; set; }
        public EstadoPedido? Estado { get; set; }
        public DateTime? FechaDesde { get; set; }
        public DateTime? FechaHasta { get; set; }
        public bool? EstaVencido { get; set; }
        public decimal? MontoMinimo { get; set; }
        public decimal? MontoMaximo { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}
