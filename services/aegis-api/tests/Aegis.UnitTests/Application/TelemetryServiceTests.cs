using Aegis.Application.Telemetry.DTOs;
using Aegis.Application.Telemetry.Services;
using Aegis.Application.Vehicles.DTOs;
using Aegis.Application.Vehicles.Services;
using Aegis.Domain.Enums;
using Aegis.UnitTests.Fakes;

namespace Aegis.UnitTests.Application;

public class TelemetryServiceTests
{
    private readonly FakeVehicleRepository _vehicleRepository = new();
    private readonly FakeTelemetryRepository _telemetryRepository = new();
    private readonly VehicleService _vehicleService;
    private readonly TelemetryService _telemetryService;

    public TelemetryServiceTests()
    {
        _vehicleService = new VehicleService(_vehicleRepository);
        _telemetryService = new TelemetryService(_telemetryRepository, _vehicleRepository);
    }

    [Fact]
    public async Task RecordTelemetryAsync_WithValidVehicle_ShouldRecordTelemetryAndUpdateLastSeen()
    {
        // Arrange
        var vehicle = await _vehicleService.CreateVehicleAsync(new CreateVehicleRequest("AFAD-AMBULANS-06", VehicleType.Ambulance));
        var initialLastSeen = vehicle.LastSeenAt;

        var request = new CreateTelemetryRequest(
            vehicle.Id,
            Latitude: 39.9334,
            Longitude: 32.8597,
            Altitude: 850.0,
            Speed: 45.5,
            BatteryPercentage: 88.0,
            Temperature: 24.5
        );

        // Act
        var result = await _telemetryService.RecordTelemetryAsync(request);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(vehicle.Id, result.VehicleId);
        Assert.Equal(39.9334, result.Latitude);

        var updatedVehicle = await _vehicleRepository.GetByIdAsync(vehicle.Id);
        Assert.NotNull(updatedVehicle);
        Assert.True(updatedVehicle.LastSeenAt >= initialLastSeen);
    }

    [Fact]
    public async Task RecordTelemetryAsync_WithNonExistingVehicle_ShouldThrowKeyNotFoundException()
    {
        // Arrange
        var request = new CreateTelemetryRequest(
            VehicleId: Guid.NewGuid(),
            Latitude: 39.9334,
            Longitude: 32.8597,
            Altitude: 850.0,
            Speed: 45.5,
            BatteryPercentage: 88.0,
            Temperature: 24.5
        );

        // Act & Assert
        await Assert.ThrowsAsync<KeyNotFoundException>(() => _telemetryService.RecordTelemetryAsync(request));
    }
}
