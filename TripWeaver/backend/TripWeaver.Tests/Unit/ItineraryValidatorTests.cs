using FluentAssertions;
using Microsoft.Extensions.Options;
using TripWeaver.Common.Errors;
using TripWeaver.Features.Itineraries;
using TripWeaver.Features.Itineraries.Dtos;
using ValidationException = TripWeaver.Common.Errors.ValidationException;

namespace TripWeaver.Tests.Unit;

public sealed class ItineraryValidatorTests
{
    private static readonly DateOnly Start = new(2026, 7, 1);
    private static readonly DateOnly End = new(2026, 7, 3);

    private static ItineraryValidator Build(int maxDays = 30) => new(
        Options.Create(new TripOptions { MaxTripDays = maxDays }),
        new FixedClock(new DateTimeOffset(2026, 6, 1, 0, 0, 0, TimeSpan.Zero)));

    [Fact]
    public void Valid_request_returns_derived_trip()
    {
        var trip = Build().Validate(TestData.ValidBuild(Start, End));

        trip.Start.Should().Be(Start);
        trip.End.Should().Be(End);
        trip.Currency.Should().Be("USD");
        trip.CoverageGaps.Should().BeEmpty();
    }

    [Fact]
    public void Missing_a_forecast_day_is_tolerated_and_flagged_as_a_gap()
    {
        var req = TestData.ValidBuild(Start, End) with
        {
            Weather = [new ForecastInput(Start, 24m, 15m, "SUNNY"), new ForecastInput(End, 23m, 14m, "CLOUDY")],
        };

        var trip = Build().Validate(req);

        trip.CoverageGaps.Should().ContainSingle().Which.Should().Be(Start.AddDays(1));
    }

    [Fact]
    public void Origin_equal_to_destination_throws_validation()
    {
        var req = TestData.ValidBuild(Start, End);
        req = req with { Flight = req.Flight with { Destination = req.Flight.Origin } };

        var act = () => Build().Validate(req);

        act.Should().Throw<ValidationException>();
    }

    [Fact]
    public void Arrival_before_departure_throws_validation()
    {
        var req = TestData.ValidBuild(Start, End);
        req = req with { Flight = req.Flight with { ArrivalTime = req.Flight.DepartureTime.AddHours(-1) } };

        var act = () => Build().Validate(req);

        act.Should().Throw<ValidationException>();
    }

    [Fact]
    public void Start_in_the_past_throws_validation()
    {
        var past = new DateOnly(2026, 5, 1);
        var act = () => Build().Validate(TestData.ValidBuild(past, past.AddDays(2)));

        act.Should().Throw<ValidationException>();
    }

    [Fact]
    public void Trip_exceeding_cap_throws_validation()
    {
        var act = () => Build(maxDays: 5).Validate(TestData.ValidBuild(Start, Start.AddDays(10)));

        act.Should().Throw<ValidationException>();
    }

    [Fact]
    public void Hotel_not_covering_the_trip_throws_conflict()
    {
        var req = TestData.ValidBuild(Start, End);
        req = req with { Hotel = req.Hotel with { CheckIn = Start.AddDays(1) } };

        var act = () => Build().Validate(req);

        act.Should().Throw<ConflictException>();
    }

    [Fact]
    public void Currency_mismatch_throws_conflict()
    {
        var req = TestData.ValidBuild(Start, End, hotelCurrency: "EUR");

        var act = () => Build().Validate(req);

        act.Should().Throw<ConflictException>();
    }

    [Fact]
    public void Empty_forecast_on_a_multi_day_trip_throws_validation()
    {
        var req = TestData.ValidBuild(Start, End) with { Weather = [] };

        var act = () => Build().Validate(req);

        act.Should().Throw<ValidationException>();
    }

    [Fact]
    public void Empty_forecast_on_a_single_day_trip_is_allowed()
    {
        var req = TestData.ValidBuild(Start, Start) with { Weather = [] };

        var trip = Build().Validate(req);

        trip.Start.Should().Be(trip.End);
        trip.CoverageGaps.Should().ContainSingle();
    }
}
