using Aegis.Domain.Enums;

namespace Aegis.Application.Alerts.DTOs;

public record AlertDto(
    Guid Id,
    Guid VehicleId,
    string VehicleName,
    AlertSeverity Severity,
    AlertType Type,
    string Message,
    DateTimeOffset CreatedAt,
    bool IsAcknowledged
);
