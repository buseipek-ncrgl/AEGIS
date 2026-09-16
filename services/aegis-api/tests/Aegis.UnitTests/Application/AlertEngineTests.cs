using Aegis.Application.Alerts.Services;
using Aegis.Domain.Entities;
using Aegis.Domain.Enums;
using Aegis.Domain.ValueObjects;

namespace Aegis.UnitTests.Application;

public class AlertEngineTests
{
    private readonly AlertEngine _alertEngine = new();

    [Fact]
    public void EvaluateTelemetry_WithLowBattery_ShouldGenerateCriticalLowBatteryAlert()
    {
        // Arrange
        var vehicle = new Vehicle(Guid.NewGuid(), "ANKARA-İHA-01", VehicleType.Drone);
        var location = new Location(39.9, 32.8);
        var telemetry = new Telemetry(Guid.NewGuid(), vehicle.Id, location, 1000, 100, 10.0, 30.0, DateTimeOffset.UtcNow);

        // Act
        var alerts = _alertEngine.EvaluateTelemetry(vehicle, telemetry);

        // Assert
        Assert.Single(alerts);
        Assert.Equal(AlertSeverity.Critical, alerts[0].Severity);
        Assert.Equal(AlertType.LowBattery, alerts[0].Type);
    }

    [Fact]
    public void EvaluateTelemetry_WithGeofenceViolation_ShouldGenerateGeofenceAlert()
    {
        // Arrange
        var vehicle = new Vehicle(Guid.NewGuid(), "ANKARA-İHA-02", VehicleType.Drone);
        var location = new Location(40.5, 33.0); // Latitude > 40.0 & Longitude > 32.7 (Yasaklı Bölge)
        var telemetry = new Telemetry(Guid.NewGuid(), vehicle.Id, location, 1200, 110, 80.0, 35.0, DateTimeOffset.UtcNow);

        // Act
        var alerts = _alertEngine.EvaluateTelemetry(vehicle, telemetry);

        // Assert
        Assert.Single(alerts);
        Assert.Equal(AlertSeverity.High, alerts[0].Severity);
        Assert.Equal(AlertType.GeofenceViolation, alerts[0].Type);
    }

    [Fact]
    public void EvaluateTelemetry_WithHighTemperature_ShouldGenerateHighTemperatureAlert()
    {
        // Arrange
        var vehicle = new Vehicle(Guid.NewGuid(), "İZMİR-HELS-01", VehicleType.Helicopter);
        var location = new Location(38.4, 27.1);
        var telemetry = new Telemetry(Guid.NewGuid(), vehicle.Id, location, 500, 150, 90.0, 55.0, DateTimeOffset.UtcNow); // Temp > 50°C

        // Act
        var alerts = _alertEngine.EvaluateTelemetry(vehicle, telemetry);

        // Assert
        Assert.Single(alerts);
        Assert.Equal(AlertSeverity.High, alerts[0].Severity);
        Assert.Equal(AlertType.HighTemperature, alerts[0].Type);
    }

    [Fact]
    public void EvaluateTelemetry_WithNormalValues_ShouldGenerateNoAlerts()
    {
        // Arrange
        var vehicle = new Vehicle(Guid.NewGuid(), "AFAD-AMBULANS-01", VehicleType.Ambulance);
        var location = new Location(39.9, 32.8);
        var telemetry = new Telemetry(Guid.NewGuid(), vehicle.Id, location, 850, 50, 95.0, 25.0, DateTimeOffset.UtcNow);

        // Act
        var alerts = _alertEngine.EvaluateTelemetry(vehicle, telemetry);

        // Assert
        Assert.Empty(alerts);
    }
}
