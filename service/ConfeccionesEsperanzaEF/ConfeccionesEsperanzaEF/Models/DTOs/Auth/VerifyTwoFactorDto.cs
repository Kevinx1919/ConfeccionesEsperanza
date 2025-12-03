using System.ComponentModel.DataAnnotations;

namespace ConfeccionesEsperanzaEF.Models.DTOs.Auth
{
    public class VerifyTwoFactorDto
    {
        [Required(ErrorMessage = "El código es obligatorio")]
        public string Code { get; set; } = string.Empty;

        public bool RememberMachine { get; set; } = false;
    }
}
