using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TelemetryEntity = Aegis.Domain.Entities.Telemetry;

namespace Aegis.Infrastructure.Persistence.Configurations;

public class TelemetryConfiguration : IEntityTypeConfiguration<TelemetryEntity>
{
    public void Configure(EntityTypeBuilder<TelemetryEntity> builder)
    {
        builder.ToTable("telemetries");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.VehicleId).IsRequired();
        builder.Property(t => t.Altitude).IsRequired();
        builder.Property(t => t.Speed).IsRequired();
        builder.Property(t => t.BatteryPercentage).IsRequired();
        builder.Property(t => t.Temperature).IsRequired();
        builder.Property(t => t.Timestamp).IsRequired();

        // İndeksler
        builder.HasIndex(t => t.VehicleId);
        builder.HasIndex(t => new { t.VehicleId, t.Timestamp });

        // Location Value Object mapping (EF Core OwnsOne)
        builder.OwnsOne(t => t.Location, locationBuilder =>
        {
            locationBuilder.Property(l => l.Latitude)
                .HasColumnName("latitude")
                .IsRequired();

            locationBuilder.Property(l => l.Longitude)
                .HasColumnName("longitude")
                .IsRequired();
        });
    }
}
