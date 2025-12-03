using System.ComponentModel;

namespace ConfeccionesEsperanzaEF.Models.Common
{
    public enum EstadoPedido
    {
        [Description("Pendiente")]
        Pendiente = 1,

        [Description("En Proceso")]
        EnProceso = 2,

        [Description("En Producción")]
        EnProduccion = 3,

        [Description("Completado")]
        Completado = 4,

        [Description("Cancelado")]
        Cancelado = 5,

        [Description("Entregado")]
        Entregado = 6
    }
}
