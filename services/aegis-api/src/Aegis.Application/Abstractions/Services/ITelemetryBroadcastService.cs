using Aegis.Application.Telemetry.DTOs;

namespace Aegis.Application.Abstractions.Services;

public interface ITelemetryBroadcastService
{
    Task BroadcastTelemetryAsync(TelemetryDto telemetry, CancellationToken cancellationToken = default);
}
