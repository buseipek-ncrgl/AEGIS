using Aegis.Application.Alerts.Services;
using Aegis.Domain.Entities;
using Aegis.Domain.Enums;
using Aegis.UnitTests.Fakes;

namespace Aegis.UnitTests.Application;

public class AlertServiceTests
{
    private readonly FakeAlertRepository _alertRepository = new();
    private readonly FakeVehicleRepository _vehicleRepository = new();
    private readonly AlertService _alertService;

    public AlertServiceTests()
    {
        _alertService = new AlertService(_alertRepository, _vehicleRepository);
    }

    [Fact]
    public async Task GetActiveAlertsAsync_ShouldReturnOnlyUnacknowledgedAlerts()
    {
        // Arrange
        var vehicle = new Vehicle(Guid.NewGuid(), "ANKARA-İHA-01", VehicleType.Drone);
        await _vehicleRepository.AddAsync(vehicle);

        var alert1 = new Alert(Guid.NewGuid(), vehicle.Id, AlertSeverity.Critical, AlertType.LowBattery, "Batarya Kritik");
        var alert2 = new Alert(Guid.NewGuid(), vehicle.Id, AlertSeverity.High, AlertType.HighTemperature, "Yüksek Sıcaklık");
        alert2.Acknowledge(); // Onaylanmış (pasif)

        await _alertRepository.AddAsync(alert1);
        await _alertRepository.AddAsync(alert2);

        // Act
        var activeAlerts = await _alertService.GetActiveAlertsAsync();

        // Assert
        Assert.Single(activeAlerts);
        Assert.Equal(alert1.Id, activeAlerts[0].Id);
        Assert.Equal("ANKARA-İHA-01", activeAlerts[0].VehicleName);
    }

    [Fact]
    public async Task AcknowledgeAlertAsync_WithValidId_ShouldMarkAlertAsAcknowledged()
    {
        // Arrange
        var vehicleId = Guid.NewGuid();
        var alert = new Alert(Guid.NewGuid(), vehicleId, AlertSeverity.High, AlertType.GeofenceViolation, "Saha İhlali");
        await _alertRepository.AddAsync(alert);

        // Act
        await _alertService.AcknowledgeAlertAsync(alert.Id);

        // Assert
        var updatedAlert = await _alertRepository.GetByIdAsync(alert.Id);
        Assert.NotNull(updatedAlert);
        Assert.True(updatedAlert.IsAcknowledged);
    }

    [Fact]
    public async Task AcknowledgeAlertAsync_WithNonExistingId_ShouldThrowKeyNotFoundException()
    {
        // Act & Assert
        await Assert.ThrowsAsync<KeyNotFoundException>(() => _alertService.AcknowledgeAlertAsync(Guid.NewGuid()));
    }
}
