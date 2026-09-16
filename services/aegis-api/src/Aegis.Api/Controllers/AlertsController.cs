using Aegis.Api.Hubs;
using Aegis.Application.Alerts.DTOs;
using Aegis.Application.Alerts.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace Aegis.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AlertsController(IAlertService alertService) : ControllerBase
{
    [HttpGet("active")]
    public async Task<ActionResult<IReadOnlyList<AlertDto>>> GetActiveAlerts(CancellationToken cancellationToken)
    {
        var alerts = await alertService.GetActiveAlertsAsync(cancellationToken);
        return Ok(alerts);
    }

    [HttpPost("{id:guid}/acknowledge")]
    [Authorize(Roles = "Operator")]
    public async Task<IActionResult> AcknowledgeAlert(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            await alertService.AcknowledgeAlertAsync(id, cancellationToken);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { Message = ex.Message });
        }
    }

    [HttpPost("manual")]
    [Authorize(Roles = "Operator")]
    public async Task<ActionResult<AlertDto>> CreateManualAlert(
        [FromBody] CreateManualAlertRequest request,
        [FromServices] IHubContext<TelemetryHub> hubContext,
        CancellationToken cancellationToken)
    {
        var alert = await alertService.CreateManualAlertAsync(request, cancellationToken);
        await hubContext.Clients.All.SendAsync("ReceiveAlert", alert, cancellationToken);
        return CreatedAtAction(nameof(GetActiveAlerts), new { id = alert.Id }, alert);
    }
}
