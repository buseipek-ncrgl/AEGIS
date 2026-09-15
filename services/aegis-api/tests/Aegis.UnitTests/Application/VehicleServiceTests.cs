using Aegis.Application.Vehicles.DTOs;
using Aegis.Application.Vehicles.Services;
using Aegis.Domain.Enums;
using Aegis.UnitTests.Fakes;

namespace Aegis.UnitTests.Application;

public class VehicleServiceTests
{
    private readonly FakeVehicleRepository _vehicleRepository = new();
    private readonly VehicleService _vehicleService;

    public VehicleServiceTests()
    {
        _vehicleService = new VehicleService(_vehicleRepository);
    }

    [Fact]
    public async Task CreateVehicleAsync_WithValidInput_ShouldSaveAndReturnDto()
    {
        // Arrange
        var request = new CreateVehicleRequest("ANKARA-İHA-01", VehicleType.Drone);

        // Act
        var result = await _vehicleService.CreateVehicleAsync(request);

        // Assert
        Assert.NotNull(result);
        Assert.NotEqual(Guid.Empty, result.Id);
        Assert.Equal("ANKARA-İHA-01", result.Name);
        Assert.Equal(VehicleType.Drone, result.Type);
        Assert.Equal(VehicleStatus.Idle, result.Status);

        var savedVehicle = await _vehicleRepository.GetByIdAsync(result.Id);
        Assert.NotNull(savedVehicle);
    }
}
