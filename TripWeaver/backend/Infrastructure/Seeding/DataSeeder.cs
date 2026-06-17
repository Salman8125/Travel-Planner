using Microsoft.EntityFrameworkCore;
using TripWeaver.Common.Domain;
using TripWeaver.Common.Security;
using TripWeaver.Features.Users;
using TripWeaver.Infrastructure.Persistence;

namespace TripWeaver.Infrastructure.Seeding;

public sealed class SeedOptions
{
    public const string SectionName = "Seed";
    public bool Enabled { get; set; }
}

public sealed class DataSeeder(AppDbContext db, PasswordHasher hasher, ILogger<DataSeeder> logger)
{
    public async Task SeedAsync(CancellationToken ct = default)
    {
        if (await db.Users.AnyAsync(ct))
        {
            logger.LogInformation("Seed skipped: data already present.");
            return;
        }

        db.Users.AddRange(
            NewUser("admin@tripweaver.dev", "admin12345", Role.ADMIN),
            NewUser("user@tripweaver.dev", "user12345", Role.USER));
        await db.SaveChangesAsync(ct);
        logger.LogInformation("Seed complete: 2 users created.");
    }

    private User NewUser(string email, string password, Role role) => new()
    {
        Id = Guid.NewGuid(),
        Email = email,
        PasswordHash = hasher.Hash(password),
        Role = role,
        CreatedAt = DateTime.UtcNow,
    };
}
