using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;

namespace TripWeaver.Tests.Integration;

public sealed class AuthApiTests(CustomWebApplicationFactory factory) : ApiTestBase(factory)
{
    [Fact]
    public async Task Seeded_user_can_login_and_fetch_me()
    {
        var client = await AuthedClientAsync();

        var me = await client.GetAsync("/api/auth/me");
        me.StatusCode.Should().Be(HttpStatusCode.OK);
        var data = await DataAsync(me);
        data.GetProperty("email").GetString().Should().Be("user@tripweaver.dev");
        data.GetProperty("role").GetString().Should().Be("USER");
    }

    [Fact]
    public async Task Register_creates_a_user_and_returns_a_token()
    {
        var client = Client();
        var email = $"reg-{Guid.NewGuid():N}@tripweaver.dev";

        var response = await client.PostAsJsonAsync("/api/auth/register", new { email, password = "secret123" });

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var data = await DataAsync(response);
        data.GetProperty("token").GetString().Should().NotBeNullOrEmpty();
        data.GetProperty("user").GetProperty("email").GetString().Should().Be(email);
    }

    [Fact]
    public async Task Duplicate_email_is_a_conflict()
    {
        var client = Client();
        var email = $"dup-{Guid.NewGuid():N}@tripweaver.dev";
        await client.PostAsJsonAsync("/api/auth/register", new { email, password = "secret123" });

        var second = await client.PostAsJsonAsync("/api/auth/register", new { email, password = "secret123" });

        second.StatusCode.Should().Be(HttpStatusCode.Conflict);
        var error = await second.Content.ReadFromJsonAsync<JsonElement>();
        error.GetProperty("error").GetProperty("code").GetString().Should().Be("conflict");
    }

    [Fact]
    public async Task Wrong_password_is_unauthorized()
    {
        var client = Client();

        var response = await client.PostAsJsonAsync("/api/auth/login",
            new { email = "user@tripweaver.dev", password = "wrong" });

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Me_without_a_token_is_unauthorized()
    {
        var response = await Client().GetAsync("/api/auth/me");

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        var error = await response.Content.ReadFromJsonAsync<JsonElement>();
        error.GetProperty("error").GetProperty("requestId").GetString().Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task Invalid_registration_returns_validation_details()
    {
        var response = await Client().PostAsJsonAsync("/api/auth/register",
            new { email = "not-an-email", password = "short" });

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var error = await response.Content.ReadFromJsonAsync<JsonElement>();
        error.GetProperty("error").GetProperty("code").GetString().Should().Be("validation_error");
        error.GetProperty("error").GetProperty("details").TryGetProperty("email", out _).Should().BeTrue();
    }
}
