using TripWeaver.Features.Itineraries.Dtos;
using TripWeaver.Features.Itineraries.Snapshots;

namespace TripWeaver.Features.Itineraries;

public static class ItineraryMapping
{
    public static FlightSelection ToSnapshot(this FlightInput f) => new()
    {
        FlightId = f.FlightId,
        Airline = f.Airline,
        Origin = f.Origin,
        Destination = f.Destination,
        DepartureTime = f.DepartureTime,
        ArrivalTime = f.ArrivalTime,
        Price = f.Price,
        Currency = f.Currency.Trim().ToUpperInvariant(),
        Stops = f.Stops,
    };

    public static HotelSelection ToSnapshot(this HotelInput h) => new()
    {
        HotelId = h.HotelId,
        Name = h.Name,
        StarRating = h.StarRating,
        PricePerNight = h.PricePerNight,
        TotalPrice = h.TotalPrice,
        Currency = h.Currency.Trim().ToUpperInvariant(),
        CheckIn = h.CheckIn,
        CheckOut = h.CheckOut,
        Amenities = h.Amenities ?? [],
    };

    public static BudgetSummary ToSnapshot(this BudgetInput b) => new()
    {
        TotalBudget = b.TotalBudget,
        Spent = b.Spent,
        Remaining = b.Remaining,
        Currency = b.Currency.Trim().ToUpperInvariant(),
    };

    public static DailyForecastSnapshot ToSnapshot(this ForecastInput f) => new()
    {
        Date = f.Date,
        High = f.High,
        Low = f.Low,
        Condition = f.Condition,
    };

    public static ItineraryDto ToDto(Itinerary it, string rowVersion) => new(
        it.Reference,
        it.Title,
        it.Destination,
        it.StartDate,
        it.EndDate,
        it.Status.ToString(),
        it.TotalCost,
        it.Currency,
        it.BudgetTotal,
        it.BudgetRemaining,
        it.WithinBudget,
        rowVersion,
        it.CreatedAt,
        it.UpdatedAt,
        it.Flight,
        it.Hotel,
        it.Budget,
        it.Weather.Forecast.OrderBy(f => f.Date).ToList(),
        it.Days.OrderBy(d => d.DayNumber).Select(ToDayDto).ToList());

    private static ItineraryDayDto ToDayDto(ItineraryDay d) => new(
        d.Date,
        d.DayNumber,
        d.Summary,
        d.HighC,
        d.LowC,
        d.Condition,
        d.Notes,
        d.Activities
            .OrderBy(a => a.Time ?? TimeOnly.MaxValue)
            .Select(a => new ItineraryActivityDto(a.Time, a.Title, a.Description, a.Location, a.EstimatedCost))
            .ToList());
}
