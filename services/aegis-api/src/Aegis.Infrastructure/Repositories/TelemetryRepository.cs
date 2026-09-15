using Aegis.Application.Abstractions.Repositories;
using Aegis.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using TelemetryEntity = Aegis.Domain.Entities.Telemetry;

namespace Aegis.Infrastructure.Repositories;

public class TelemetryRepository(AegisDbContext dbContext) : ITelemetryRepository
{
    public async Task AddAsync(TelemetryEntity telemetry, CancellationToken cancellationToken = default)
    {
        await dbContext.Telemetries.AddAsync(telemetry, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<TelemetryEntity>> GetByVehicleIdAsync(Guid vehicleId, int limit = 100, CancellationToken cancellationToken = default)
    {
        return await dbContext.Telemetries
            .AsNoTracking()
            .Where(t => t.VehicleId == vehicleId)
            .OrderByDescending(t => t.Timestamp)
            .Take(limit)
            .ToListAsync(cancellationToken);
    }

    public async Task<TelemetryEntity?> GetLatestByVehicleIdAsync(Guid vehicleId, CancellationToken cancellationToken = default)
    {
        return await dbContext.Telemetries
            .AsNoTracking()
            .Where(t => t.VehicleId == vehicleId)
            .OrderByDescending(t => t.Timestamp)
            .FirstOrDefaultAsync(cancellationToken);
    }
}
