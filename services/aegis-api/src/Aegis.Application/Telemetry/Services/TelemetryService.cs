using Aegis.Application.Abstractions.Repositories;
using Aegis.Application.Abstractions.Services;
using Aegis.Application.Telemetry.DTOs;
using Aegis.Domain.Entities;
using Aegis.Domain.ValueObjects;

namespace Aegis.Application.Telemetry.Services;

public class TelemetryService(
    ITelemetryRepository telemetryRepository,
    IVehicleRepository vehicleRepository,
    ITelemetryBroadcastService? broadcastService = null) : ITelemetryService
{
    public async Task<TelemetryDto> RecordTelemetryAsync(CreateTelemetryRequest request, CancellationToken cancellationToken = default)
    {
        var vehicle = await vehicleRepository.GetByIdAsync(request.VehicleId, cancellationToken)
            ?? throw new KeyNotFoundException($"Id'si '{request.VehicleId}' olan araç bulunamadı.");

        var location = new Location(request.Latitude, request.Longitude);
        var timestamp = DateTimeOffset.UtcNow;

        var telemetry = new Domain.Entities.Telemetry(
            Guid.NewGuid(),
            request.VehicleId,
            location,
            request.Altitude,
            request.Speed,
            request.BatteryPercentage,
            request.Temperature,
            timestamp
        );

        // Araç son görülme zamanını güncelle
        vehicle.UpdateLastSeen();
        await vehicleRepository.UpdateAsync(vehicle, cancellationToken);

        // Telemetriyi kaydet
        await telemetryRepository.AddAsync(telemetry, cancellationToken);

        var dto = MapToDto(telemetry);

        // SignalR Canlı Yayın: Bağlı tüm web arayüzlerine anında push et
        if (broadcastService is not null)
        {
            await broadcastService.BroadcastTelemetryAsync(dto, cancellationToken);
        }

        return dto;
    }

    public async Task<IReadOnlyList<TelemetryDto>> GetTelemetryHistoryAsync(Guid vehicleId, int limit = 100, CancellationToken cancellationToken = default)
    {
        var list = await telemetryRepository.GetByVehicleIdAsync(vehicleId, limit, cancellationToken);
        return list.Select(MapToDto).ToList().AsReadOnly();
    }

    public async Task<TelemetryDto?> GetLatestTelemetryAsync(Guid vehicleId, CancellationToken cancellationToken = default)
    {
        var telemetry = await telemetryRepository.GetLatestByVehicleIdAsync(vehicleId, cancellationToken);
        return telemetry is null ? null : MapToDto(telemetry);
    }

    private static TelemetryDto MapToDto(Domain.Entities.Telemetry telemetry)
    {
        return new TelemetryDto(
            telemetry.Id,
            telemetry.VehicleId,
            telemetry.Location.Latitude,
            telemetry.Location.Longitude,
            telemetry.Altitude,
            telemetry.Speed,
            telemetry.BatteryPercentage,
            telemetry.Temperature,
            telemetry.Timestamp
        );
    }
}
