using TripWeaver.Common.Domain;

namespace TripWeaver.Features.Users;

public sealed record UserDto(Guid Id, string Email, Role Role);

public static class UserMapping
{
    public static UserDto ToDto(this User user) => new(user.Id, user.Email, user.Role);
}
