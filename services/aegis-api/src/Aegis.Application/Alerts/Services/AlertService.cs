using Aegis.Application.Abstractions.Repositories;
using Aegis.Application.Alerts.DTOs;
using Aegis.Domain.Entities;

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
            vehicleMap.TryGetValue(a.VehicleId, out var name) ? name : "Bilinmeyen Araç / Taktik Komuta",
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

    public async Task<AlertDto> CreateManualAlertAsync(CreateManualAlertRequest request, CancellationToken cancellationToken = default)
    {
        var targetVehicleId = request.VehicleId.HasValue && request.VehicleId.Value != Guid.Empty
            ? request.VehicleId.Value
            : Guid.Parse("00000000-0000-0000-0000-000000000001");

        var vehicleName = "Taktik Komuta Merkezi";
        if (targetVehicleId != Guid.Parse("00000000-0000-0000-0000-000000000001"))
        {
            var vehicle = await vehicleRepository.GetByIdAsync(targetVehicleId, cancellationToken);
            if (vehicle != null) vehicleName = vehicle.Name;
        }

        var alert = new Alert(Guid.NewGuid(), targetVehicleId, request.Severity, request.Type, request.Message);
        await alertRepository.AddAsync(alert, cancellationToken);

        return new AlertDto(
            alert.Id,
            alert.VehicleId,
            vehicleName,
            alert.Severity,
            alert.Type,
            alert.Message,
            alert.CreatedAt,
            alert.IsAcknowledged
        );
    }
}
