namespace TripWeaver.Domain;

// Domain data shapes. Inputs mirror the other domains' shapes (passed in the request body —
// there are NO backend-to-backend calls). Pure records, no HTTP concerns.

public record FlightOption(
    string FlightId,
    string Airline,
    string Origin,
    string Destination,
    string DepartureTime,
    string ArrivalTime,
    decimal Price,
    int Stops);

public record HotelOption(
    string HotelId,
    string Name,
    int StarRating,
    decimal PricePerNight,
    decimal TotalPrice,
    List<string> Amenities);

public record DailyForecast(
    string Date,
    decimal High,
    decimal Low,
    string Condition);

public record BudgetStatus(
    decimal TotalBudget,
    decimal Spent,
    decimal Remaining);

// Request bundle for build_itinerary.
public record BuildRequest(
    FlightOption Flight,
    HotelOption Hotel,
    List<DailyForecast> Forecast,
    BudgetStatus Budget);

// Response.
public record ItineraryResult(
    string Destination,
    FlightOption Flight,
    HotelOption Hotel,
    List<DailyForecast> Forecast,
    decimal EstimatedCost,
    bool WithinBudget,
    string Summary);
