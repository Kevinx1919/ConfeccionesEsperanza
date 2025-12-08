namespace ConfeccionesEsperanzaEF.Models.DTOs.Product
{
    public class ProductoFilterDto
    {
        public string? Nombre { get; set; }
        public int? ColorId { get; set; }
        public int? TallaId { get; set; }
        public int? CategoriaId { get; set; }
        public int? FamiliaId { get; set; }
        public int? LineaId { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}
