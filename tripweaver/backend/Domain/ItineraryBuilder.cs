using System.Globalization;

namespace TripWeaver.Domain;

// Domain layer — pure business logic. MUST NOT touch HTTP. Synchronous (no polling).
// A later A2A phase wraps Build directly. Composes the four inputs into one itinerary object.
public static class ItineraryBuilder
{
    public static ItineraryResult Build(BuildRequest req)
    {
        var estimatedCost = req.Flight.Price + req.Hotel.TotalPrice;
        var withinBudget = estimatedCost <= req.Budget.Remaining;
        var summary = string.Format(
            CultureInfo.InvariantCulture,
            "Trip to {0} on {1}, staying at {2}. Estimated ${3:0.00} ({4}).",
            req.Flight.Destination,
            req.Flight.Airline,
            req.Hotel.Name,
            estimatedCost,
            withinBudget ? "within budget" : "OVER budget");

        return new ItineraryResult(
            Destination: req.Flight.Destination,
            Flight: req.Flight,
            Hotel: req.Hotel,
            Forecast: req.Forecast,
            EstimatedCost: estimatedCost,
            WithinBudget: withinBudget,
            Summary: summary);
    }
}
