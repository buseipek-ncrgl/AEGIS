export const getApiBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== "undefined") {
    const host = window.location.hostname || "localhost";
    return `http://${host}:5000/api`;
  }
  return "http://localhost:5000/api";
};

export const getSignalRHubUrl = (): string => {
  if (process.env.NEXT_PUBLIC_SIGNALR_URL) {
    return process.env.NEXT_PUBLIC_SIGNALR_URL;
  }
  if (typeof window !== "undefined") {
    const host = window.location.hostname || "localhost";
    return `http://${host}:5000/hubs/telemetry`;
  }
  return "http://localhost:5000/hubs/telemetry";
};
