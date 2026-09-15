using Aegis.Domain.Enums;
using Aegis.Domain.ValueObjects;

namespace Aegis.Domain.Entities;

public class Mission
{
    private readonly List<Waypoint> _waypoints = [];

    public Guid Id { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public MissionStatus Status { get; private set; }
    public Guid? AssignedVehicleId { get; private set; }
    public IReadOnlyCollection<Waypoint> Waypoints => _waypoints.AsReadOnly();
    public DateTimeOffset CreatedAt { get; private set; }

    private Mission() {; }

    public Mission(Guid id, string title, Guid? assignedVehicleId = null)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Görev başlığı boş olamaz.", nameof(title));

        Id = id == Guid.Empty ? Guid.NewGuid() : id;
        Title = title;
        Status = MissionStatus.Planned;
        AssignedVehicleId = assignedVehicleId;
        CreatedAt = DateTimeOffset.UtcNow;
    }

    public void AssignVehicle(Guid vehicleId)
    {
        AssignedVehicleId = vehicleId;
    }

    public void AddWaypoint(Waypoint waypoint)
    {
        _waypoints.Add(waypoint);
    }

    public void UpdateStatus(MissionStatus status)
    {
        Status = status;
    }
}
