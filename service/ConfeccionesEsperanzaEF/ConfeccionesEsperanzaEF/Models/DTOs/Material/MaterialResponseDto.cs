namespace ConfeccionesEsperanzaEF.Models.DTOs.Material
{
    public class MaterialResponseDto
    {
        public bool IsSuccess { get; set; }
        public string Message { get; set; } = string.Empty;
        public MaterialInfoDto? Material { get; set; }
    }
}
