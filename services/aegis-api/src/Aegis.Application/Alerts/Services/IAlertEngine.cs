using Aegis.Domain.Entities;
using TelemetryEntity = Aegis.Domain.Entities.Telemetry;

namespace Aegis.Application.Alerts.Services;

public interface IAlertEngine
{
    IReadOnlyList<Alert> EvaluateTelemetry(Vehicle vehicle, TelemetryEntity telemetry);
}
