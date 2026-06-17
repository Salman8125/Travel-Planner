namespace TripWeaver.Common.Web;

public static class Pagination
{
    public const int DefaultPageSize = 20;
    public const int MaxPageSize = 100;

    public static int ClampPage(int? page) => page is null || page < 1 ? 1 : page.Value;

    public static int ClampPageSize(int? pageSize) =>
        pageSize is null || pageSize < 1 ? DefaultPageSize : Math.Min(pageSize.Value, MaxPageSize);
}
