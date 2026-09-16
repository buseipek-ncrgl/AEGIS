using Microsoft.Extensions.Logging;
using Polly;
using Polly.CircuitBreaker;
using Polly.Retry;

namespace Aegis.Infrastructure.Resilience;

/// <summary>
/// AEGIS Polly Dayanıklılık ve Hata Tolerans Politikaları (Resilience & Fault Tolerance Pipeline)
/// </summary>
public static class ResiliencePolicies
{
    /// <summary>
    /// Kafka Olay Akışı Dayanıklılık Hattı:
    /// 1. Retry: Geçici hatalarda 3 kez katlanarak büyüyen süreyle (500ms, 1s, 2s) tekrar dener.
    /// 2. Circuit Breaker: Başarısızlık oranı %50'yi aşarsa sigorta atar (30 sn boyunca Kafka'ya istek fırlatmayı keser).
    /// </summary>
    public static ResiliencePipeline CreateKafkaProducerPipeline(ILogger logger)
    {
        return new ResiliencePipelineBuilder()
            .AddRetry(new RetryStrategyOptions
            {
                MaxRetryAttempts = 3,
                Delay = TimeSpan.FromMilliseconds(500),
                BackoffType = DelayBackoffType.Exponential,
                OnRetry = args =>
                {
                    logger.LogWarning("⚠️ Kafka Olay Gönderimi Başarısız Oldu. Yeniden Deneniyor ({Attempt} / 3)... Hata: {Message}",
                        args.AttemptNumber + 1, args.Outcome.Exception?.Message);
                    return ValueTask.CompletedTask;
                }
            })
            .AddCircuitBreaker(new CircuitBreakerStrategyOptions
            {
                FailureRatio = 0.5,
                SamplingDuration = TimeSpan.FromSeconds(10),
                MinimumThroughput = 4,
                BreakDuration = TimeSpan.FromSeconds(30),
                OnOpened = args =>
                {
                    logger.LogError("⚡ CRITICAL: KAFKA BAĞLANTISI KOPTU! Polly Circuit Breaker AÇILDI (Sigorta Attı). Kafka 30 saniye bypass edilecek.");
                    return ValueTask.CompletedTask;
                },
                OnClosed = args =>
                {
                    logger.LogInformation("✅ KAFKA SERVİSİ TEKRAR ONLINE! Polly Circuit Breaker KAPANDI (Normal Akışa Dönüldü).");
                    return ValueTask.CompletedTask;
                }
            })
            .Build();
    }

    /// <summary>
    /// Redis Ön Bellek Dayanıklılık Hattı:
    /// Redis erişimlerinde anlık hıçkırık olursa 200ms aralıkla 2 kez tekrar dener.
    /// </summary>
    public static ResiliencePipeline CreateRedisCachePipeline(ILogger logger)
    {
        return new ResiliencePipelineBuilder()
            .AddRetry(new RetryStrategyOptions
            {
                MaxRetryAttempts = 2,
                Delay = TimeSpan.FromMilliseconds(200),
                BackoffType = DelayBackoffType.Constant,
                OnRetry = args =>
                {
                    logger.LogWarning("⚠️ Redis Ön Bellek Erişimi Yeniden Deneniyor (Deneme {Attempt})...", args.AttemptNumber + 1);
                    return ValueTask.CompletedTask;
                }
            })
            .Build();
    }
}
