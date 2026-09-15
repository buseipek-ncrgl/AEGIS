using Aegis.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using TelemetryEntity = Aegis.Domain.Entities.Telemetry;

namespace Aegis.Infrastructure.Persistence;

public class AegisDbContext(DbContextOptions<AegisDbContext> options) : DbContext(options)
{
    public DbSet<Vehicle> Vehicles => Set<Vehicle>();
    public DbSet<TelemetryEntity> Telemetries => Set<TelemetryEntity>();
    public DbSet<Mission> Missions => Set<Mission>();
    public DbSet<Alert> Alerts => Set<Alert>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Bulunduğu assembly içindeki tüm IEntityTypeConfiguration sınıflarını otomatik uygula
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AegisDbContext).Assembly);
    }
}
