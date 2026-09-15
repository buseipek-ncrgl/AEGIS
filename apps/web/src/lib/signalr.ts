import * as signalR from "@microsoft/signalr";

const SIGNALR_HUB_URL = process.env.NEXT_PUBLIC_SIGNALR_URL || "http://localhost:5000/hubs/telemetry";

export function createSignalRConnection(): signalR.HubConnection {
  return new signalR.HubConnectionBuilder()
    .withUrl(SIGNALR_HUB_URL, {
      skipNegotiation: false,
      transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
    .configureLogging(signalR.LogLevel.Warning)
    .build();
}
