using Microsoft.EntityFrameworkCore;
using TripWeaver.Common.Domain;
using TripWeaver.Common.Errors;
using TripWeaver.Common.Security;
using TripWeaver.Features.Auth.Dtos;
using TripWeaver.Features.Users;
using TripWeaver.Infrastructure.Persistence;

namespace TripWeaver.Features.Auth;

public sealed class AuthService(AppDbContext db, PasswordHasher hasher, JwtTokenService tokens)
{
    private static readonly string DummyHash = BCrypt.Net.BCrypt.HashPassword("timing-safe-dummy-password");

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken ct)
    {
        var email = Normalize(request.Email);
        if (await db.Users.AnyAsync(u => u.Email == email, ct))
        {
            throw new ConflictException("An account with this email already exists.");
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            PasswordHash = hasher.Hash(request.Password),
            Role = Role.USER,
            CreatedAt = DateTime.UtcNow,
        };
        db.Users.Add(user);
        await db.SaveChangesAsync(ct);
        return Build(user);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken ct)
    {
        var email = Normalize(request.Email);
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email, ct);
        var verified = hasher.Verify(request.Password, user?.PasswordHash ?? DummyHash);
        if (user is null || !verified)
        {
            throw new UnauthorizedException("Invalid email or password.");
        }

        return Build(user);
    }

    public async Task<UserDto> MeAsync(Guid userId, CancellationToken ct)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == userId, ct)
            ?? throw new UnauthorizedException();
        return user.ToDto();
    }

    private AuthResponse Build(User user)
    {
        var (token, _) = tokens.Create(user);
        return new AuthResponse(token, user.ToDto());
    }

    private static string Normalize(string email) => email.Trim().ToLowerInvariant();
}
