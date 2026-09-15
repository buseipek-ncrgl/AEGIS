namespace Aegis.Domain.ValueObjects;

public readonly record struct Location
{
    public double Latitude { get; }
    public double Longitude { get; }

    public Location(double latitude, double longitude)
    {
        if (latitude < -90 || latitude > 90)
            throw new ArgumentOutOfRangeException(nameof(latitude), "Enlem (Latitude) -90 ile 90 arasında olmalıdır.");

        if (longitude < -180 || longitude > 180)
            throw new ArgumentOutOfRangeException(nameof(longitude), "Boylam (Longitude) -180 ile 180 arasında olmalıdır.");

        Latitude = latitude;
        Longitude = longitude;
    }
}
