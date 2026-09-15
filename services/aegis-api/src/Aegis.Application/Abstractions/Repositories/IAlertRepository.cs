using Aegis.Domain.Entities;

namespace Aegis.Application.Abstractions.Repositories;

public interface IAlertRepository
{
    Task<Alert?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Alert>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Alert>> GetUnacknowledgedAlertsAsync(CancellationToken cancellationToken = default);
    Task AddAsync(Alert alert, CancellationToken cancellationToken = default);
    Task UpdateAsync(Alert alert, CancellationToken cancellationToken = default);
}
