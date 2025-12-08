namespace ConfeccionesEsperanzaEF.Models.DTOs.Order
{
    public class DashboardMetricasDto
    {
        public PedidoConProgresoDto? ProximoPedido { get; set; }
        public PedidoProgresoDto? ProgresoProximoPedido { get; set; }
        public List<PedidoConProgresoDto> PedidosPendientes { get; set; } = new();
        public Dictionary<string, int> PedidosPorSemestre { get; set; } = new();
        public int TotalPedidosActivos { get; set; }
        public int TotalPedidosVencidos { get; set; }
        public decimal PromedioCompletado { get; set; }
    }
}
