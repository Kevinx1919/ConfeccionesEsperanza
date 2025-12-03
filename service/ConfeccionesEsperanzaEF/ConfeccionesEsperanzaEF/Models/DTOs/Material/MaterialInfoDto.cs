namespace ConfeccionesEsperanzaEF.Models.DTOs.Material
{
    public class MaterialInfoDto
    {
        public int IdMaterial { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public int Cantidad { get; set; }
        public DateTime FechaEntrada { get; set; }
        public string? Proveedor { get; set; }
        public int TipoMaterial_IdTipoMaterial { get; set; }
        public string TipoMaterialDescripcion { get; set; } = string.Empty;
        public decimal UnidadMedida { get; set; }
        public int Color_IdColor { get; set; }
        public string ColorDescripcion { get; set; } = string.Empty;
        public DateTime FechaCreacion { get; set; }
        public DateTime? FechaActualizacion { get; set; }
    }
}
