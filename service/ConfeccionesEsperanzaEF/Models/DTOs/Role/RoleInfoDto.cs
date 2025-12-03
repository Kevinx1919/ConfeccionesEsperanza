namespace ConfeccionesEsperanzaEF.Models.DTOs.Role
{
    public class RoleInfoDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string NormalizedName { get; set; } = string.Empty;
        public string? ConcurrencyStamp { get; set; }
    }
}
