using System.ComponentModel.DataAnnotations;

namespace ConfeccionesEsperanzaEF.Models.DTOs.Role
{
    public class AssignRoleDto
    {
        [Required(ErrorMessage = "El ID del usuario es obligatorio")]
        public string UserId { get; set; } = string.Empty;

        [Required(ErrorMessage = "El nombre del rol es obligatorio")]
        public string RoleName { get; set; } = string.Empty;
    }
}
