using ConfeccionesEsperanzaEF.Models.DTOs.User;

namespace ConfeccionesEsperanzaEF.Models.DTOs.Auth
{
    public class AuthResponseDto
    {
        public bool IsSuccess { get; set; }
        public string Message { get; set; } = string.Empty;
        public string? Token { get; set; }
        public DateTime? TokenExpiration { get; set; }
        public UserInfoDto? User { get; set; }
    }
}
