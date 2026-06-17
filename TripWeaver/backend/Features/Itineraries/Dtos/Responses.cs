using TripWeaver.Features.Itineraries.Snapshots;

namespace TripWeaver.Features.Itineraries.Dtos;

public sealed record ItineraryActivityDto(
    TimeOnly? Time,
    string Title,
    string? Description,
    string? Location,
    decimal? EstimatedCost);

public sealed record ItineraryDayDto(
    DateOnly Date,
    int DayNumber,
    string Summary,
    decimal? HighC,
    decimal? LowC,
    string? Condition,
    string? Notes,
    IReadOnlyList<ItineraryActivityDto> Activities);

public sealed record ItineraryDto(
    string Reference,
    string Title,
    string Destination,
    DateOnly StartDate,
    DateOnly EndDate,
    string Status,
    decimal TotalCost,
    string Currency,
    decimal BudgetTotal,
    decimal BudgetRemaining,
    bool WithinBudget,
    string RowVersion,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    FlightSelection Flight,
    HotelSelection Hotel,
    BudgetSummary Budget,
    IReadOnlyList<DailyForecastSnapshot> Weather,
    IReadOnlyList<ItineraryDayDto> Days);

public sealed record ItineraryListItemDto(
    string Reference,
    string Title,
    string Destination,
    DateOnly StartDate,
    DateOnly EndDate,
    string Status,
    decimal TotalCost,
    string Currency,
    bool WithinBudget,
    DateTime CreatedAt);
