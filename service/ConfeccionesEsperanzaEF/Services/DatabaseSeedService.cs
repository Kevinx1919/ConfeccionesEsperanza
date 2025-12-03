// Services/DatabaseSeedService.cs
using ConfeccionesEsperanzaEF.Data;
using ConfeccionesEsperanzaEF.Models.Production;

public class DatabaseSeedService
{
    private readonly ApplicationDbContext _context;

    public DatabaseSeedService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task SeedAsync()
    {
        // Seed Tareas (que tienen FechaCreacion)
        if (!_context.Tareas.Any())
        {
            var tareas = new List<Tarea>
            {
                new() { NombreTarea = "Corte", Descripcion = "Cortar las piezas del producto según el patrón" },
                new() { NombreTarea = "Confección", Descripcion = "Unir las piezas cortadas mediante costura" },
                new() { NombreTarea = "Acabados", Descripcion = "Realizar los acabados finales del producto" }
            };

            _context.Tareas.AddRange(tareas);
            await _context.SaveChangesAsync();
        }
    }
}
