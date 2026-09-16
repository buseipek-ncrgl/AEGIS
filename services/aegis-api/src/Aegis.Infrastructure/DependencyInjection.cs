using Aegis.Application.Abstractions.Repositories;
using Aegis.Application.Abstractions.Services;
using Aegis.Infrastructure.Caching;
using Aegis.Infrastructure.Messaging;
using Aegis.Infrastructure.Persistence;
using Aegis.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Aegis.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            // PostgreSQL bağlantı cümlesi verilmeyen lokal/test ortamında In-Memory DB kullan
            services.AddDbContext<AegisDbContext>(options =>
                options.UseInMemoryDatabase("AegisDb"));
        }
        else
        {
            // PostgreSQL Veritabanı Bağlantısı
            services.AddDbContext<AegisDbContext>(options =>
                options.UseNpgsql(connectionString));
        }

        // Repository Kayıtları (Scoped Lifetime)
        services.AddScoped<IVehicleRepository, VehicleRepository>();
        services.AddScoped<ITelemetryRepository, TelemetryRepository>();
        services.AddScoped<IAlertRepository, AlertRepository>();

        // Kafka Event Streaming Producer Kaydı (Singleton Lifetime)
        services.AddSingleton<IKafkaProducerService, KafkaProducerService>();

        // Redis Caching Kayıtları
        var redisConnectionString = configuration.GetConnectionString("Redis") ?? "localhost:6379";
        services.AddStackExchangeRedisCache(options =>
        {
            options.Configuration = redisConnectionString;
            options.InstanceName = "Aegis:";
        });
        services.AddSingleton<ICacheService, RedisCacheService>();

        // JWT Token Üretici Kaydı (Singleton)
        services.AddSingleton<IJwtTokenGenerator, Aegis.Infrastructure.Security.JwtTokenGenerator>();

        return services;
    }
}
