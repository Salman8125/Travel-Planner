using TripWeaver.Features.Itineraries.Dtos;

namespace TripWeaver.Tests;

public sealed class FixedClock(DateTimeOffset now) : TimeProvider
{
    public override DateTimeOffset GetUtcNow() => now;
}

public static class TestData
{
    public static FlightInput Flight(DateOnly arrivalDate, string currency = "USD", decimal price = 742m) => new(
        FlightId: "FL-1001",
        Airline: "Skyline",
        Origin: "JFK",
        Destination: "LHR",
        DepartureTime: arrivalDate.ToDateTime(new TimeOnly(6, 0), DateTimeKind.Utc),
        ArrivalTime: arrivalDate.ToDateTime(new TimeOnly(10, 0), DateTimeKind.Utc),
        Price: price,
        Currency: currency,
        Stops: 0);

    public static HotelInput Hotel(DateOnly checkIn, DateOnly checkOut, string currency = "USD", decimal total = 540m) => new(
        HotelId: "HT-1",
        Name: "The Thames View",
        StarRating: 4,
        PricePerNight: 180m,
        TotalPrice: total,
        Currency: currency,
        CheckIn: checkIn,
        CheckOut: checkOut,
        Amenities: ["WiFi", "Breakfast"]);

    public static List<ForecastInput> Weather(DateOnly start, DateOnly end)
    {
        var list = new List<ForecastInput>();
        for (var d = start; d <= end; d = d.AddDays(1))
        {
            list.Add(new ForecastInput(d, 24m, 15m, "SUNNY"));
        }
        return list;
    }

    public static BudgetInput Budget(decimal total = 5000m, string currency = "USD") =>
        new(total, 1200m, total - 1200m, currency);

    public static BuildItineraryRequest ValidBuild(
        DateOnly start,
        DateOnly end,
        decimal budgetTotal = 5000m,
        bool strictBudget = false,
        string flightCurrency = "USD",
        string hotelCurrency = "USD",
        string budgetCurrency = "USD")
    {
        return new BuildItineraryRequest(
            Title: "Test Trip",
            Destination: "London",
            Flight: Flight(start, flightCurrency),
            Hotel: Hotel(start, end, hotelCurrency),
            Weather: Weather(start, end),
            Budget: Budget(budgetTotal, budgetCurrency),
            Preferences: new PreferencesInput(strictBudget));
    }
}
