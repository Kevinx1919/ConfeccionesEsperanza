namespace ConfeccionesEsperanzaEF.Models.DTOs.Material
{
    public class TipoMaterialInfoDto
    {
        public int IdTipoMaterial { get; set; }
        public string DescripcionMaterial { get; set; } = string.Empty;
        public decimal UnidadMedida { get; set; }
    }
}
