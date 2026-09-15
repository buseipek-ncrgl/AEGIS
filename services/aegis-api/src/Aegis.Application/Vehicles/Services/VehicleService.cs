using Aegis.Application.Abstractions.Repositories;
using Aegis.Application.Vehicles.DTOs;
using Aegis.Domain.Entities;

namespace Aegis.Application.Vehicles.Services;

public class VehicleService(IVehicleRepository vehicleRepository) : IVehicleService
{
    public async Task<VehicleDto> CreateVehicleAsync(CreateVehicleRequest request, CancellationToken cancellationToken = default)
    {
        var existingVehicles = await vehicleRepository.GetAllAsync(cancellationToken);
        var existing = existingVehicles.FirstOrDefault(v => string.Equals(v.Name, request.Name, StringComparison.OrdinalIgnoreCase));
        if (existing is not null)
        {
            return MapToDto(existing);
        }

        var vehicle = new Vehicle(Guid.NewGuid(), request.Name, request.Type);
        
        await vehicleRepository.AddAsync(vehicle, cancellationToken);

        return MapToDto(vehicle);
    }

    public async Task<VehicleDto?> GetVehicleByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var vehicle = await vehicleRepository.GetByIdAsync(id, cancellationToken);
        return vehicle is null ? null : MapToDto(vehicle);
    }

    public async Task<IReadOnlyList<VehicleDto>> GetAllVehiclesAsync(CancellationToken cancellationToken = default)
    {
        var vehicles = await vehicleRepository.GetAllAsync(cancellationToken);
        return vehicles.Select(MapToDto).ToList().AsReadOnly();
    }

    private static VehicleDto MapToDto(Vehicle vehicle)
    {
        return new VehicleDto(
            vehicle.Id,
            vehicle.Name,
            vehicle.Type,
            vehicle.Status,
            vehicle.LastSeenAt
        );
    }
}
