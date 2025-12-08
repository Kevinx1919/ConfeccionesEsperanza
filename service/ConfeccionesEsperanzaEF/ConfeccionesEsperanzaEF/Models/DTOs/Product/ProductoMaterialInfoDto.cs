namespace ConfeccionesEsperanzaEF.Models.DTOs.Product
{
    public class ProductoMaterialInfoDto
    {
        public int Id { get; set; }
        public int Material_IdMaterial { get; set; }
        public string MaterialNombre { get; set; } = string.Empty;
        public string TipoMaterialDescripcion { get; set; } = string.Empty;
        public string ColorDescripcion { get; set; } = string.Empty;
        public decimal CantidadRequerida { get; set; }
        public string? Notas { get; set; }
        public DateTime FechaCreacion { get; set; }
    }
}
