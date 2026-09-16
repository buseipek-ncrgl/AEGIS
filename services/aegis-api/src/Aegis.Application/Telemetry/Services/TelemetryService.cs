using Aegis.Application.Abstractions.Repositories;
using Aegis.Application.Abstractions.Services;
using Aegis.Application.Alerts.DTOs;
using Aegis.Application.Alerts.Services;
using Aegis.Application.Events;
using Aegis.Application.Telemetry.DTOs;
using Aegis.Domain.Entities;
using Aegis.Domain.ValueObjects;
using Microsoft.Extensions.Logging;

namespace Aegis.Application.Telemetry.Services;

public class TelemetryService(
    ITelemetryRepository telemetryRepository,
    IVehicleRepository vehicleRepository,
    IAlertEngine? alertEngine = null,
    IAlertRepository? alertRepository = null,
    ITelemetryBroadcastService? broadcastService = null,
    IKafkaProducerService? kafkaProducer = null,
    ICacheService? cacheService = null,
    ITelemetryAnomalyDetector? anomalyDetector = null,
    ILogger<TelemetryService>? logger = null) : ITelemetryService
{
    public async Task<TelemetryDto> RecordTelemetryAsync(CreateTelemetryRequest request, CancellationToken cancellationToken = default)
    {
        var vehicle = await vehicleRepository.GetByIdAsync(request.VehicleId, cancellationToken)
            ?? throw new KeyNotFoundException($"Id'si '{request.VehicleId}' olan araç bulunamadı.");

        // Anomali tespiti için bir önceki telemetriyi çek
        Domain.Entities.Telemetry? previousTelemetry = null;
        if (anomalyDetector is not null)
        {
            try
            {
                previousTelemetry = await telemetryRepository.GetLatestByVehicleIdAsync(request.VehicleId, cancellationToken);
            }
            catch (Exception ex)
            {
                logger?.LogWarning(ex, "Anomali tespiti için önceki telemetri çekilirken uyarı oluştu.");
            }
        }

        var location = new Location(request.Latitude, request.Longitude);
        // Donanım (GPS/Sensör) Zaman Damgası Güvenilirliği: Gönderilmişse kullan, yoksa sunucu saatini al
        var timestamp = request.Timestamp ?? DateTimeOffset.UtcNow;

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

        // Telemetriyi veritabanına kaydet
        await telemetryRepository.AddAsync(telemetry, cancellationToken);

        var dto = MapToDto(telemetry);

        // Yapay Zeka & İstatistiksel Anomali Tespiti
        if (anomalyDetector is not null && previousTelemetry is not null)
        {
            try
            {
                var anomalies = anomalyDetector.DetectAnomalies(vehicle, telemetry, previousTelemetry);
                foreach (var anomaly in anomalies)
                {
                    if (alertRepository is not null)
                    {
                        var anomalyType = MapAnomalyToAlertType(anomaly.Description);
                        var anomalyAlert = new Alert(
                            Guid.NewGuid(),
                            vehicle.Id,
                            Domain.Enums.AlertSeverity.Critical,
                            anomalyType,
                            anomaly.Description
                        );
                        await alertRepository.AddAsync(anomalyAlert, cancellationToken);

                        if (broadcastService is not null)
                        {
                            var alertDto = new AlertDto(
                                anomalyAlert.Id,
                                anomalyAlert.VehicleId,
                                vehicle.Name,
                                anomalyAlert.Severity,
                                anomalyAlert.Type,
                                anomalyAlert.Message,
                                anomalyAlert.CreatedAt,
                                anomalyAlert.IsAcknowledged
                            );
                            await broadcastService.BroadcastAlertAsync(alertDto, cancellationToken);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                logger?.LogWarning(ex, "Yapay zeka anomali tespiti sırasında ikincil hata oluştu.");
            }
        }

        // Redis Caching (Yan Etki İzolasyonu - Hata Durumunda Ana Akışı Kesmez)
        if (cacheService is not null)
        {
            try
            {
                var cacheKey = $"vehicle:{request.VehicleId}:latest";
                await cacheService.SetAsync(cacheKey, dto, TimeSpan.FromMinutes(5), cancellationToken);
            }
            catch (Exception ex)
            {
                logger?.LogWarning(ex, "Redis ön belleğe son telemetri yazılırken hata oluştu.");
            }
        }

        // SignalR Canlı Yayın (Yan Etki İzolasyonu)
        if (broadcastService is not null)
        {
            try
            {
                await broadcastService.BroadcastTelemetryAsync(dto, cancellationToken);
            }
            catch (Exception ex)
            {
                logger?.LogWarning(ex, "SignalR telemetri yayını sırasında hata oluştu.");
            }
        }

        // Kafka Event Streaming (Yan Etki İzolasyonu)
        if (kafkaProducer is not null)
        {
            try
            {
                var @event = new TelemetryCreatedEvent(
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
                await kafkaProducer.PublishAsync("aegis.telemetry.events", telemetry.VehicleId.ToString(), @event, cancellationToken);
            }
            catch (Exception ex)
            {
                logger?.LogWarning(ex, "Kafka olay kuyruğuna telemetri fırlatılırken hata oluştu.");
            }
        }

        // Taktik ALARM Motoru Değerlendirmesi (Yan Etki İzolasyonu)
        if (alertEngine is not null && alertRepository is not null)
        {
            try
            {
                var alerts = alertEngine.EvaluateTelemetry(vehicle, telemetry);
                foreach (var alert in alerts)
                {
                    await alertRepository.AddAsync(alert, cancellationToken);

                    if (broadcastService is not null)
                    {
                        var alertDto = new AlertDto(
                            alert.Id,
                            alert.VehicleId,
                            vehicle.Name,
                            alert.Severity,
                            alert.Type,
                            alert.Message,
                            alert.CreatedAt,
                            alert.IsAcknowledged
                        );
                        await broadcastService.BroadcastAlertAsync(alertDto, cancellationToken);
                    }
                }
            }
            catch (Exception ex)
            {
                logger?.LogWarning(ex, "Taktik alarm değerlendirmesi sırasında hata oluştu.");
            }
        }

        return dto;
    }

    private static Domain.Enums.AlertType MapAnomalyToAlertType(string description)
    {
        var desc = description.ToLowerInvariant();
        if (desc.Contains("spoofing") || desc.Contains("gps") || desc.Contains("konum"))
            return Domain.Enums.AlertType.GeofenceViolation;
        if (desc.Contains("sıcaklık") || desc.Contains("temp") || desc.Contains("termal"))
            return Domain.Enums.AlertType.HighTemperature;
        if (desc.Contains("batarya") || desc.Contains("şarj") || desc.Contains("battery"))
            return Domain.Enums.AlertType.LowBattery;
        return Domain.Enums.AlertType.GeofenceViolation;
    }

    public async Task<IReadOnlyList<TelemetryDto>> GetTelemetryHistoryAsync(Guid vehicleId, int limit = 100, CancellationToken cancellationToken = default)
    {
        var list = await telemetryRepository.GetByVehicleIdAsync(vehicleId, limit, cancellationToken);
        return list.Select(MapToDto).ToList().AsReadOnly();
    }

    public async Task<TelemetryDto?> GetLatestTelemetryAsync(Guid vehicleId, CancellationToken cancellationToken = default)
    {
        var cacheKey = $"vehicle:{vehicleId}:latest";

        // 1. Önce Redis Ön Belleğe Bak (Cache Hit check)
        if (cacheService is not null)
        {
            var cachedTelemetry = await cacheService.GetAsync<TelemetryDto>(cacheKey, cancellationToken);
            if (cachedTelemetry is not null)
            {
                return cachedTelemetry; // Cache Hit! Veritabanına hiç dokunmadan hızlıca dön.
            }
        }

        // 2. Cache Miss: Veritabanından Oku
        var telemetry = await telemetryRepository.GetLatestByVehicleIdAsync(vehicleId, cancellationToken);
        if (telemetry is null) return null;

        var dto = MapToDto(telemetry);

        // 3. Veritabanından okunan veriyi Redis'e kaydet (5 Dakika Yaşam Süresi / TTL)
        if (cacheService is not null)
        {
            await cacheService.SetAsync(cacheKey, dto, TimeSpan.FromMinutes(5), cancellationToken);
        }

        return dto;
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
