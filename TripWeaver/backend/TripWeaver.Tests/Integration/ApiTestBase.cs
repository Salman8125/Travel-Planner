using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using TripWeaver.Features.Itineraries.Dtos;

namespace TripWeaver.Tests.Integration;

[Collection("integration")]
public abstract class ApiTestBase(CustomWebApplicationFactory factory)
{
    protected readonly CustomWebApplicationFactory Factory = factory;

    protected static readonly DateOnly Start = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(20));
    protected static readonly DateOnly End = Start.AddDays(2);

    protected HttpClient Client() => Factory.CreateClient();

    protected async Task<HttpClient> AuthedClientAsync(
        string email = "user@tripweaver.dev", string password = "user12345")
    {
        var client = Factory.CreateClient();
        var token = await LoginAsync(client, email, password);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return client;
    }

    protected static async Task<string> LoginAsync(HttpClient client, string email, string password)
    {
        var response = await client.PostAsJsonAsync("/api/auth/login", new { email, password });
        response.EnsureSuccessStatusCode();
        var json = await response.Content.ReadFromJsonAsync<JsonElement>();
        return json.GetProperty("data").GetProperty("token").GetString()!;
    }

    protected async Task<string> RegisterAndLoginAsync(string email, string password = "secret123")
    {
        var client = Factory.CreateClient();
        await client.PostAsJsonAsync("/api/auth/register", new { email, password });
        return await LoginAsync(client, email, password);
    }

    protected static HttpRequestMessage BuildMessage(BuildItineraryRequest body, string? idempotencyKey = null)
    {
        var message = new HttpRequestMessage(HttpMethod.Post, "/api/itineraries")
        {
            Content = JsonContent.Create(body),
        };
        if (idempotencyKey is not null)
        {
            message.Headers.TryAddWithoutValidation("Idempotency-Key", idempotencyKey);
        }
        return message;
    }

    protected static async Task<JsonElement> DataAsync(HttpResponseMessage response)
    {
        var json = await response.Content.ReadFromJsonAsync<JsonElement>();
        return json.GetProperty("data");
    }
}
