using System.Text.Json;
using Aegis.Application.Abstractions.Services;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;

namespace Aegis.Infrastructure.Caching;

public class RedisCacheService(IDistributedCache cache, ILogger<RedisCacheService> logger) : ICacheService
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public async Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default)
    {
        try
        {
            var cachedBytes = await cache.GetAsync(key, cancellationToken);
            if (cachedBytes is null || cachedBytes.Length == 0)
                return default;

            var json = System.Text.Encoding.UTF8.GetString(cachedBytes);
            logger.LogDebug("Cache HIT -> Key: {Key}", key);
            return JsonSerializer.Deserialize<T>(json, JsonOptions);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Redis Cache okuma hatası (Key: {Key}). Veritabanına düşülüyor.", key);
            return default;
        }
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan? absoluteExpirationRelativeToNow = null, CancellationToken cancellationToken = default)
    {
        try
        {
            var json = JsonSerializer.Serialize(value, JsonOptions);
            var bytes = System.Text.Encoding.UTF8.GetBytes(json);

            var options = new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = absoluteExpirationRelativeToNow ?? TimeSpan.FromMinutes(5)
            };

            await cache.SetAsync(key, bytes, options, cancellationToken);
            logger.LogDebug("Cache SET -> Key: {Key}, TTL: {TTL}", key, options.AbsoluteExpirationRelativeToNow);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Redis Cache yazma hatası (Key: {Key})", key);
        }
    }

    public async Task RemoveAsync(string key, CancellationToken cancellationToken = default)
    {
        try
        {
            await cache.RemoveAsync(key, cancellationToken);
            logger.LogDebug("Cache REMOVE -> Key: {Key}", key);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Redis Cache silme hatası (Key: {Key})", key);
        }
    }
}
