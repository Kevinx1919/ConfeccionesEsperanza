using System.ComponentModel;

namespace ConfeccionesEsperanzaEF.Models.Common
{
    public enum EstadoTarea
    {
        [Description("Pendiente")]
        Pendiente = 1,

        [Description("En Proceso")]
        EnProceso = 2,

        [Description("Completada")]
        Completada = 3,

        [Description("Cancelada")]
        Cancelada = 4,

        [Description("En Pausa")]
        EnPausa = 5
    }
}
