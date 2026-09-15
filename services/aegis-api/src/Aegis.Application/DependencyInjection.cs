using Aegis.Application.Alerts.Services;
using Aegis.Application.Telemetry.Services;
using Aegis.Application.Vehicles.Services;
using Microsoft.Extensions.DependencyInjection;

namespace Aegis.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IVehicleService, VehicleService>();
        services.AddScoped<ITelemetryService, TelemetryService>();
        services.AddSingleton<IAlertEngine, AlertEngine>();
        services.AddScoped<IAlertService, AlertService>();

        return services;
    }
}
