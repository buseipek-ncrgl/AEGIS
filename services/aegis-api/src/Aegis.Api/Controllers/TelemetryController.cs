using Aegis.Application.Telemetry.DTOs;
using Aegis.Application.Telemetry.Services;
using Microsoft.AspNetCore.Mvc;

namespace Aegis.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TelemetryController(ITelemetryService telemetryService) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<TelemetryDto>> RecordTelemetry([FromBody] CreateTelemetryRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var telemetry = await telemetryService.RecordTelemetryAsync(request, cancellationToken);
            return Ok(telemetry);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { Message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpGet("vehicle/{vehicleId:guid}")]
    public async Task<ActionResult<IReadOnlyList<TelemetryDto>>> GetTelemetryHistory(Guid vehicleId, [FromQuery] int limit = 100, CancellationToken cancellationToken = default)
    {
        var history = await telemetryService.GetTelemetryHistoryAsync(vehicleId, limit, cancellationToken);
        return Ok(history);
    }

    [HttpGet("vehicle/{vehicleId:guid}/latest")]
    public async Task<ActionResult<TelemetryDto>> GetLatestTelemetry(Guid vehicleId, CancellationToken cancellationToken = default)
    {
        var latest = await telemetryService.GetLatestTelemetryAsync(vehicleId, cancellationToken);
        if (latest is null)
            return NotFound(new { Message = $"VehicleId '{vehicleId}' için telemetri kaydı bulunamadı." });

        return Ok(latest);
    }
}
