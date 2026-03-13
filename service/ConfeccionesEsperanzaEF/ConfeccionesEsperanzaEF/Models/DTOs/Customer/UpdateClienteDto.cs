using System.ComponentModel.DataAnnotations;

namespace ConfeccionesEsperanzaEF.Models.DTOs.Customer
{
    public class UpdateClienteDto
    {
        [Required(ErrorMessage = "El nombre es obligatorio")]
        [StringLength(45, ErrorMessage = "El nombre no puede exceder los 45 caracteres")]
        public string NombreCliente { get; set; } = string.Empty;

        [Required(ErrorMessage = "El apellido es obligatorio")]
        [StringLength(45, ErrorMessage = "El apellido no puede exceder los 45 caracteres")]
        public string ApellidoCliente { get; set; } = string.Empty;

        [Required(ErrorMessage = "El email es obligatorio")]
        [StringLength(45, ErrorMessage = "El email no puede exceder los 45 caracteres")]
        [EmailAddress(ErrorMessage = "Formato de email inválido")]
        public string EmailCliente { get; set; } = string.Empty;

        [StringLength(45, ErrorMessage = "El teléfono no puede exceder los 45 caracteres")]
        [Phone(ErrorMessage = "Formato de teléfono inválido")]
        public string? TelefonoCliente { get; set; }

        [Required(ErrorMessage = "El número de documento es obligatorio")]
        [Range(1, int.MaxValue, ErrorMessage = "El número de documento debe ser válido")]
        public int NumeroDocCliente { get; set; }

        [StringLength(450, ErrorMessage = "La dirección no puede exceder los 450 caracteres")]
        public string? DireccionCliente { get; set; }

        [StringLength(45, ErrorMessage = "El código postal no puede exceder los 45 caracteres")]
        public string? CodigoPostalCliente { get; set; }
    }
}
