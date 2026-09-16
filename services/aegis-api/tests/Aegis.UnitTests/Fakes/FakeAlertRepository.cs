using Aegis.Application.Abstractions.Repositories;
using Aegis.Domain.Entities;

namespace Aegis.UnitTests.Fakes;

public class FakeAlertRepository : IAlertRepository
{
    private readonly List<Alert> _alerts = [];

    public Task AddAsync(Alert alert, CancellationToken cancellationToken = default)
    {
        _alerts.Add(alert);
        return Task.CompletedTask;
    }

    public Task<Alert?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var alert = _alerts.FirstOrDefault(a => a.Id == id);
        return Task.FromResult(alert);
    }

    public Task<IReadOnlyList<Alert>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        IReadOnlyList<Alert> list = _alerts.ToList().AsReadOnly();
        return Task.FromResult(list);
    }

    public Task<IReadOnlyList<Alert>> GetUnacknowledgedAlertsAsync(CancellationToken cancellationToken = default)
    {
        IReadOnlyList<Alert> list = _alerts.Where(a => !a.IsAcknowledged).ToList().AsReadOnly();
        return Task.FromResult(list);
    }

    public Task UpdateAsync(Alert alert, CancellationToken cancellationToken = default)
    {
        var index = _alerts.FindIndex(a => a.Id == alert.Id);
        if (index >= 0)
        {
            _alerts[index] = alert;
        }
        return Task.CompletedTask;
    }
}
