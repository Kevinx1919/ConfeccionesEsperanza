namespace ConfeccionesEsperanzaEF.Models.DTOs.User
{
    public class UserFilterDto
    {
        public string? Email { get; set; }
        public string? UserName { get; set; }
        public string? Role { get; set; }
        public bool? EmailConfirmed { get; set; }
        public bool? IsLocked { get; set; }
        public bool? TwoFactorEnabled { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}
