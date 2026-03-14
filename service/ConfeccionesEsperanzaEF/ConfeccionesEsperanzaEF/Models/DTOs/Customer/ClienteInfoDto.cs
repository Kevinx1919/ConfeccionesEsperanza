namespace ConfeccionesEsperanzaEF.Models.DTOs.Customer
{
    public class ClienteInfoDto
    {
        public int IdCliente { get; set; }
        public string NombreCliente { get; set; } = string.Empty;
        public string ApellidoCliente { get; set; } = string.Empty;
        public string NombreCompleto { get; set; } = string.Empty;
        public string EmailCliente { get; set; } = string.Empty;
        public string? TelefonoCliente { get; set; }
        public int NumeroDocCliente { get; set; }
        public string? DireccionCliente { get; set; }
        public string? CodigoPostalCliente { get; set; }
        public DateTime FechaCreacion { get; set; }
        public DateTime? FechaActualizacion { get; set; }
        public int TotalPedidos { get; set; }
    }
}
