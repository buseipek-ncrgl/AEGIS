using Aegis.Domain.Entities;
using Aegis.Domain.Enums;
using Aegis.Infrastructure.Persistence;
using Aegis.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Aegis.UnitTests.Infrastructure;

public class VehicleRepositoryTests
{
    private static AegisDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<AegisDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new AegisDbContext(options);
    }

    [Fact]
    public async Task AddAsync_WithValidVehicle_ShouldPersistInDatabase()
    {
        // Arrange
        using var dbContext = CreateDbContext();
        var repository = new VehicleRepository(dbContext);
        var vehicle = new Vehicle(Guid.NewGuid(), "İZMİR-HELS-03", VehicleType.Helicopter);

        // Act
        await repository.AddAsync(vehicle);

        // Assert
        var fetchedVehicle = await repository.GetByIdAsync(vehicle.Id);
        Assert.NotNull(fetchedVehicle);
        Assert.Equal("İZMİR-HELS-03", fetchedVehicle.Name);
        Assert.Equal(VehicleType.Helicopter, fetchedVehicle.Type);
    }

    [Fact]
    public async Task GetAllAsync_ShouldReturnAllSavedVehicles()
    {
        // Arrange
        using var dbContext = CreateDbContext();
        var repository = new VehicleRepository(dbContext);
        await repository.AddAsync(new Vehicle(Guid.NewGuid(), "DRONE-1", VehicleType.Drone));
        await repository.AddAsync(new Vehicle(Guid.NewGuid(), "DRONE-2", VehicleType.Drone));

        // Act
        var result = await repository.GetAllAsync();

        // Assert
        Assert.Equal(2, result.Count);
    }
}
