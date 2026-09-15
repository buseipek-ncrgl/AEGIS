using Aegis.Application.Alerts.DTOs;

namespace Aegis.Application.Alerts.Services;

public interface IAlertService
{
    Task<IReadOnlyList<AlertDto>> GetActiveAlertsAsync(CancellationToken cancellationToken = default);
    Task AcknowledgeAlertAsync(Guid alertId, CancellationToken cancellationToken = default);
}
