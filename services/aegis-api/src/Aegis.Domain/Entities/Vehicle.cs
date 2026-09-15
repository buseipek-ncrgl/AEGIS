using Aegis.Domain.Enums;

namespace Aegis.Domain.Entities;

public class Vehicle
{
    public Guid Id { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public VehicleType Type { get; private set; }
    public VehicleStatus Status { get; private set; }
    public DateTimeOffset LastSeenAt { get; private set; }

    // EF Core for parameterless constructor
    private Vehicle() {; }

    public Vehicle(Guid id, string name, VehicleType type, VehicleStatus status = VehicleStatus.Idle)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Araç adı boş olamaz.", nameof(name));

        Id = id == Guid.Empty ? Guid.NewGuid() : id;
        Name = name;
        Type = type;
        Status = status;
        LastSeenAt = DateTimeOffset.UtcNow;
    }

    public void UpdateStatus(VehicleStatus newStatus)
    {
        Status = newStatus;
        LastSeenAt = DateTimeOffset.UtcNow;
    }

    public void UpdateLastSeen()
    {
        LastSeenAt = DateTimeOffset.UtcNow;
    }
}
