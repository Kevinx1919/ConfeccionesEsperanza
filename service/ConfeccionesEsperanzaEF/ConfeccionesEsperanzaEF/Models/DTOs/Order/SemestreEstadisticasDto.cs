namespace ConfeccionesEsperanzaEF.Models.DTOs.Order
{
    public class SemestreEstadisticasDto
    {
        public int Year { get; set; }
        public Dictionary<string, SemestreDataDto> Data { get; set; } = new();
    }

    public class SemestreDataDto
    {
        public string Periodo { get; set; } = string.Empty;
        public int TotalPedidos { get; set; }
        public decimal TotalVentas { get; set; }
        public int PedidosCompletados { get; set; }
        public int PedidosCancelados { get; set; }
    }
}
