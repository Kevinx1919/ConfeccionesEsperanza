namespace ConfeccionesEsperanzaEF.Models.DTOs.Order
{
    public class PedidoResponseDto
    {
        public bool IsSuccess { get; set; }
        public string Message { get; set; } = string.Empty;
        public PedidoInfoDto? Pedido { get; set; }
    }
}
