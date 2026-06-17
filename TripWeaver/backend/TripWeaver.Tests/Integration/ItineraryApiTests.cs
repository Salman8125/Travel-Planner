using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;

namespace TripWeaver.Tests.Integration;

public sealed class ItineraryApiTests(CustomWebApplicationFactory factory) : ApiTestBase(factory)
{
    [Fact]
    public async Task Builds_assembles_persists_and_can_be_fetched()
    {
        var client = await AuthedClientAsync();

        var response = await client.SendAsync(BuildMessage(TestData.ValidBuild(Start, End)));
        response.StatusCode.Should().Be(HttpStatusCode.Created);

        var data = await DataAsync(response);
        data.GetProperty("status").GetString().Should().Be("DRAFT");
        data.GetProperty("totalCost").GetDecimal().Should().Be(1282m);
        data.GetProperty("withinBudget").GetBoolean().Should().BeTrue();
        data.GetProperty("days").GetArrayLength().Should().Be(3);
        var reference = data.GetProperty("reference").GetString()!;

        var fetched = await client.GetAsync($"/api/itineraries/{reference}");
        fetched.StatusCode.Should().Be(HttpStatusCode.OK);
        (await DataAsync(fetched)).GetProperty("reference").GetString().Should().Be(reference);
    }

    [Fact]
    public async Task Replaying_the_same_idempotency_key_returns_the_original()
    {
        var client = await AuthedClientAsync();
        var key = $"key-{Guid.NewGuid():N}";

        var first = await client.SendAsync(BuildMessage(TestData.ValidBuild(Start, End), key));
        first.StatusCode.Should().Be(HttpStatusCode.Created);
        var firstRef = (await DataAsync(first)).GetProperty("reference").GetString();

        var replay = await client.SendAsync(BuildMessage(TestData.ValidBuild(Start, End), key));
        replay.StatusCode.Should().Be(HttpStatusCode.OK);
        var replayRef = (await DataAsync(replay)).GetProperty("reference").GetString();

        replayRef.Should().Be(firstRef);
    }

    [Fact]
    public async Task Stale_row_version_on_patch_conflicts()
    {
        var client = await AuthedClientAsync();
        var data = await DataAsync(await client.SendAsync(BuildMessage(TestData.ValidBuild(Start, End))));
        var reference = data.GetProperty("reference").GetString()!;
        var rowVersion = data.GetProperty("rowVersion").GetString()!;

        var ok = await Patch(client, reference, rowVersion, new { title = "Renamed" });
        ok.StatusCode.Should().Be(HttpStatusCode.OK);

        var conflict = await Patch(client, reference, rowVersion, new { title = "Again" });
        conflict.StatusCode.Should().Be(HttpStatusCode.Conflict);
    }

    [Fact]
    public async Task Over_budget_is_flagged_when_not_strict()
    {
        var client = await AuthedClientAsync();

        var response = await client.SendAsync(BuildMessage(TestData.ValidBuild(Start, End, budgetTotal: 1000m)));

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var data = await DataAsync(response);
        data.GetProperty("withinBudget").GetBoolean().Should().BeFalse();
        data.GetProperty("budgetRemaining").GetDecimal().Should().BeLessThan(0);
    }

    [Fact]
    public async Task Over_budget_is_rejected_when_strict()
    {
        var client = await AuthedClientAsync();

        var response = await client.SendAsync(
            BuildMessage(TestData.ValidBuild(Start, End, budgetTotal: 1000m, strictBudget: true)));

        response.StatusCode.Should().Be(HttpStatusCode.Conflict);
    }

    [Fact]
    public async Task Hotel_not_covering_the_trip_conflicts()
    {
        var client = await AuthedClientAsync();
        var request = TestData.ValidBuild(Start, End);
        request = request with { Hotel = request.Hotel with { CheckIn = Start.AddDays(1) } };

        var response = await client.SendAsync(BuildMessage(request));

        response.StatusCode.Should().Be(HttpStatusCode.Conflict);
    }

    [Fact]
    public async Task Currency_mismatch_conflicts()
    {
        var client = await AuthedClientAsync();

        var response = await client.SendAsync(BuildMessage(TestData.ValidBuild(Start, End, hotelCurrency: "EUR")));

        response.StatusCode.Should().Be(HttpStatusCode.Conflict);
    }

    [Fact]
    public async Task Empty_forecast_on_a_multi_day_trip_is_a_validation_error()
    {
        var client = await AuthedClientAsync();
        var request = TestData.ValidBuild(Start, End) with { Weather = [] };

        var response = await client.SendAsync(BuildMessage(request));

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Building_without_a_token_is_unauthorized()
    {
        var response = await Client().SendAsync(BuildMessage(TestData.ValidBuild(Start, End)));

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Unknown_reference_is_not_found()
    {
        var client = await AuthedClientAsync();

        var response = await client.GetAsync("/api/itineraries/ZZZZZZ");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Another_users_itinerary_is_forbidden()
    {
        var owner = await AuthedClientAsync();
        var reference = (await DataAsync(await owner.SendAsync(BuildMessage(TestData.ValidBuild(Start, End)))))
            .GetProperty("reference").GetString()!;

        var otherToken = await RegisterAndLoginAsync($"other-{Guid.NewGuid():N}@tripweaver.dev");
        var other = Client();
        other.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", otherToken);

        var response = await other.GetAsync($"/api/itineraries/{reference}");

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task Cancel_is_idempotent()
    {
        var client = await AuthedClientAsync();
        var reference = (await DataAsync(await client.SendAsync(BuildMessage(TestData.ValidBuild(Start, End)))))
            .GetProperty("reference").GetString()!;

        var first = await client.PostAsync($"/api/itineraries/{reference}/cancel", null);
        first.StatusCode.Should().Be(HttpStatusCode.OK);
        (await DataAsync(first)).GetProperty("status").GetString().Should().Be("CANCELLED");

        var second = await client.PostAsync($"/api/itineraries/{reference}/cancel", null);
        second.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    private static Task<HttpResponseMessage> Patch(HttpClient client, string reference, string ifMatch, object body)
    {
        var message = new HttpRequestMessage(HttpMethod.Patch, $"/api/itineraries/{reference}")
        {
            Content = JsonContent.Create(body),
        };
        message.Headers.TryAddWithoutValidation("If-Match", ifMatch);
        return client.SendAsync(message);
    }
}
