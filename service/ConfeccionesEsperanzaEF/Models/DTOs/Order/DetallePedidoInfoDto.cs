namespace ConfeccionesEsperanzaEF.Models.DTOs.Order
{
    public class DetallePedidoInfoDto
    {
        public int Id { get; set; }
        public int Producto_IdProducto { get; set; }
        public string ProductoNombre { get; set; } = string.Empty;
        public string ProductoDescripcion { get; set; } = string.Empty;
        public string ColorDescripcion { get; set; } = string.Empty;
        public string TallaDescripcion { get; set; } = string.Empty;
        public int Cantidad { get; set; }
        public decimal PrecioUnitario { get; set; }
        public decimal Subtotal { get; set; }
        public DateTime FechaCreacion { get; set; }
    }
}
