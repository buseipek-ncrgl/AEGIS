using Aegis.Application.Vehicles.DTOs;

namespace Aegis.Application.Vehicles.Services;

public interface IVehicleService
{
    Task<VehicleDto> CreateVehicleAsync(CreateVehicleRequest request, CancellationToken cancellationToken = default);
    Task<VehicleDto?> GetVehicleByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<VehicleDto>> GetAllVehiclesAsync(CancellationToken cancellationToken = default);
}
