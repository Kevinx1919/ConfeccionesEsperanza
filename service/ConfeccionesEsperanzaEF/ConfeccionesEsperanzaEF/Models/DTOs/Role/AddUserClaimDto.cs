using System.ComponentModel.DataAnnotations;

namespace ConfeccionesEsperanzaEF.Models.DTOs.Role
{
    public class AddUserClaimDto
    {
        [Required(ErrorMessage = "El ID del usuario es obligatorio")]
        public string UserId { get; set; } = string.Empty;

        [Required(ErrorMessage = "El tipo de claim es obligatorio")]
        public string ClaimType { get; set; } = string.Empty;

        [Required(ErrorMessage = "El valor del claim es obligatorio")]
        public string ClaimValue { get; set; } = string.Empty;
    }
}
