using System.ComponentModel;

namespace ConfeccionesEsperanzaEF.Models.Common
{
    public enum TipoUsuario
    {
        [Description("Administrador")]
        Administrador = 1,

        [Description("Usuario")]
        Empleado = 2,

        [Description("Secretario")]
        Supervisor = 3,
    }
}
