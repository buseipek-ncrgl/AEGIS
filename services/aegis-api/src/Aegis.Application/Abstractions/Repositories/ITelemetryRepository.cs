using TelemetryEntity = Aegis.Domain.Entities.Telemetry;

namespace Aegis.Application.Abstractions.Repositories;

public interface ITelemetryRepository
{
    Task AddAsync(TelemetryEntity telemetry, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<TelemetryEntity>> GetByVehicleIdAsync(Guid vehicleId, int limit = 100, CancellationToken cancellationToken = default);
    Task<TelemetryEntity?> GetLatestByVehicleIdAsync(Guid vehicleId, CancellationToken cancellationToken = default);
}
