using System.Net.Sockets;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace TripWeaver.Infrastructure.Persistence;

public sealed class DbInitializer(AppDbContext db, ILogger<DbInitializer> logger)
{
    private const int MaxAttempts = 10;

    public async Task MigrateAsync(CancellationToken ct = default)
    {
        for (var attempt = 1; ; attempt++)
        {
            try
            {
                await db.Database.MigrateAsync(ct);
                logger.LogInformation("Database migrations applied.");
                return;
            }
            catch (Exception ex) when (attempt < MaxAttempts && IsTransient(ex))
            {
                logger.LogWarning(
                    "Migrate attempt {Attempt}/{Max} failed ({Message}); retrying in 2s.",
                    attempt, MaxAttempts, ex.Message);
                await Task.Delay(TimeSpan.FromSeconds(2), ct);
            }
        }
    }

    private static bool IsTransient(Exception ex) =>
        ex is NpgsqlException or SocketException ||
        ex.InnerException is NpgsqlException or SocketException;
}
