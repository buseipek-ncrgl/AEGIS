using Aegis.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Aegis.Infrastructure.Persistence.Configurations;

public class VehicleConfiguration : IEntityTypeConfiguration<Vehicle>
{
    public void Configure(EntityTypeBuilder<Vehicle> builder)
    {
        builder.ToTable("vehicles");

        builder.HasKey(v => v.Id);

        builder.Property(v => v.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(v => v.Type)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(v => v.Status)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(v => v.LastSeenAt)
            .IsRequired();
    }
}
