using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TripWeaver.Common.Security;
using TripWeaver.Common.Web;
using TripWeaver.Features.Itineraries.Dtos;

namespace TripWeaver.Features.Itineraries;

[ApiController]
[Authorize]
[Route("api/itineraries")]
public sealed class ItineraryController(ItineraryService service, ICurrentUser currentUser) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Build(
        [FromBody] BuildItineraryRequest request,
        [FromHeader(Name = "Idempotency-Key")] string? idempotencyKey,
        CancellationToken ct)
    {
        var (dto, replayed) = await service.BuildAsync(currentUser.RequireUserId(), idempotencyKey, request, ct);
        SetETag(dto.RowVersion);
        return replayed
            ? Ok(new ApiEnvelope<ItineraryDto>(dto))
            : StatusCode(StatusCodes.Status201Created, new ApiEnvelope<ItineraryDto>(dto));
    }

    [HttpGet("{reference}")]
    public async Task<IActionResult> Get(string reference, CancellationToken ct)
    {
        var dto = await service.GetAsync(currentUser.RequireUserId(), currentUser.IsAdmin, reference, ct);
        SetETag(dto.RowVersion);
        return Ok(new ApiEnvelope<ItineraryDto>(dto));
    }

    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] string? status,
        [FromQuery] int? page,
        [FromQuery] int? pageSize,
        CancellationToken ct)
    {
        var result = await service.ListAsync(currentUser.RequireUserId(), currentUser.IsAdmin, status, page, pageSize, ct);
        return Ok(result);
    }

    [HttpPatch("{reference}")]
    public async Task<IActionResult> Update(
        string reference,
        [FromBody] UpdateItineraryRequest request,
        [FromHeader(Name = "If-Match")] string? ifMatch,
        CancellationToken ct)
    {
        var dto = await service.UpdateAsync(currentUser.RequireUserId(), currentUser.IsAdmin, reference, ifMatch, request, ct);
        SetETag(dto.RowVersion);
        return Ok(new ApiEnvelope<ItineraryDto>(dto));
    }

    [HttpPost("{reference}/cancel")]
    public async Task<IActionResult> Cancel(string reference, CancellationToken ct)
    {
        var dto = await service.CancelAsync(currentUser.RequireUserId(), currentUser.IsAdmin, reference, ct);
        return Ok(new ApiEnvelope<ItineraryDto>(dto));
    }

    private void SetETag(string rowVersion) => Response.Headers.ETag = $"\"{rowVersion}\"";
}
