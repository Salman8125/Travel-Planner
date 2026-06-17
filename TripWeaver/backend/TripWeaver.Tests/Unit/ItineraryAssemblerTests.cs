using FluentAssertions;
using TripWeaver.Features.Itineraries;
using TripWeaver.Features.Itineraries.Dtos;

namespace TripWeaver.Tests.Unit;

public sealed class ItineraryAssemblerTests
{
    private readonly ItineraryAssembler _assembler = new();
    private static readonly DateOnly Start = new(2026, 7, 1);

    private static ValidatedTrip Trip(DateOnly start, DateOnly end) =>
        new(start, end, "USD", []);

    [Fact]
    public void Generates_one_day_per_date_inclusive()
    {
        var end = Start.AddDays(2);
        var req = TestData.ValidBuild(Start, end);

        var days = _assembler.Assemble(req, Trip(Start, end), "London");

        days.Should().HaveCount(3);
        days.Select(d => d.DayNumber).Should().Equal(1, 2, 3);
        days.Select(d => d.Date).Should().Equal(Start, Start.AddDays(1), Start.AddDays(2));
    }

    [Fact]
    public void Arrival_full_and_departure_days_get_role_specific_activities()
    {
        var end = Start.AddDays(2);
        var req = TestData.ValidBuild(Start, end);

        var days = _assembler.Assemble(req, Trip(Start, end), "London");

        days[0].Activities.Select(a => a.Title).Should().Contain(t => t.StartsWith("Arrive"))
            .And.Contain(t => t.StartsWith("Check in"));
        days[1].Activities.Select(a => a.Title).Should().Contain(t => t.StartsWith("Explore"));
        days[2].Activities.Select(a => a.Title).Should().Contain(t => t.StartsWith("Check out"))
            .And.Contain(t => t.StartsWith("Depart"));
    }

    [Fact]
    public void Single_day_trip_merges_arrival_and_departure()
    {
        var req = TestData.ValidBuild(Start, Start);

        var days = _assembler.Assemble(req, Trip(Start, Start), "London");

        days.Should().ContainSingle();
        var titles = days[0].Activities.Select(a => a.Title).ToList();
        titles.Should().Contain(t => t.StartsWith("Arrive"));
        titles.Should().Contain(t => t.StartsWith("Depart"));
    }

    [Fact]
    public void Matches_forecast_by_date_and_flags_missing_days()
    {
        var end = Start.AddDays(1);
        var req = TestData.ValidBuild(Start, end) with
        {
            Weather = [new ForecastInput(Start, 20m, 10m, "RAINY")],
        };

        var days = _assembler.Assemble(req, Trip(Start, end), "London");

        days[0].Condition.Should().Be("RAINY");
        days[0].HighC.Should().Be(20m);
        days[0].Notes.Should().BeNull();

        days[1].Condition.Should().BeNull();
        days[1].Notes.Should().NotBeNull();
    }

    [Fact]
    public void Default_activities_carry_no_cost()
    {
        var end = Start.AddDays(2);
        var req = TestData.ValidBuild(Start, end);

        var days = _assembler.Assemble(req, Trip(Start, end), "London");

        days.SelectMany(d => d.Activities).Should().OnlyContain(a => a.EstimatedCost == null);
    }
}
