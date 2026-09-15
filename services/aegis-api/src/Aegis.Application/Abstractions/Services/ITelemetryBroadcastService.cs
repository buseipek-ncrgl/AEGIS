using Aegis.Application.Alerts.DTOs;
using Aegis.Application.Telemetry.DTOs;

namespace Aegis.Application.Abstractions.Services;

public interface ITelemetryBroadcastService
{
    Task BroadcastTelemetryAsync(TelemetryDto telemetry, CancellationToken cancellationToken = default);
    Task BroadcastAlertAsync(AlertDto alert, CancellationToken cancellationToken = default);
}
