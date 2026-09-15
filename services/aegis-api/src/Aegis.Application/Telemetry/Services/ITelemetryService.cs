using Aegis.Application.Telemetry.DTOs;

namespace Aegis.Application.Telemetry.Services;

public interface ITelemetryService
{
    Task<TelemetryDto> RecordTelemetryAsync(CreateTelemetryRequest request, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<TelemetryDto>> GetTelemetryHistoryAsync(Guid vehicleId, int limit = 100, CancellationToken cancellationToken = default);
    Task<TelemetryDto?> GetLatestTelemetryAsync(Guid vehicleId, CancellationToken cancellationToken = default);
}
