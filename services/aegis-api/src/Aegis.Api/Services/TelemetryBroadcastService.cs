using Aegis.Application.Abstractions.Services;
using Aegis.Application.Telemetry.DTOs;
using Aegis.Api.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace Aegis.Api.Services;

public class TelemetryBroadcastService(IHubContext<TelemetryHub> hubContext) : ITelemetryBroadcastService
{
    public async Task BroadcastTelemetryAsync(TelemetryDto telemetry, CancellationToken cancellationToken = default)
    {
        // Bağlı tüm web arayüzlerine (Next.js / Harita) canlı telemetriyi push et
        await hubContext.Clients.All.SendAsync("ReceiveTelemetry", telemetry, cancellationToken);
    }
}
