using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using TripWeaver.Common.Security;
using TripWeaver.Common.Web;
using TripWeaver.Features.Auth.Dtos;
using TripWeaver.Features.Users;

namespace TripWeaver.Features.Auth;

[ApiController]
[Route("api/auth")]
[EnableRateLimiting("auth")]
public sealed class AuthController(AuthService auth, ICurrentUser currentUser) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request, CancellationToken ct)
    {
        var result = await auth.RegisterAsync(request, ct);
        return StatusCode(StatusCodes.Status201Created, new ApiEnvelope<AuthResponse>(result));
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request, CancellationToken ct)
    {
        var result = await auth.LoginAsync(request, ct);
        return Ok(new ApiEnvelope<AuthResponse>(result));
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me(CancellationToken ct)
    {
        var dto = await auth.MeAsync(currentUser.RequireUserId(), ct);
        return Ok(new ApiEnvelope<UserDto>(dto));
    }
}
