namespace ConfeccionesEsperanzaEF.Models.DTOs.Customer
{
    public class ClienteResponseDto
    {
        public bool IsSuccess { get; set; }
        public string Message { get; set; } = string.Empty;
        public ClienteInfoDto? Cliente { get; set; }
    }
}
