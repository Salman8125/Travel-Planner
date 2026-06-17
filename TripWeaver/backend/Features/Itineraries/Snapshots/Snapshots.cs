namespace TripWeaver.Features.Itineraries.Snapshots;

public class FlightSelection
{
    public string FlightId { get; set; } = string.Empty;
    public string Airline { get; set; } = string.Empty;
    public string Origin { get; set; } = string.Empty;
    public string Destination { get; set; } = string.Empty;
    public DateTimeOffset DepartureTime { get; set; }
    public DateTimeOffset ArrivalTime { get; set; }
    public decimal Price { get; set; }
    public string Currency { get; set; } = string.Empty;
    public int Stops { get; set; }
}

public class HotelSelection
{
    public string HotelId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int StarRating { get; set; }
    public decimal PricePerNight { get; set; }
    public decimal TotalPrice { get; set; }
    public string Currency { get; set; } = string.Empty;
    public DateOnly CheckIn { get; set; }
    public DateOnly CheckOut { get; set; }
    public List<string> Amenities { get; set; } = [];
}

public class BudgetSummary
{
    public decimal TotalBudget { get; set; }
    public decimal Spent { get; set; }
    public decimal Remaining { get; set; }
    public string Currency { get; set; } = string.Empty;
}

public class WeatherSnapshot
{
    public List<DailyForecastSnapshot> Forecast { get; set; } = [];
}

public class DailyForecastSnapshot
{
    public DateOnly Date { get; set; }
    public decimal High { get; set; }
    public decimal Low { get; set; }
    public string Condition { get; set; } = string.Empty;
}
