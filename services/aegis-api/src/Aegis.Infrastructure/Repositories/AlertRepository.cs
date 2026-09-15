using Aegis.Application.Abstractions.Repositories;
using Aegis.Domain.Entities;
using Aegis.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Aegis.Infrastructure.Repositories;

public class AlertRepository(AegisDbContext dbContext) : IAlertRepository
{
    public async Task<Alert?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await dbContext.Alerts
            .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<Alert>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await dbContext.Alerts
            .AsNoTracking()
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Alert>> GetUnacknowledgedAlertsAsync(CancellationToken cancellationToken = default)
    {
        return await dbContext.Alerts
            .AsNoTracking()
            .Where(a => !a.IsAcknowledged)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Alert alert, CancellationToken cancellationToken = default)
    {
        await dbContext.Alerts.AddAsync(alert, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(Alert alert, CancellationToken cancellationToken = default)
    {
        dbContext.Alerts.Update(alert);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
