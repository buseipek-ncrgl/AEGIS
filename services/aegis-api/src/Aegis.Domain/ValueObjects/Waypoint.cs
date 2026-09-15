namespace Aegis.Domain.ValueObjects;

public sealed record Waypoint(int Order, Location Location, double TargetAltitude);
