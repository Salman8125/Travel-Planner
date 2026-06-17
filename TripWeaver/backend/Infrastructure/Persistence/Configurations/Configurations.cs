using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TripWeaver.Features.Itineraries;
using TripWeaver.Features.Users;

namespace TripWeaver.Infrastructure.Persistence.Configurations;

public sealed class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> b)
    {
        b.ToTable("users");
        b.HasKey(u => u.Id);
        b.Property(u => u.Email).HasMaxLength(255).IsRequired();
        b.HasIndex(u => u.Email).IsUnique();
        b.Property(u => u.PasswordHash).HasMaxLength(255).IsRequired();
        b.Property(u => u.Role).HasConversion<string>().HasMaxLength(16).IsRequired();
    }
}

public sealed class ItineraryConfiguration : IEntityTypeConfiguration<Itinerary>
{
    public void Configure(EntityTypeBuilder<Itinerary> b)
    {
        b.ToTable("itineraries");
        b.HasKey(i => i.Id);

        b.Property<uint>("xmin")
            .HasColumnType("xid")
            .ValueGeneratedOnAddOrUpdate()
            .IsConcurrencyToken();

        b.Property(i => i.Reference).HasMaxLength(6).IsFixedLength().IsRequired();
        b.HasIndex(i => i.Reference).IsUnique();

        b.Property(i => i.Title).HasMaxLength(200).IsRequired();
        b.Property(i => i.Destination).HasMaxLength(200).IsRequired();
        b.Property(i => i.Currency).HasMaxLength(3).IsFixedLength().IsRequired();
        b.Property(i => i.Status).HasConversion<string>().HasMaxLength(16).IsRequired();

        b.Property(i => i.IdempotencyKey).HasMaxLength(200);
        b.HasIndex(i => i.IdempotencyKey).IsUnique();

        b.HasIndex(i => new { i.UserId, i.Status });
        b.HasIndex(i => i.CreatedAt);

        b.HasOne<User>()
            .WithMany()
            .HasForeignKey(i => i.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        b.OwnsOne(i => i.Flight, o => o.ToJson("flight"));
        b.OwnsOne(i => i.Hotel, o => o.ToJson("hotel"));
        b.OwnsOne(i => i.Budget, o => o.ToJson("budget"));
        b.OwnsOne(i => i.Weather, o =>
        {
            o.ToJson("weather");
            o.OwnsMany(w => w.Forecast);
        });
        b.Navigation(i => i.Flight).IsRequired();
        b.Navigation(i => i.Hotel).IsRequired();
        b.Navigation(i => i.Budget).IsRequired();
        b.Navigation(i => i.Weather).IsRequired();

        b.HasMany(i => i.Days)
            .WithOne()
            .HasForeignKey(d => d.ItineraryId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public sealed class ItineraryDayConfiguration : IEntityTypeConfiguration<ItineraryDay>
{
    public void Configure(EntityTypeBuilder<ItineraryDay> b)
    {
        b.ToTable("itinerary_days");
        b.HasKey(d => d.Id);
        b.Property(d => d.Summary).HasMaxLength(500).IsRequired();
        b.Property(d => d.Condition).HasMaxLength(32);
        b.Property(d => d.Notes).HasMaxLength(500);
        b.Property(d => d.HighC).HasPrecision(5, 2);
        b.Property(d => d.LowC).HasPrecision(5, 2);
        b.HasIndex(d => new { d.ItineraryId, d.Date });

        b.HasMany(d => d.Activities)
            .WithOne()
            .HasForeignKey(a => a.ItineraryDayId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public sealed class ItineraryActivityConfiguration : IEntityTypeConfiguration<ItineraryActivity>
{
    public void Configure(EntityTypeBuilder<ItineraryActivity> b)
    {
        b.ToTable("itinerary_activities");
        b.HasKey(a => a.Id);
        b.Property(a => a.Title).HasMaxLength(200).IsRequired();
        b.Property(a => a.Description).HasMaxLength(1000);
        b.Property(a => a.Location).HasMaxLength(200);
        b.Property(a => a.EstimatedCost).HasPrecision(12, 2);
    }
}
