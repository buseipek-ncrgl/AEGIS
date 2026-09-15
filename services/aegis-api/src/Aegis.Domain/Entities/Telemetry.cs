using Aegis.Domain.ValueObjects;

namespace Aegis.Domain.Entities;

public class Telemetry
{
    public Guid Id { get; private set; }
    public Guid VehicleId { get; private set; }
    public Location Location { get; private set; }
    public double Altitude { get; private set; }
    public double Speed { get; private set; }
    public double BatteryPercentage { get; private set; }
    public double Temperature { get; private set; }
    public DateTimeOffset Timestamp { get; private set; }

    private Telemetry() {; }

    public Telemetry(
        Guid id,
        Guid vehicleId,
        Location location,
        double altitude,
        double speed,
        double batteryPercentage,
        double temperature,
        DateTimeOffset timestamp)
    {
        if (vehicleId == Guid.Empty)
            throw new ArgumentException("Telemetri geçerli bir Araç ID (VehicleId) içermelidir.", nameof(vehicleId));

        if (batteryPercentage is < 0 or > 100)
            throw new ArgumentOutOfRangeException(nameof(batteryPercentage), "Batarya yüzdesi 0 ile 100 arasında olmalıdır.");

        Id = id == Guid.Empty ? Guid.NewGuid() : id;
        VehicleId = vehicleId;
        Location = location;
        Altitude = altitude;
        Speed = speed;
        BatteryPercentage = batteryPercentage;
        Temperature = temperature;
        Timestamp = timestamp;
    }
}
