using Aegis.Domain.ValueObjects;

namespace Aegis.UnitTests.Domain;

public class LocationTests
{
    [Fact]
    public void Location_WithValidCoordinates_ShouldCreateSuccessfully()
    {
        // Arrange
        double lat = 39.9334; // Ankara latitude
        double lng = 32.8597; // Ankara longitude

        // Act
        var location = new Location(lat, lng);

        // Assert
        Assert.Equal(lat, location.Latitude);
        Assert.Equal(lng, location.Longitude);
    }

    [Theory]
    [InlineData(-91, 32.8597)]
    [InlineData(91, 32.8597)]
    [InlineData(39.9334, -181)]
    [InlineData(39.9334, 181)]
    public void Location_WithInvalidCoordinates_ShouldThrowArgumentOutOfRangeException(double lat, double lng)
    {
        // Act & Assert
        Assert.Throws<ArgumentOutOfRangeException>(() => new Location(lat, lng));
    }
}
