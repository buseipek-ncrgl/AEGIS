using Aegis.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Aegis.Infrastructure.Persistence.Configurations;

public class MissionConfiguration : IEntityTypeConfiguration<Mission>
{
    public void Configure(EntityTypeBuilder<Mission> builder)
    {
        builder.ToTable("missions");

        builder.HasKey(m => m.Id);

        builder.Property(m => m.Title)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(m => m.Status)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(m => m.CreatedAt).IsRequired();

        // Waypoint listesi (OwnsMany)
        builder.OwnsMany(m => m.Waypoints, wp =>
        {
            wp.ToTable("mission_waypoints");
            wp.WithOwner().HasForeignKey("MissionId");
            wp.Property<int>("Id");
            wp.HasKey("Id");

            wp.OwnsOne(w => w.Location, loc =>
            {
                loc.Property(l => l.Latitude).HasColumnName("latitude");
                loc.Property(l => l.Longitude).HasColumnName("longitude");
            });
        });
    }
}
