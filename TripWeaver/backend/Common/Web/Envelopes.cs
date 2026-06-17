namespace TripWeaver.Common.Web;

public sealed record ApiEnvelope<T>(T Data);

public sealed record ListEnvelope<T>(IReadOnlyList<T> Data, PageMeta Meta);

public sealed record PageMeta(int Page, int PageSize, int Total, int TotalPages)
{
    public static PageMeta Of(int page, int pageSize, int total)
    {
        var totalPages = pageSize <= 0 ? 1 : Math.Max(1, (int)Math.Ceiling((double)total / pageSize));
        return new PageMeta(page, pageSize, total, totalPages);
    }
}
