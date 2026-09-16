namespace Aegis.Application.Telemetry.DTOs;

public record TelemetryDto(
    Guid Id,
    Guid VehicleId,
    double Latitude,
    double Longitude,
    double Altitude,
    double Speed,
    double BatteryPercentage,
    double Temperature,
    DateTimeOffset Timestamp
);

public record CreateTelemetryRequest(
    Guid VehicleId,
    double Latitude,
    double Longitude,
    double Altitude,
    double Speed,
    double BatteryPercentage,
    double Temperature,
    DateTimeOffset? Timestamp = null
);
