namespace ConfeccionesEsperanzaEF.Models.DTOs.Product
{
    public class ProductoInfoDto
    {
        public int IdProducto { get; set; }
        public string NombreProducto { get; set; } = string.Empty;
        public string DescripcionProducto { get; set; } = string.Empty;
        public string NombreCompleto { get; set; } = string.Empty;

        // Color
        public int Color_IdColor { get; set; }
        public string ColorDescripcion { get; set; } = string.Empty;

        // Talla
        public int Talla_IdTalla { get; set; }
        public string TallaDescripcion { get; set; } = string.Empty;

        // Categoria
        public int Categoria_IdCategoria { get; set; }
        public string CategoriaDescripcion { get; set; } = string.Empty;

        // Familia
        public int Familia_IdFamilia { get; set; }
        public string FamiliaDescripcion { get; set; } = string.Empty;

        // Linea
        public int Linea_IdLinea { get; set; }
        public string LineaDescripcion { get; set; } = string.Empty;

        // Materiales asociados
        public List<ProductoMaterialInfoDto> Materiales { get; set; } = new();

        public DateTime FechaCreacion { get; set; }
        public DateTime? FechaActualizacion { get; set; }
    }
}
