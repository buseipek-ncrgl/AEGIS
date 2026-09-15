using Aegis.Application.Abstractions.Repositories;
using Aegis.Domain.Entities;

namespace Aegis.UnitTests.Fakes;

public class FakeVehicleRepository : IVehicleRepository
{
    private readonly List<Vehicle> _vehicles = [];

    public Task<Vehicle?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var vehicle = _vehicles.FirstOrDefault(v => v.Id == id);
        return Task.FromResult(vehicle);
    }

    public Task<IReadOnlyList<Vehicle>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        IReadOnlyList<Vehicle> list = _vehicles.AsReadOnly();
        return Task.FromResult(list);
    }

    public Task AddAsync(Vehicle vehicle, CancellationToken cancellationToken = default)
    {
        _vehicles.Add(vehicle);
        return Task.CompletedTask;
    }

    public Task UpdateAsync(Vehicle vehicle, CancellationToken cancellationToken = default)
    {
        var index = _vehicles.FindIndex(v => v.Id == vehicle.Id);
        if (index >= 0)
        {
            _vehicles[index] = vehicle;
        }
        return Task.CompletedTask;
    }
}
