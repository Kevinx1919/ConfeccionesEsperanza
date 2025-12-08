namespace ConfeccionesEsperanzaEF.Models.DTOs.Product
{
    public class ProductoResponseDto
    {
        public bool IsSuccess { get; set; }
        public string Message { get; set; } = string.Empty;
        public ProductoInfoDto? Producto { get; set; }
    }
}
