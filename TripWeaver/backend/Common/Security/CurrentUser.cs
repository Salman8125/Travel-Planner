using System.Security.Claims;
using TripWeaver.Common.Errors;

namespace TripWeaver.Common.Security;

public interface ICurrentUser
{
    Guid? UserId { get; }
    string? Role { get; }
    bool IsAdmin { get; }
    bool IsAuthenticated { get; }
    Guid RequireUserId();
}

public sealed class CurrentUser(IHttpContextAccessor accessor) : ICurrentUser
{
    private ClaimsPrincipal? Principal => accessor.HttpContext?.User;

    public bool IsAuthenticated => Principal?.Identity?.IsAuthenticated ?? false;

    public Guid? UserId =>
        Guid.TryParse(Principal?.FindFirst("sub")?.Value, out var id) ? id : null;

    public string? Role => Principal?.FindFirst("role")?.Value;

    public bool IsAdmin => string.Equals(Role, "ADMIN", StringComparison.Ordinal);

    public Guid RequireUserId() => UserId ?? throw new UnauthorizedException();
}
