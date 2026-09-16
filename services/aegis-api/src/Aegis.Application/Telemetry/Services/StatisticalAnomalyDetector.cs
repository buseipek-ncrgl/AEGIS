using Aegis.Application.Telemetry.DTOs;
using Aegis.Domain.Entities;
using Aegis.Domain.Enums;
using TelemetryEntity = Aegis.Domain.Entities.Telemetry;

namespace Aegis.Application.Telemetry.Services;

/// <summary>
/// İstatistiksel ve Fiziksel Sınır Bazlı Yapay Zeka Anomali Tespiti Motoru
/// </summary>
public class StatisticalAnomalyDetector : ITelemetryAnomalyDetector
{
    public IReadOnlyList<TelemetryAnomaly> DetectAnomalies(Vehicle vehicle, TelemetryEntity currentTelemetry, TelemetryEntity? previousTelemetry)
    {
        var anomalies = new List<TelemetryAnomaly>();

        if (previousTelemetry is null) return anomalies.AsReadOnly();

        var timeDiffSeconds = (currentTelemetry.Timestamp - previousTelemetry.Timestamp).TotalSeconds;
        if (timeDiffSeconds <= 0.001) return anomalies.AsReadOnly(); // Çok yakın ölçüm

        // 1. GPS Spoofing / Işık Hızı Sıçraması Tespiti (Haversine Mesafe Hesabı)
        var distanceMeters = CalculateHaversineDistance(
            previousTelemetry.Location.Latitude, previousTelemetry.Location.Longitude,
            currentTelemetry.Location.Latitude, currentTelemetry.Location.Longitude
        );

        var calculatedSpeedMetersPerSec = distanceMeters / timeDiffSeconds;
        var calculatedSpeedKmH = calculatedSpeedMetersPerSec * 3.6;

        // Gerçekleşmesi imkansız GPS sıçraması (> 1200 km/h) -> GPS Manipülasyonu (Spoofing)
        if (calculatedSpeedKmH > 1200.0)
        {
            anomalies.Add(new TelemetryAnomaly(
                Guid.NewGuid(),
                vehicle.Id,
                vehicle.Name,
                AnomalyType.GpsSpoofing,
                SeverityScore: 9.8,
                Description: $"FİZİKSEL ANOMALİ: {vehicle.Name} {timeDiffSeconds:F1}s içinde {distanceMeters:F0}m sıçradı ({calculatedSpeedKmH:F0} km/h)! Muhtemel GPS Spoofing / Sinyal Manipülasyonu.",
                DetectedAt: currentTelemetry.Timestamp
            ));
        }

        // 2. Serbest Düşüş / Ani İrtifa Düşüşü Tespiti (> 100 m/s düşüş hızı)
        var altitudeDropMeters = previousTelemetry.Altitude - currentTelemetry.Altitude;
        var altitudeDropRate = altitudeDropMeters / timeDiffSeconds;

        if (altitudeDropRate > 100.0)
        {
            anomalies.Add(new TelemetryAnomaly(
                Guid.NewGuid(),
                vehicle.Id,
                vehicle.Name,
                AnomalyType.SuddenAltitudeDrop,
                SeverityScore: 9.0,
                Description: $"UÇUŞ ANOMALİSİ: {vehicle.Name} saniyede {altitudeDropRate:F1}m irtifa kaybediyor! Serbest düşüş / Motor kaybı şüphesi.",
                DetectedAt: currentTelemetry.Timestamp
            ));
        }

        // 3. Kontrolsüz Sıcaklık Tırmanışı (Thermal Runaway > 2.5 °C / saniye)
        var tempDiff = currentTelemetry.Temperature - previousTelemetry.Temperature;
        var tempRateOfRise = tempDiff / timeDiffSeconds;

        if (tempRateOfRise > 2.5)
        {
            anomalies.Add(new TelemetryAnomaly(
                Guid.NewGuid(),
                vehicle.Id,
                vehicle.Name,
                AnomalyType.ThermalRunaway,
                SeverityScore: 8.2,
                Description: $"TERMAL ANOMALİ: {vehicle.Name} motor sıcaklığı saniyede {tempRateOfRise:F1}°C hızla yükseliyor! Ani yangın / Batarya kaçağı riski.",
                DetectedAt: currentTelemetry.Timestamp
            ));
        }

        return anomalies.AsReadOnly();
    }

    private static double CalculateHaversineDistance(double lat1, double lon1, double lat2, double lon2)
    {
        const double R = 6371000; // Dünya yarıçapı (Metre)
        var dLat = ToRadians(lat2 - lat1);
        var dLon = ToRadians(lon2 - lon1);

        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        return R * c;
    }

    private static double ToRadians(double degrees) => degrees * (Math.PI / 180.0);
}
