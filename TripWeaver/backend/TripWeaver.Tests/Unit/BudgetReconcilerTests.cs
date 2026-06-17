using FluentAssertions;
using TripWeaver.Common.Errors;
using TripWeaver.Features.Itineraries;

namespace TripWeaver.Tests.Unit;

public sealed class BudgetReconcilerTests
{
    private readonly BudgetReconciler _reconciler = new();

    [Fact]
    public void Sums_flight_hotel_and_activities()
    {
        var result = _reconciler.Reconcile(742m, 540m, [20m, 30m], 5000m, strict: false);

        result.TotalCost.Should().Be(1332m);
        result.BudgetRemaining.Should().Be(3668m);
        result.WithinBudget.Should().BeTrue();
    }

    [Fact]
    public void Exactly_on_budget_is_within()
    {
        var result = _reconciler.Reconcile(600m, 400m, [], 1000m, strict: false);

        result.WithinBudget.Should().BeTrue();
        result.BudgetRemaining.Should().Be(0m);
    }

    [Fact]
    public void Over_budget_non_strict_is_flagged_not_thrown()
    {
        var result = _reconciler.Reconcile(742m, 540m, [], 1000m, strict: false);

        result.WithinBudget.Should().BeFalse();
        result.BudgetRemaining.Should().Be(-282m);
        result.TotalCost.Should().Be(1282m);
    }

    [Fact]
    public void Over_budget_strict_throws_conflict()
    {
        var act = () => _reconciler.Reconcile(742m, 540m, [], 1000m, strict: true);

        act.Should().Throw<ConflictException>();
    }
}
