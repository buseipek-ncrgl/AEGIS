using Aegis.Application.Telemetry.Services;
using Aegis.Domain.Entities;
using Aegis.Domain.Enums;
using Aegis.Domain.ValueObjects;

namespace Aegis.UnitTests.Application;

public class StatisticalAnomalyDetectorTests
{
    private readonly StatisticalAnomalyDetector _detector = new();

    [Fact]
    public void DetectAnomalies_WithGpsSpoofing_ShouldDetectSpoofingAnomaly()
    {
        // Arrange: 1 saniyede Ankara'dan Konya'ya 200 km sıçrayan İHA
        var vehicle = new Vehicle(Guid.NewGuid(), "ANKARA-İHA-01", VehicleType.Drone);
        var prevTime = DateTimeOffset.UtcNow;
        var currTime = prevTime.AddSeconds(1);

        var prevTelemetry = new Telemetry(Guid.NewGuid(), vehicle.Id, new Location(39.9334, 32.8597), 1000, 100, 90, 25, prevTime);
        var currTelemetry = new Telemetry(Guid.NewGuid(), vehicle.Id, new Location(37.9334, 32.8597), 1000, 100, 90, 25, currTime); // ~222 km 1 sn'de!

        // Act
        var anomalies = _detector.DetectAnomalies(vehicle, currTelemetry, prevTelemetry);

        // Assert
        Assert.Single(anomalies);
        Assert.Equal(AnomalyType.GpsSpoofing, anomalies[0].Type);
        Assert.True(anomalies[0].SeverityScore > 9.0);
    }

    [Fact]
    public void DetectAnomalies_WithFreefallDrop_ShouldDetectAltitudeDropAnomaly()
    {
        // Arrange: 1 saniyede 1000m'den 200m'ye düşen İHA (800 m/s düşüş hızı)
        var vehicle = new Vehicle(Guid.NewGuid(), "ANKARA-İHA-02", VehicleType.Drone);
        var prevTime = DateTimeOffset.UtcNow;
        var currTime = prevTime.AddSeconds(1);

        var prevTelemetry = new Telemetry(Guid.NewGuid(), vehicle.Id, new Location(39.9334, 32.8597), 1000, 100, 90, 25, prevTime);
        var currTelemetry = new Telemetry(Guid.NewGuid(), vehicle.Id, new Location(39.9335, 32.8598), 200, 100, 90, 25, currTime);

        // Act
        var anomalies = _detector.DetectAnomalies(vehicle, currTelemetry, prevTelemetry);

        // Assert
        Assert.Single(anomalies);
        Assert.Equal(AnomalyType.SuddenAltitudeDrop, anomalies[0].Type);
        Assert.True(anomalies[0].SeverityScore >= 8.0);
    }

    [Fact]
    public void DetectAnomalies_WithThermalRunaway_ShouldDetectThermalAnomaly()
    {
        // Arrange: 2 saniyede sıcaklığı 30°C'den 50°C'ye tırmanan (10 °C/s) motor
        var vehicle = new Vehicle(Guid.NewGuid(), "İZMİR-HELS-01", VehicleType.Helicopter);
        var prevTime = DateTimeOffset.UtcNow;
        var currTime = prevTime.AddSeconds(2);

        var prevTelemetry = new Telemetry(Guid.NewGuid(), vehicle.Id, new Location(38.4, 27.1), 500, 150, 90, 30.0, prevTime);
        var currTelemetry = new Telemetry(Guid.NewGuid(), vehicle.Id, new Location(38.4001, 27.1001), 500, 150, 90, 50.0, currTime);

        // Act
        var anomalies = _detector.DetectAnomalies(vehicle, currTelemetry, prevTelemetry);

        // Assert
        Assert.Single(anomalies);
        Assert.Equal(AnomalyType.ThermalRunaway, anomalies[0].Type);
    }

    [Fact]
    public void DetectAnomalies_WithNormalMovement_ShouldDetectNoAnomalies()
    {
        // Arrange: Normal 1 saniyelik uçuş
        var vehicle = new Vehicle(Guid.NewGuid(), "AFAD-AMBULANS-01", VehicleType.Ambulance);
        var prevTime = DateTimeOffset.UtcNow;
        var currTime = prevTime.AddSeconds(1);

        var prevTelemetry = new Telemetry(Guid.NewGuid(), vehicle.Id, new Location(39.9334, 32.8597), 850, 45, 95, 25.0, prevTime);
        var currTelemetry = new Telemetry(Guid.NewGuid(), vehicle.Id, new Location(39.9335, 32.8598), 850, 46, 95, 25.2, currTime);

        // Act
        var anomalies = _detector.DetectAnomalies(vehicle, currTelemetry, prevTelemetry);

        // Assert
        Assert.Empty(anomalies);
    }
}
