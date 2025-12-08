using ConfeccionesEsperanzaEF.Models.Common;

namespace ConfeccionesEsperanzaEF.Models.DTOs.Production
{
    public class UsuarioProductoTareaInfoDto
    {
        public int Id { get; set; }

        // Usuario
        public string Usuario_IdUsuario { get; set; } = string.Empty;
        public string UsuarioNombre { get; set; } = string.Empty;
        public string UsuarioEmail { get; set; } = string.Empty;

        // Producto
        public int Producto_IdProducto { get; set; }
        public string ProductoNombre { get; set; } = string.Empty;
        public string ProductoDescripcion { get; set; } = string.Empty;

        // Tarea
        public int Tarea_IdTarea { get; set; }
        public string TareaNombre { get; set; } = string.Empty;
        public string? TareaDescripcion { get; set; }

        // Fechas y estado
        public DateTime FechaInicio { get; set; }
        public DateTime? FechaFin { get; set; }
        public EstadoTarea Estado { get; set; }
        public string EstadoDescripcion { get; set; } = string.Empty;

        // Propiedades calculadas
        public TimeSpan? DuracionTrabajo { get; set; }
        public bool EstaVencida { get; set; }

        public DateTime FechaCreacion { get; set; }
        public DateTime? FechaActualizacion { get; set; }
    }
}
