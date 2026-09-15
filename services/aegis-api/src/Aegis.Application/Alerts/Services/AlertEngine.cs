using Aegis.Domain.Entities;
using Aegis.Domain.Enums;
using TelemetryEntity = Aegis.Domain.Entities.Telemetry;

namespace Aegis.Application.Alerts.Services;

public class AlertEngine : IAlertEngine
{
    public IReadOnlyList<Alert> EvaluateTelemetry(Vehicle vehicle, TelemetryEntity telemetry)
    {
        var alerts = new List<Alert>();

        // Kural 1: Batarya Kritik Seviye (< %15)
        if (telemetry.BatteryPercentage < 15.0)
        {
            alerts.Add(new Alert(
                Guid.NewGuid(),
                vehicle.Id,
                AlertSeverity.Critical,
                AlertType.LowBattery,
                $"KRİTİK UYARI: {vehicle.Name} bataryası %{telemetry.BatteryPercentage:F1} seviyesine düştü! ACİL ŞARJ / İNİŞ GEREKLİ."
            ));
        }

        // Kural 2: Yasaklı Bölge (Geofence) İhlali (Örnek: Ankara Kuzey Yasaklı Bölge - Enlem > 40.0 & Boylam > 32.7)
        if (telemetry.Location.Latitude > 40.0 && telemetry.Location.Longitude > 32.7)
        {
            alerts.Add(new Alert(
                Guid.NewGuid(),
                vehicle.Id,
                AlertSeverity.High,
                AlertType.GeofenceViolation,
                $"BÖLGE İHLALİ: {vehicle.Name} Ankara Kuzey Yasaklı Hava Sahasına (Geofence) girdi! ({telemetry.Location.Latitude:F4}, {telemetry.Location.Longitude:F4})"
            ));
        }

        // Kural 3: Yüksek Sıcaklık Uyarısı (> 50°C)
        if (telemetry.Temperature > 50.0)
        {
            alerts.Add(new Alert(
                Guid.NewGuid(),
                vehicle.Id,
                AlertSeverity.High,
                AlertType.HighTemperature,
                $"MOTOR UYARISI: {vehicle.Name} motor sıcaklığı aşırı yüksek: {telemetry.Temperature:F1}°C!"
            ));
        }

        return alerts.AsReadOnly();
    }
}
