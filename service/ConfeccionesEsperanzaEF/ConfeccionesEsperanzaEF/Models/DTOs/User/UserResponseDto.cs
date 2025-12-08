namespace ConfeccionesEsperanzaEF.Models.DTOs.User
{
    public class UserResponseDto
    {
        public bool IsSuccess { get; set; }
        public string Message { get; set; } = string.Empty;
        public UserInfoDto? User { get; set; }
    }
}
