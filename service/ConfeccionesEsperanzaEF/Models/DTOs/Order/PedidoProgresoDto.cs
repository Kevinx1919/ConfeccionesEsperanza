namespace ConfeccionesEsperanzaEF.Models.DTOs.Order
{
    public class PedidoProgresoDto
    {
        public int IdPedido { get; set; }
        public int TotalTareas { get; set; }
        public int TareasCompletadas { get; set; }
        public int TareasPendientes { get; set; }
        public int TareasEnProceso { get; set; }
        public decimal PorcentajeCompletado { get; set; }
        public DateTime FechaEntrega { get; set; }
        public TimeSpan TiempoRestante { get; set; }
        public int DiasRestantes { get; set; }
        public int HorasRestantes { get; set; }
        public int MinutosRestantes { get; set; }
        public bool EstaVencido { get; set; }
    }
}
