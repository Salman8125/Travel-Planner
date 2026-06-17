namespace TripWeaver.Common.Web;

public sealed class RateLimitOptions
{
    public const string SectionName = "RateLimit";
    public bool Enabled { get; set; } = true;
    public int PermitPerMinute { get; set; } = 120;
    public int AuthPermitPerMinute { get; set; } = 20;
}

public sealed class CorsOptions
{
    public const string SectionName = "Cors";
    public string[] Origins { get; set; } = [];
}
