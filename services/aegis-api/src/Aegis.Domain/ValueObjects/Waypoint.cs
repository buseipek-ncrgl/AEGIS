namespace Aegis.Domain.ValueObjects;

public class Waypoint
{
    public int Order { get; private set; }
    public Location Location { get; private set; } = null!;
    public double TargetAltitude { get; private set; }

    private Waypoint() {; }

    public Waypoint(int order, Location location, double targetAltitude)
    {
        Order = order;
        Location = location;
        TargetAltitude = targetAltitude;
    }
}
