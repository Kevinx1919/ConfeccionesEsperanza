using ConfeccionesEsperanzaEF.Models.Common;

namespace ConfeccionesEsperanzaEF.Models.DTOs.Order
{
    public class PedidoConProgresoDto
    {
        public int IdPedido { get; set; }
        public string ClienteNombre { get; set; } = string.Empty;
        public DateTime FechaEntrega { get; set; }
        public EstadoPedido Estado { get; set; }
        public decimal PorcentajeCompletado { get; set; }
        public int TotalTareas { get; set; }
        public int TareasCompletadas { get; set; }
        public decimal TotalPedido { get; set; }
        public string ImagenProducto { get; set; } = string.Empty; // URL o identificador de imagen
    }
}
