using TripWeaver.Common.Domain;
using TripWeaver.Features.Itineraries.Snapshots;

namespace TripWeaver.Features.Itineraries;

public class Itinerary
{
    public Guid Id { get; set; }
    public string Reference { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Destination { get; set; } = string.Empty;
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public ItineraryStatus Status { get; set; }
    public decimal TotalCost { get; set; }
    public string Currency { get; set; } = string.Empty;
    public decimal BudgetTotal { get; set; }
    public decimal BudgetRemaining { get; set; }
    public bool WithinBudget { get; set; }
    public string? IdempotencyKey { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public FlightSelection Flight { get; set; } = null!;
    public HotelSelection Hotel { get; set; } = null!;
    public BudgetSummary Budget { get; set; } = null!;
    public WeatherSnapshot Weather { get; set; } = null!;

    public List<ItineraryDay> Days { get; set; } = [];
}

public class ItineraryDay
{
    public Guid Id { get; set; }
    public Guid ItineraryId { get; set; }
    public DateOnly Date { get; set; }
    public int DayNumber { get; set; }
    public string Summary { get; set; } = string.Empty;
    public decimal? HighC { get; set; }
    public decimal? LowC { get; set; }
    public string? Condition { get; set; }
    public string? Notes { get; set; }
    public List<ItineraryActivity> Activities { get; set; } = [];
}

public class ItineraryActivity
{
    public Guid Id { get; set; }
    public Guid ItineraryDayId { get; set; }
    public TimeOnly? Time { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Location { get; set; }
    public decimal? EstimatedCost { get; set; }
}
