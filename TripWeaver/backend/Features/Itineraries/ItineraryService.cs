using Microsoft.EntityFrameworkCore;
using Npgsql;
using TripWeaver.Common.Domain;
using TripWeaver.Common.Errors;
using TripWeaver.Common.Web;
using TripWeaver.Features.Itineraries.Dtos;
using TripWeaver.Infrastructure.Persistence;

namespace TripWeaver.Features.Itineraries;

public sealed class ItineraryService(
    AppDbContext db,
    ItineraryValidator validator,
    ItineraryAssembler assembler,
    BudgetReconciler reconciler,
    ReferenceGenerator references,
    TimeProvider clock)
{
    public async Task<(ItineraryDto Dto, bool Replayed)> BuildAsync(
        Guid userId, string? idempotencyKey, BuildItineraryRequest req, CancellationToken ct)
    {
        var key = string.IsNullOrWhiteSpace(idempotencyKey) ? null : idempotencyKey.Trim();

        if (key is not null)
        {
            var replay = await QueryWithChildren()
                .FirstOrDefaultAsync(i => i.UserId == userId && i.IdempotencyKey == key, ct);
            if (replay is not null)
            {
                return (ToDto(replay), true);
            }
        }

        var trip = validator.Validate(req);
        var destination = ResolveDestination(req);
        var days = assembler.Assemble(req, trip, destination);
        var activityCosts = days.SelectMany(d => d.Activities)
            .Where(a => a.EstimatedCost.HasValue)
            .Select(a => a.EstimatedCost!.Value);
        var reconcile = reconciler.Reconcile(
            req.Flight.Price, req.Hotel.TotalPrice, activityCosts,
            req.Budget.TotalBudget, req.Preferences?.StrictBudget ?? false);

        var now = clock.GetUtcNow().UtcDateTime;
        var entity = new Itinerary
        {
            Id = Guid.NewGuid(),
            Reference = await AllocateReferenceAsync(ct),
            UserId = userId,
            Title = ResolveTitle(req, destination, trip),
            Destination = destination,
            StartDate = trip.Start,
            EndDate = trip.End,
            Status = ItineraryStatus.DRAFT,
            TotalCost = reconcile.TotalCost,
            Currency = trip.Currency,
            BudgetTotal = req.Budget.TotalBudget,
            BudgetRemaining = reconcile.BudgetRemaining,
            WithinBudget = reconcile.WithinBudget,
            IdempotencyKey = key,
            CreatedAt = now,
            UpdatedAt = now,
            Flight = req.Flight.ToSnapshot(),
            Hotel = req.Hotel.ToSnapshot(),
            Budget = req.Budget.ToSnapshot(),
            Weather = new Snapshots.WeatherSnapshot { Forecast = (req.Weather ?? []).Select(w => w.ToSnapshot()).ToList() },
            Days = days,
        };

        db.Itineraries.Add(entity);
        try
        {
            await db.SaveChangesAsync(ct);
        }
        catch (DbUpdateException ex) when (key is not null && IsIdempotencyConflict(ex))
        {
            db.ChangeTracker.Clear();
            var winner = await QueryWithChildren()
                .FirstOrDefaultAsync(i => i.UserId == userId && i.IdempotencyKey == key, ct);
            if (winner is not null)
            {
                return (ToDto(winner), true);
            }
            throw;
        }

        return (ToDto(entity), false);
    }

    public async Task<ItineraryDto> GetAsync(Guid userId, bool isAdmin, string reference, CancellationToken ct)
    {
        var entity = await LoadAsync(reference, ct) ?? throw new NotFoundException("Itinerary not found.");
        Authorize(entity, userId, isAdmin);
        return ToDto(entity);
    }

    public async Task<ListEnvelope<ItineraryListItemDto>> ListAsync(
        Guid userId, bool isAdmin, string? status, int? page, int? pageSize, CancellationToken ct)
    {
        var p = Pagination.ClampPage(page);
        var size = Pagination.ClampPageSize(pageSize);

        var query = db.Itineraries.AsNoTracking();
        if (!isAdmin)
        {
            query = query.Where(i => i.UserId == userId);
        }
        if (!string.IsNullOrWhiteSpace(status))
        {
            if (!Enum.TryParse<ItineraryStatus>(status, ignoreCase: true, out var parsed))
            {
                throw new ValidationException("status", "must be one of DRAFT, CONFIRMED, CANCELLED");
            }
            query = query.Where(i => i.Status == parsed);
        }

        var total = await query.CountAsync(ct);
        var rows = await query
            .OrderByDescending(i => i.CreatedAt)
            .Skip((p - 1) * size)
            .Take(size)
            .Select(i => new
            {
                i.Reference, i.Title, i.Destination, i.StartDate, i.EndDate,
                i.Status, i.TotalCost, i.Currency, i.WithinBudget, i.CreatedAt,
            })
            .ToListAsync(ct);

        var items = rows
            .Select(r => new ItineraryListItemDto(
                r.Reference, r.Title, r.Destination, r.StartDate, r.EndDate,
                r.Status.ToString(), r.TotalCost, r.Currency, r.WithinBudget, r.CreatedAt))
            .ToList();

        return new ListEnvelope<ItineraryListItemDto>(items, PageMeta.Of(p, size, total));
    }

    public async Task<ItineraryDto> UpdateAsync(
        Guid userId, bool isAdmin, string reference, string? ifMatch, UpdateItineraryRequest req, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(ifMatch))
        {
            throw new ValidationException("If-Match", "header is required for updates");
        }
        var clientXmin = DecodeRowVersion(ifMatch);

        var entity = await LoadAsync(reference, ct) ?? throw new NotFoundException("Itinerary not found.");
        Authorize(entity, userId, isAdmin);
        if (entity.Status == ItineraryStatus.CANCELLED)
        {
            throw new ConflictException("A cancelled itinerary cannot be updated.");
        }

        db.Entry(entity).Property("xmin").OriginalValue = clientXmin;

        if (req.Title is not null)
        {
            entity.Title = req.Title.Trim();
        }
        if (req.Days is not null)
        {
            var byNumber = entity.Days.ToDictionary(d => d.DayNumber);
            foreach (var dayUpdate in req.Days)
            {
                if (!byNumber.TryGetValue(dayUpdate.DayNumber, out var day))
                {
                    continue;
                }
                if (dayUpdate.Notes is not null)
                {
                    day.Notes = dayUpdate.Notes;
                }
                if (dayUpdate.Activities is not null)
                {
                    day.Activities.Clear();
                    foreach (var activity in dayUpdate.Activities)
                    {
                        day.Activities.Add(new ItineraryActivity
                        {
                            Id = Guid.NewGuid(),
                            Time = activity.Time,
                            Title = activity.Title,
                            Description = activity.Description,
                            Location = activity.Location,
                            EstimatedCost = activity.EstimatedCost,
                        });
                    }
                }
            }
        }

        RecomputeTotals(entity);
        entity.UpdatedAt = clock.GetUtcNow().UtcDateTime;

        await db.SaveChangesAsync(ct);
        return ToDto(entity);
    }

    public async Task<ItineraryDto> CancelAsync(Guid userId, bool isAdmin, string reference, CancellationToken ct)
    {
        var entity = await LoadAsync(reference, ct) ?? throw new NotFoundException("Itinerary not found.");
        Authorize(entity, userId, isAdmin);

        if (entity.Status != ItineraryStatus.CANCELLED)
        {
            entity.Status = ItineraryStatus.CANCELLED;
            entity.UpdatedAt = clock.GetUtcNow().UtcDateTime;
            await db.SaveChangesAsync(ct);
        }

        return ToDto(entity);
    }

    private IQueryable<Itinerary> QueryWithChildren() =>
        db.Itineraries.Include(i => i.Days).ThenInclude(d => d.Activities);

    private async Task<Itinerary?> LoadAsync(string reference, CancellationToken ct) =>
        await QueryWithChildren().FirstOrDefaultAsync(i => i.Reference == reference, ct);

    private void RecomputeTotals(Itinerary entity)
    {
        var activities = entity.Days
            .SelectMany(d => d.Activities)
            .Where(a => a.EstimatedCost.HasValue)
            .Select(a => a.EstimatedCost!.Value)
            .Sum();
        var total = decimal.Round(entity.Flight.Price + entity.Hotel.TotalPrice + activities, 2, MidpointRounding.AwayFromZero);
        entity.TotalCost = total;
        entity.BudgetRemaining = decimal.Round(entity.BudgetTotal - total, 2, MidpointRounding.AwayFromZero);
        entity.WithinBudget = total <= entity.BudgetTotal;
    }

    private async Task<string> AllocateReferenceAsync(CancellationToken ct)
    {
        for (var attempt = 0; attempt < 5; attempt++)
        {
            var reference = references.Next();
            if (!await db.Itineraries.AnyAsync(i => i.Reference == reference, ct))
            {
                return reference;
            }
        }
        throw new ConflictException("Could not allocate a unique itinerary reference; please retry.");
    }

    private ItineraryDto ToDto(Itinerary entity)
    {
        var xmin = (uint)db.Entry(entity).Property("xmin").CurrentValue!;
        var rowVersion = Convert.ToBase64String(BitConverter.GetBytes(xmin));
        return ItineraryMapping.ToDto(entity, rowVersion);
    }

    private static void Authorize(Itinerary entity, Guid userId, bool isAdmin)
    {
        if (!isAdmin && entity.UserId != userId)
        {
            throw new ForbiddenException();
        }
    }

    private static uint DecodeRowVersion(string ifMatch)
    {
        var raw = ifMatch.Trim().Trim('"');
        try
        {
            var bytes = Convert.FromBase64String(raw);
            if (bytes.Length != 4)
            {
                throw new FormatException();
            }
            return BitConverter.ToUInt32(bytes, 0);
        }
        catch (FormatException)
        {
            throw new ValidationException("If-Match", "is not a valid row version");
        }
    }

    private static bool IsIdempotencyConflict(DbUpdateException ex) =>
        ex.InnerException is PostgresException { SqlState: "23505" } pg &&
        (pg.ConstraintName?.Contains("IdempotencyKey", StringComparison.OrdinalIgnoreCase) ?? false);

    private static string ResolveDestination(BuildItineraryRequest req) =>
        !string.IsNullOrWhiteSpace(req.Destination) ? req.Destination!.Trim() : req.Flight.Destination.Trim();

    private static string ResolveTitle(BuildItineraryRequest req, string destination, ValidatedTrip trip) =>
        !string.IsNullOrWhiteSpace(req.Title)
            ? req.Title!.Trim()
            : $"Trip to {destination} ({trip.Start:yyyy-MM-dd} – {trip.End:yyyy-MM-dd})";
}
