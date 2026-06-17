using TripWeaver.Features.Itineraries.Dtos;

namespace TripWeaver.Features.Itineraries;

public sealed class ItineraryAssembler
{
    public List<ItineraryDay> Assemble(BuildItineraryRequest req, ValidatedTrip trip, string destination)
    {
        var forecastByDate = (req.Weather ?? [])
            .GroupBy(w => w.Date)
            .ToDictionary(g => g.Key, g => g.First());

        var days = new List<ItineraryDay>();
        var dayNumber = 1;
        for (var date = trip.Start; date <= trip.End; date = date.AddDays(1), dayNumber++)
        {
            var isArrival = date == trip.Start;
            var isDeparture = date == trip.End;
            forecastByDate.TryGetValue(date, out var forecast);

            days.Add(new ItineraryDay
            {
                Id = Guid.NewGuid(),
                Date = date,
                DayNumber = dayNumber,
                Summary = DaySummary(isArrival, isDeparture, destination),
                HighC = forecast?.High,
                LowC = forecast?.Low,
                Condition = forecast?.Condition,
                Notes = forecast is null ? "No forecast available for this day." : null,
                Activities = DefaultActivities(isArrival, isDeparture, destination, req),
            });
        }

        return days;
    }

    private static List<ItineraryActivity> DefaultActivities(
        bool isArrival, bool isDeparture, string destination, BuildItineraryRequest req)
    {
        var activities = new List<ItineraryActivity>();
        var flight = req.Flight;
        var hotel = req.Hotel;

        if (isArrival)
        {
            activities.Add(Activity(
                $"Arrive in {destination} on {flight.Airline} {flight.FlightId}",
                TimeOnly.FromDateTime(flight.ArrivalTime.UtcDateTime)));
            activities.Add(Activity($"Check in to {hotel.Name}", new TimeOnly(15, 0)));
        }

        if (!isArrival && !isDeparture)
        {
            activities.Add(Activity($"Explore {destination}", new TimeOnly(9, 0)));
            activities.Add(Activity("Local dining experience", new TimeOnly(19, 0)));
        }

        if (isDeparture)
        {
            activities.Add(Activity($"Check out of {hotel.Name}", new TimeOnly(11, 0)));
            activities.Add(Activity($"Depart {destination}", null));
        }

        return activities;
    }

    private static ItineraryActivity Activity(string title, TimeOnly? time) => new()
    {
        Id = Guid.NewGuid(),
        Time = time,
        Title = title,
        EstimatedCost = null,
    };

    private static string DaySummary(bool isArrival, bool isDeparture, string destination) =>
        (isArrival, isDeparture) switch
        {
            (true, true) => $"Day trip to {destination}: arrive, explore and depart.",
            (true, false) => $"Arrival in {destination}: settle in and check into the hotel.",
            (false, true) => $"Departure day: check out and head home from {destination}.",
            _ => $"Full day exploring {destination}.",
        };
}
