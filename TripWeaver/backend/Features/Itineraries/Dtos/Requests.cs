namespace TripWeaver.Features.Itineraries.Dtos;

public sealed record FlightInput(
    string FlightId,
    string Airline,
    string Origin,
    string Destination,
    DateTimeOffset DepartureTime,
    DateTimeOffset ArrivalTime,
    decimal Price,
    string Currency,
    int Stops);

public sealed record HotelInput(
    string HotelId,
    string Name,
    int StarRating,
    decimal PricePerNight,
    decimal TotalPrice,
    string Currency,
    DateOnly CheckIn,
    DateOnly CheckOut,
    List<string>? Amenities);

public sealed record ForecastInput(DateOnly Date, decimal High, decimal Low, string Condition);

public sealed record BudgetInput(decimal TotalBudget, decimal Spent, decimal Remaining, string Currency);

public sealed record PreferencesInput(bool StrictBudget = false);

public sealed record BuildItineraryRequest(
    string? Title,
    string? Destination,
    FlightInput Flight,
    HotelInput Hotel,
    List<ForecastInput> Weather,
    BudgetInput Budget,
    PreferencesInput? Preferences);

public sealed record UpdateActivityInput(
    TimeOnly? Time,
    string Title,
    string? Description,
    string? Location,
    decimal? EstimatedCost);

public sealed record UpdateDayInput(
    int DayNumber,
    string? Notes,
    List<UpdateActivityInput>? Activities);

public sealed record UpdateItineraryRequest(
    string? Title,
    List<UpdateDayInput>? Days);
