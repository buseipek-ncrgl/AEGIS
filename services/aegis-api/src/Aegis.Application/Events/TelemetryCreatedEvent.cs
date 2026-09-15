namespace Aegis.Application.Events;

public record TelemetryCreatedEvent(
    Guid TelemetryId,
    Guid VehicleId,
    double Latitude,
    double Longitude,
    double Altitude,
    double Speed,
    double BatteryPercentage,
    double Temperature,
    DateTimeOffset Timestamp
);
