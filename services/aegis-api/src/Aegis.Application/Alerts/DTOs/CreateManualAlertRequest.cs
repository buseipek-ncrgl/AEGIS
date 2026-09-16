using Aegis.Domain.Enums;

namespace Aegis.Application.Alerts.DTOs;

public record CreateManualAlertRequest(
    Guid? VehicleId,
    AlertSeverity Severity,
    AlertType Type,
    string Message
);
