using Aegis.Domain.Enums;

namespace Aegis.Domain.Entities;

public class Alert
{
    public Guid Id { get; private set; }
    public Guid VehicleId { get; private set; }
    public AlertSeverity Severity { get; private set; }
    public AlertType Type { get; private set; }
    public string Message { get; private set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; private set; }
    public bool IsAcknowledged { get; private set; }

    private Alert() {; }

    public Alert(Guid id, Guid vehicleId, AlertSeverity severity, AlertType type, string message)
    {
        if (vehicleId == Guid.Empty)
            throw new ArgumentException("Alarm geçerli bir Araç ID'si içermelidir.", nameof(vehicleId));

        if (string.IsNullOrWhiteSpace(message))
            throw new ArgumentException("Alarm mesajı boş olamaz.", nameof(message));

        Id = id == Guid.Empty ? Guid.NewGuid() : id;
        VehicleId = vehicleId;
        Severity = severity;
        Type = type;
        Message = message;
        CreatedAt = DateTimeOffset.UtcNow;
        IsAcknowledged = false;
    }

    public void Acknowledge()
    {
        IsAcknowledged = true;
    }
}
