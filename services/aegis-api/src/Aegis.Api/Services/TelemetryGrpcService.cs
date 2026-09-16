using Aegis.Api.Protos;
using Aegis.Application.Telemetry.DTOs;
using Aegis.Application.Telemetry.Services;
using Grpc.Core;

namespace Aegis.Api.Services;

public class TelemetryGrpcService(ITelemetryService telemetryService, ILogger<TelemetryGrpcService> logger) : TelemetryGrpc.TelemetryGrpcBase
{
    public override async Task<TelemetryRecordResponse> RecordTelemetry(TelemetryRecordRequest request, ServerCallContext context)
    {
        logger.LogInformation("gRPC üzerinden binary telemetri paketi alındı -> Araç ID: {VehicleId}", request.VehicleId);

        if (!Guid.TryParse(request.VehicleId, out var vehicleId))
        {
            throw new RpcException(new Status(StatusCode.InvalidArgument, "Geçersiz Araç GUID id'si."));
        }

        var createRequest = new CreateTelemetryRequest(
            vehicleId,
            request.Latitude,
            request.Longitude,
            request.Altitude,
            request.Speed,
            request.BatteryPercentage,
            request.Temperature
        );

        var result = await telemetryService.RecordTelemetryAsync(createRequest, context.CancellationToken);

        return new TelemetryRecordResponse
        {
            Success = true,
            Message = "Telemetri gRPC binary kanalıyla başarıyla kaydedildi.",
            TelemetryId = result.Id.ToString(),
            VehicleId = result.VehicleId.ToString(),
            Latitude = result.Latitude,
            Longitude = result.Longitude,
            Altitude = result.Altitude,
            Speed = result.Speed,
            BatteryPercentage = result.BatteryPercentage,
            Temperature = result.Temperature,
            Timestamp = result.Timestamp.ToString("o")
        };
    }

    public override async Task<TelemetryRecordResponse> GetLatestTelemetry(GetLatestTelemetryRequest request, ServerCallContext context)
    {
        if (!Guid.TryParse(request.VehicleId, out var vehicleId))
        {
            throw new RpcException(new Status(StatusCode.InvalidArgument, "Geçersiz Araç GUID id'si."));
        }

        var result = await telemetryService.GetLatestTelemetryAsync(vehicleId, context.CancellationToken);

        if (result is null)
        {
            throw new RpcException(new Status(StatusCode.NotFound, $"Id'si '{request.VehicleId}' olan araca ait telemetri bulunamadı."));
        }

        return new TelemetryRecordResponse
        {
            Success = true,
            Message = "En son telemetri gRPC ile getirildi.",
            TelemetryId = result.Id.ToString(),
            VehicleId = result.VehicleId.ToString(),
            Latitude = result.Latitude,
            Longitude = result.Longitude,
            Altitude = result.Altitude,
            Speed = result.Speed,
            BatteryPercentage = result.BatteryPercentage,
            Temperature = result.Temperature,
            Timestamp = result.Timestamp.ToString("o")
        };
    }
}
