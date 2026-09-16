using Aegis.Domain.Enums;

namespace Aegis.Application.Telemetry.DTOs;

public record TelemetryAnomaly(
    Guid Id,
    Guid VehicleId,
    string VehicleName,
    AnomalyType Type,
    double SeverityScore, // 0.0 - 10.0 arası ciddiyet skoru
    string Description,
    DateTimeOffset DetectedAt
);
