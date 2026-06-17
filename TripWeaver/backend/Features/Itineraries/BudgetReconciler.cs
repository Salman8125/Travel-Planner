using TripWeaver.Common.Errors;

namespace TripWeaver.Features.Itineraries;

public sealed record ReconcileResult(decimal TotalCost, decimal BudgetRemaining, bool WithinBudget);

public sealed class BudgetReconciler
{
    public ReconcileResult Reconcile(
        decimal flightPrice,
        decimal hotelTotal,
        IEnumerable<decimal> activityCosts,
        decimal budgetTotal,
        bool strict)
    {
        var activities = activityCosts.Sum();
        var total = decimal.Round(flightPrice + hotelTotal + activities, 2, MidpointRounding.AwayFromZero);
        var remaining = decimal.Round(budgetTotal - total, 2, MidpointRounding.AwayFromZero);
        var withinBudget = total <= budgetTotal;

        if (!withinBudget && strict)
        {
            var overage = decimal.Round(total - budgetTotal, 2, MidpointRounding.AwayFromZero);
            throw new ConflictException(
                "The itinerary exceeds the budget.",
                new Dictionary<string, string> { ["budget"] = $"over budget by {overage}" });
        }

        return new ReconcileResult(total, remaining, withinBudget);
    }
}
