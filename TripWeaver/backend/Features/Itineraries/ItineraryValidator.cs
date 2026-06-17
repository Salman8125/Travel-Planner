using Microsoft.Extensions.Options;
using TripWeaver.Common.Errors;
using TripWeaver.Features.Itineraries.Dtos;

namespace TripWeaver.Features.Itineraries;

public sealed record ValidatedTrip(DateOnly Start, DateOnly End, string Currency, IReadOnlyList<DateOnly> CoverageGaps);

public sealed class ItineraryValidator(IOptions<TripOptions> options, TimeProvider clock)
{
    private readonly TripOptions _options = options.Value;

    public ValidatedTrip Validate(BuildItineraryRequest req)
    {
        var flight = req.Flight;
        var hotel = req.Hotel;
        var budget = req.Budget;
        var weather = req.Weather ?? [];

        if (string.Equals(flight.Origin.Trim(), flight.Destination.Trim(), StringComparison.OrdinalIgnoreCase))
        {
            throw new ValidationException("flight.destination", "must differ from the origin");
        }
        if (flight.ArrivalTime <= flight.DepartureTime)
        {
            throw new ValidationException("flight.arrivalTime", "must be after the departure time");
        }

        var start = DateOnly.FromDateTime(flight.ArrivalTime.UtcDateTime);
        var end = hotel.CheckOut;

        if (end < start)
        {
            throw new ValidationException("hotel.checkOut", "must be on or after the flight arrival date");
        }

        var today = DateOnly.FromDateTime(clock.GetUtcNow().UtcDateTime);
        if (start < today)
        {
            throw new ValidationException("flight.arrivalTime", "the trip cannot start in the past");
        }

        var span = end.DayNumber - start.DayNumber + 1;
        if (span > _options.MaxTripDays)
        {
            throw new ValidationException("hotel.checkOut", $"the trip exceeds the maximum of {_options.MaxTripDays} days");
        }

        if (hotel.CheckIn > start)
        {
            throw new ConflictException(
                "The hotel does not cover the trip dates.",
                new Dictionary<string, string> { ["hotel.checkIn"] = "must be on or before the flight arrival date" });
        }
        if (hotel.CheckOut < end)
        {
            throw new ConflictException(
                "The hotel does not cover the trip dates.",
                new Dictionary<string, string> { ["hotel.checkOut"] = "must be on or after the trip end date" });
        }

        var currency = Normalize(budget.Currency);
        if (Normalize(flight.Currency) != currency || Normalize(hotel.Currency) != currency)
        {
            throw new ConflictException(
                "Flight, hotel and budget currencies must match.",
                new Dictionary<string, string> { ["currency"] = "flight, hotel and budget must use the same currency" });
        }

        if (weather.Count == 0 && span > 1)
        {
            throw new ValidationException("weather", "a forecast is required for multi-day trips");
        }

        var forecastDates = weather.Select(w => w.Date).ToHashSet();
        var gaps = new List<DateOnly>();
        for (var date = start; date <= end; date = date.AddDays(1))
        {
            if (!forecastDates.Contains(date))
            {
                gaps.Add(date);
            }
        }

        return new ValidatedTrip(start, end, currency, gaps);
    }

    private static string Normalize(string currency) => currency.Trim().ToUpperInvariant();
}
