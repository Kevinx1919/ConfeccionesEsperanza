using Microsoft.EntityFrameworkCore;
using ConfeccionesEsperanzaEF.Data;
using ConfeccionesEsperanzaEF.Models.Customer;
using ConfeccionesEsperanzaEF.Models.DTOs.Customer;

namespace ConfeccionesEsperanzaEF.Services
{
    public interface ICustomerService
    {
        Task<ClienteResponseDto> CreateClienteAsync(CreateClienteDto createClienteDto);
        Task<ClienteResponseDto> UpdateClienteAsync(int id, UpdateClienteDto updateClienteDto);
        Task<ClienteResponseDto> DeleteClienteAsync(int id);
        Task<ClienteInfoDto?> GetClienteByIdAsync(int id);
        Task<ClienteListDto> GetClientesAsync(/*int pageNumber = 1, int pageSize = 10,*/ string? searchTerm = null);
        Task<ClienteInfoDto?> GetClienteByEmailAsync(string email);
        Task<ClienteInfoDto?> GetClienteByDocumentoAsync(int numeroDoc);
    }

    public class CustomerService : ICustomerService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<CustomerService> _logger;

        public CustomerService(ApplicationDbContext context, ILogger<CustomerService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<ClienteResponseDto> CreateClienteAsync(CreateClienteDto createClienteDto)
        {
            try
            {
                // Validar que no existe un cliente con el mismo email
                var existingEmail = await _context.Clientes
                    .AnyAsync(c => c.EmailCliente.ToLower() == createClienteDto.EmailCliente.ToLower());

                if (existingEmail)
                {
                    return new ClienteResponseDto
                    {
                        IsSuccess = false,
                        Message = "Ya existe un cliente con este email"
                    };
                }

                // Validar que no existe un cliente con el mismo número de documento
                var existingDoc = await _context.Clientes
                    .AnyAsync(c => c.NumeroDocCliente == createClienteDto.NumeroDocCliente);

                if (existingDoc)
                {
                    return new ClienteResponseDto
                    {
                        IsSuccess = false,
                        Message = "Ya existe un cliente con este número de documento"
                    };
                }

                var cliente = new Cliente
                {
                    NombreCliente = createClienteDto.NombreCliente.Trim(),
                    ApellidoCliente = createClienteDto.ApellidoCliente.Trim(),
                    EmailCliente = createClienteDto.EmailCliente.ToLower().Trim(),
                    TelefonoCliente = createClienteDto.TelefonoCliente?.Trim(),
                    NumeroDocCliente = createClienteDto.NumeroDocCliente,
                    DireccionCliente = createClienteDto.DireccionCliente?.Trim(),
                    CodigoPostalCliente = createClienteDto.CodigoPostalCliente?.Trim()
                };

                _context.Clientes.Add(cliente);
                await _context.SaveChangesAsync();

                var clienteInfo = await GetClienteByIdAsync(cliente.IdCliente);

                _logger.LogInformation($"Cliente creado: {cliente.NombreCompleto} con ID {cliente.IdCliente}");

                return new ClienteResponseDto
                {
                    IsSuccess = true,
                    Message = "Cliente creado exitosamente",
                    Cliente = clienteInfo
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear cliente");
                return new ClienteResponseDto
                {
                    IsSuccess = false,
                    Message = "Error interno del servidor"
                };
            }
        }

        public async Task<ClienteResponseDto> UpdateClienteAsync(int id, UpdateClienteDto updateClienteDto)
        {
            try
            {
                var cliente = await _context.Clientes.FindAsync(id);
                if (cliente == null)
                {
                    return new ClienteResponseDto
                    {
                        IsSuccess = false,
                        Message = "Cliente no encontrado"
                    };
                }

                // Validar email único (excluyendo el cliente actual)
                var existingEmail = await _context.Clientes
                    .AnyAsync(c => c.EmailCliente.ToLower() == updateClienteDto.EmailCliente.ToLower() && c.IdCliente != id);

                if (existingEmail)
                {
                    return new ClienteResponseDto
                    {
                        IsSuccess = false,
                        Message = "Ya existe otro cliente con este email"
                    };
                }

                // Validar documento único (excluyendo el cliente actual)
                var existingDoc = await _context.Clientes
                    .AnyAsync(c => c.NumeroDocCliente == updateClienteDto.NumeroDocCliente && c.IdCliente != id);

                if (existingDoc)
                {
                    return new ClienteResponseDto
                    {
                        IsSuccess = false,
                        Message = "Ya existe otro cliente con este número de documento"
                    };
                }

                // Actualizar propiedades
                cliente.NombreCliente = updateClienteDto.NombreCliente.Trim();
                cliente.ApellidoCliente = updateClienteDto.ApellidoCliente.Trim();
                cliente.EmailCliente = updateClienteDto.EmailCliente.ToLower().Trim();
                cliente.TelefonoCliente = updateClienteDto.TelefonoCliente?.Trim();
                cliente.NumeroDocCliente = updateClienteDto.NumeroDocCliente;
                cliente.DireccionCliente = updateClienteDto.DireccionCliente?.Trim();
                cliente.CodigoPostalCliente = updateClienteDto.CodigoPostalCliente?.Trim();

                await _context.SaveChangesAsync();

                var clienteInfo = await GetClienteByIdAsync(id);

                _logger.LogInformation($"Cliente actualizado: {cliente.NombreCompleto} con ID {id}");

                return new ClienteResponseDto
                {
                    IsSuccess = true,
                    Message = "Cliente actualizado exitosamente",
                    Cliente = clienteInfo
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar cliente con ID {Id}", id);
                return new ClienteResponseDto
                {
                    IsSuccess = false,
                    Message = "Error interno del servidor"
                };
            }
        }

        public async Task<ClienteResponseDto> DeleteClienteAsync(int id)
        {
            try
            {
                var cliente = await _context.Clientes.FindAsync(id);
                if (cliente == null)
                {
                    return new ClienteResponseDto
                    {
                        IsSuccess = false,
                        Message = "Cliente no encontrado"
                    };
                }

                // Verificar si el cliente tiene pedidos
                var tienePedidos = await _context.Pedidos
                    .AnyAsync(p => p.Cliente_IdCliente == id);

                if (tienePedidos)
                {
                    return new ClienteResponseDto
                    {
                        IsSuccess = false,
                        Message = "No se puede eliminar el cliente porque tiene pedidos asociados"
                    };
                }

                _context.Clientes.Remove(cliente);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Cliente eliminado: {cliente.NombreCompleto} con ID {id}");

                return new ClienteResponseDto
                {
                    IsSuccess = true,
                    Message = "Cliente eliminado exitosamente"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar cliente con ID {Id}", id);
                return new ClienteResponseDto
                {
                    IsSuccess = false,
                    Message = "Error interno del servidor"
                };
            }
        }

        public async Task<ClienteInfoDto?> GetClienteByIdAsync(int id)
        {
            try
            {
                var cliente = await _context.Clientes
                    .Include(c => c.Pedidos)
                    .FirstOrDefaultAsync(c => c.IdCliente == id);

                if (cliente == null) return null;

                return new ClienteInfoDto
                {
                    IdCliente = cliente.IdCliente,
                    NombreCliente = cliente.NombreCliente,
                    ApellidoCliente = cliente.ApellidoCliente,
                    NombreCompleto = cliente.NombreCompleto,
                    EmailCliente = cliente.EmailCliente,
                    TelefonoCliente = cliente.TelefonoCliente,
                    NumeroDocCliente = cliente.NumeroDocCliente,
                    DireccionCliente = cliente.DireccionCliente,
                    CodigoPostalCliente = cliente.CodigoPostalCliente,
                    FechaCreacion = cliente.FechaCreacion,
                    FechaActualizacion = cliente.FechaActualizacion,
                    TotalPedidos = cliente.Pedidos.Count
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener cliente con ID {Id}", id);
                return null;
            }
        }

        public async Task<ClienteListDto> GetClientesAsync(/*int pageNumber = 1, int pageSize = 10,*/ string? searchTerm = null)
        {
            try
            {
                var query = _context.Clientes
                    .Include(c => c.Pedidos)
                    .AsQueryable();

                if (!string.IsNullOrEmpty(searchTerm))
                {
                    var searchLower = searchTerm.ToLower();
                    query = query.Where(c => c.NombreCliente.ToLower().Contains(searchLower) ||
                                           c.ApellidoCliente.ToLower().Contains(searchLower) ||
                                           c.EmailCliente.ToLower().Contains(searchLower) ||
                                           c.NumeroDocCliente.ToString().Contains(searchTerm));
                }

                var totalCount = await query.CountAsync();

                var clientes = await query
                    .OrderBy(c => c.NombreCliente)
                    .ThenBy(c => c.ApellidoCliente)
                    //.Skip((pageNumber - 1) * pageSize)
                    //.Take(pageSize)
                    .Select(c => new ClienteInfoDto
                    {
                        IdCliente = c.IdCliente,
                        NombreCliente = c.NombreCliente,
                        ApellidoCliente = c.ApellidoCliente,
                        NombreCompleto = c.NombreCompleto,
                        EmailCliente = c.EmailCliente,
                        TelefonoCliente = c.TelefonoCliente,
                        NumeroDocCliente = c.NumeroDocCliente,
                        DireccionCliente = c.DireccionCliente,
                        CodigoPostalCliente = c.CodigoPostalCliente,
                        FechaCreacion = c.FechaCreacion,
                        FechaActualizacion = c.FechaActualizacion,
                        TotalPedidos = c.Pedidos.Count
                    })
                    .ToListAsync();

                return new ClienteListDto
                {
                    Clientes = clientes,
                    TotalCount = totalCount,
                    //PageNumber = pageNumber,
                    //PageSize = pageSize
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener lista de clientes");
                return new ClienteListDto();
            }
        }

        public async Task<ClienteInfoDto?> GetClienteByEmailAsync(string email)
        {
            try
            {
                var cliente = await _context.Clientes
                    .Include(c => c.Pedidos)
                    .FirstOrDefaultAsync(c => c.EmailCliente.ToLower() == email.ToLower());

                if (cliente == null) return null;

                return new ClienteInfoDto
                {
                    IdCliente = cliente.IdCliente,
                    NombreCliente = cliente.NombreCliente,
                    ApellidoCliente = cliente.ApellidoCliente,
                    NombreCompleto = cliente.NombreCompleto,
                    EmailCliente = cliente.EmailCliente,
                    TelefonoCliente = cliente.TelefonoCliente,
                    NumeroDocCliente = cliente.NumeroDocCliente,
                    DireccionCliente = cliente.DireccionCliente,
                    CodigoPostalCliente = cliente.CodigoPostalCliente,
                    FechaCreacion = cliente.FechaCreacion,
                    FechaActualizacion = cliente.FechaActualizacion,
                    TotalPedidos = cliente.Pedidos.Count
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener cliente por email {Email}", email);
                return null;
            }
        }

        public async Task<ClienteInfoDto?> GetClienteByDocumentoAsync(int numeroDoc)
        {
            try
            {
                var cliente = await _context.Clientes
                    .Include(c => c.Pedidos)
                    .FirstOrDefaultAsync(c => c.NumeroDocCliente == numeroDoc);

                if (cliente == null) return null;

                return new ClienteInfoDto
                {
                    IdCliente = cliente.IdCliente,
                    NombreCliente = cliente.NombreCliente,
                    ApellidoCliente = cliente.ApellidoCliente,
                    NombreCompleto = cliente.NombreCompleto,
                    EmailCliente = cliente.EmailCliente,
                    TelefonoCliente = cliente.TelefonoCliente,
                    NumeroDocCliente = cliente.NumeroDocCliente,
                    DireccionCliente = cliente.DireccionCliente,
                    CodigoPostalCliente = cliente.CodigoPostalCliente,
                    FechaCreacion = cliente.FechaCreacion,
                    FechaActualizacion = cliente.FechaActualizacion,
                    TotalPedidos = cliente.Pedidos.Count
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener cliente por documento {NumeroDoc}", numeroDoc);
                return null;
            }
        }
    }
}
