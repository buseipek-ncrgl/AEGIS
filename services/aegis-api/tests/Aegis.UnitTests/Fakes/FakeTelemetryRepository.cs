using Aegis.Application.Abstractions.Repositories;
using TelemetryEntity = Aegis.Domain.Entities.Telemetry;

namespace Aegis.UnitTests.Fakes;

public class FakeTelemetryRepository : ITelemetryRepository
{
    private readonly List<TelemetryEntity> _telemetries = [];

    public Task AddAsync(TelemetryEntity telemetry, CancellationToken cancellationToken = default)
    {
        _telemetries.Add(telemetry);
        return Task.CompletedTask;
    }

    public Task<IReadOnlyList<TelemetryEntity>> GetByVehicleIdAsync(Guid vehicleId, int limit = 100, CancellationToken cancellationToken = default)
    {
        IReadOnlyList<TelemetryEntity> list = _telemetries
            .Where(t => t.VehicleId == vehicleId)
            .OrderByDescending(t => t.Timestamp)
            .Take(limit)
            .ToList()
            .AsReadOnly();

        return Task.FromResult(list);
    }

    public Task<TelemetryEntity?> GetLatestByVehicleIdAsync(Guid vehicleId, CancellationToken cancellationToken = default)
    {
        var latest = _telemetries
            .Where(t => t.VehicleId == vehicleId)
            .OrderByDescending(t => t.Timestamp)
            .FirstOrDefault();

        return Task.FromResult(latest);
    }
}
