using Aegis.Domain.Entities;
using Aegis.Domain.Enums;

namespace Aegis.UnitTests.Domain;

public class VehicleTests
{
    [Fact]
    public void CreateVehicle_WithValidName_ShouldInitializeProperties()
    {
        // Arrange
        string name = "Bayraktar-TB2-Sim01";
        var type = VehicleType.Drone;

        // Act
        var vehicle = new Vehicle(Guid.NewGuid(), name, type);

        // Assert
        Assert.NotEqual(Guid.Empty, vehicle.Id);
        Assert.Equal(name, vehicle.Name);
        Assert.Equal(type, vehicle.Type);
        Assert.Equal(VehicleStatus.Idle, vehicle.Status);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void CreateVehicle_WithEmptyName_ShouldThrowArgumentException(string invalidName)
    {
        // Act & Assert
        Assert.Throws<ArgumentException>(() => new Vehicle(Guid.NewGuid(), invalidName, VehicleType.Drone));
    }
}
