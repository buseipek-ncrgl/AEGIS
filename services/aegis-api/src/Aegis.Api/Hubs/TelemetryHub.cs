using Microsoft.AspNetCore.SignalR;

namespace Aegis.Api.Hubs;

public class TelemetryHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        // Web istemcisi bağlandığında hoşgeldin mesajı dön
        await Clients.Caller.SendAsync("ReceiveConnectionAck", $"AEGIS SignalR Canlı Yayın Hub'ına Bağlanıldı (ConnectionId: {Context.ConnectionId})");
        await base.OnConnectedAsync();
    }
}
