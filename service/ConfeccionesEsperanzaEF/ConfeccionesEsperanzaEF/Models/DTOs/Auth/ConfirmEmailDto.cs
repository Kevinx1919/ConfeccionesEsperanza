using System.ComponentModel.DataAnnotations;

namespace ConfeccionesEsperanzaEF.Models.DTOs.Auth
{
    public class ConfirmEmailDto
    {
        [Required(ErrorMessage = "El ID del usuario es obligatorio")]
        public string UserId { get; set; } = string.Empty;

        [Required(ErrorMessage = "El token es obligatorio")]
        public string Token { get; set; } = string.Empty;
    }
}
