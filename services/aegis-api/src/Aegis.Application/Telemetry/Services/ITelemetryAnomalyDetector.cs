using Aegis.Application.Telemetry.DTOs;
using Aegis.Domain.Entities;
using TelemetryEntity = Aegis.Domain.Entities.Telemetry;

namespace Aegis.Application.Telemetry.Services;

public interface ITelemetryAnomalyDetector
{
    IReadOnlyList<TelemetryAnomaly> DetectAnomalies(Vehicle vehicle, TelemetryEntity currentTelemetry, TelemetryEntity? previousTelemetry);
}
