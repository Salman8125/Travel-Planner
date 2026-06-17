using TripWeaver.Features.Users;

namespace TripWeaver.Features.Auth.Dtos;

public sealed record RegisterRequest(string Email, string Password);

public sealed record LoginRequest(string Email, string Password);

public sealed record AuthResponse(string Token, UserDto User);
