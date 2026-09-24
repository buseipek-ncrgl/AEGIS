import * as signalR from "@microsoft/signalr";
import { getSignalRHubUrl } from "./config";

export function createSignalRConnection(): signalR.HubConnection {
  return new signalR.HubConnectionBuilder()
    .withUrl(getSignalRHubUrl(), {
      skipNegotiation: false,
      transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
    .configureLogging(signalR.LogLevel.Warning)
    .build();
}
