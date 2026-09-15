using Aegis.Application.Abstractions.Repositories;
using Aegis.Application.Alerts.DTOs;

namespace Aegis.Application.Alerts.Services;

public class AlertService(IAlertRepository alertRepository, IVehicleRepository vehicleRepository) : IAlertService
{
    public async Task<IReadOnlyList<AlertDto>> GetActiveAlertsAsync(CancellationToken cancellationToken = default)
    {
        var alerts = await alertRepository.GetUnacknowledgedAlertsAsync(cancellationToken);
        var vehicles = await vehicleRepository.GetAllAsync(cancellationToken);
        var vehicleMap = vehicles.ToDictionary(v => v.Id, v => v.Name);

        return alerts.Select(a => new AlertDto(
            a.Id,
            a.VehicleId,
            vehicleMap.TryGetValue(a.VehicleId, out var name) ? name : "Bilinmeyen Araç",
            a.Severity,
            a.Type,
            a.Message,
            a.CreatedAt,
            a.IsAcknowledged
        )).ToList().AsReadOnly();
    }

    public async Task AcknowledgeAlertAsync(Guid alertId, CancellationToken cancellationToken = default)
    {
        var alert = await alertRepository.GetByIdAsync(alertId, cancellationToken)
            ?? throw new KeyNotFoundException($"Alert ID '{alertId}' bulunamadı.");

        alert.Acknowledge();
        await alertRepository.UpdateAsync(alert, cancellationToken);
    }
}
