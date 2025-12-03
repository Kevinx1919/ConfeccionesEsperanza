namespace ConfeccionesEsperanzaEF.Models.DTOs.Production
{
    public class TaskResponseDto
    {
        public bool IsSuccess { get; set; }
        public string Message { get; set; } = string.Empty;
        public object? Data { get; set; }
    }
}
