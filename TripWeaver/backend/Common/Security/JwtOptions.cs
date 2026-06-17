using System.ComponentModel.DataAnnotations;

namespace TripWeaver.Common.Security;

public sealed class JwtOptions
{
    public const string SectionName = "Jwt";

    [Required]
    [MinLength(32)]
    public string Secret { get; set; } = string.Empty;

    [Range(1, 720)]
    public int TtlHours { get; set; } = 24;
}
