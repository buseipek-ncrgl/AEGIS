using System.Text.Json;
using Aegis.Application.Abstractions.Services;
using Aegis.Infrastructure.Resilience;
using Confluent.Kafka;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Polly;

namespace Aegis.Infrastructure.Messaging;

public class KafkaProducerService : IKafkaProducerService, IDisposable
{
    private readonly IProducer<string, string>? _producer;
    private readonly ILogger<KafkaProducerService> _logger;
    private readonly ResiliencePipeline _resiliencePipeline;
    private readonly bool _isEnabled;

    public KafkaProducerService(IConfiguration configuration, ILogger<KafkaProducerService> logger)
    {
        _logger = logger;
        _resiliencePipeline = ResiliencePolicies.CreateKafkaProducerPipeline(logger);
        var bootstrapServers = configuration["Kafka:BootstrapServers"] ?? "localhost:9092";
        _isEnabled = string.Equals(configuration["Kafka:IsEnabled"], "true", StringComparison.OrdinalIgnoreCase);

        if (!_isEnabled)
        {
            _logger.LogInformation("Kafka Producer devre dışı. (Kafka:IsEnabled = false)");
            return;
        }

        try
        {
            var config = new ProducerConfig
            {
                BootstrapServers = bootstrapServers,
                Acks = Acks.Leader,
                MessageTimeoutMs = 3000
            };

            _producer = new ProducerBuilder<string, string>(config).Build();
            _logger.LogInformation("Kafka Producer bağlandı: {BootstrapServers}", bootstrapServers);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Kafka Producer bağlantısı kurulamadı. Kafka olmadan devam ediliyor.");
        }
    }

    public async Task PublishAsync<TEvent>(string topic, string key, TEvent @event, CancellationToken cancellationToken = default)
    {
        if (!_isEnabled || _producer is null) return;

        try
        {
            var jsonPayload = JsonSerializer.Serialize(@event);
            var message = new Message<string, string>
            {
                Key = key,
                Value = jsonPayload
            };

            // Polly Resilience Pipeline: Retry + Circuit Breaker ile güvenli fırlatma
            await _resiliencePipeline.ExecuteAsync(async ct =>
            {
                var result = await _producer.ProduceAsync(topic, message, ct);
                _logger.LogDebug("Kafka Event Yayımlandı -> Topic: {Topic}, Partition: {Partition}, Offset: {Offset}", topic, result.Partition.Value, result.Offset.Value);
            }, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Kafka Event yayınlama hatası (Topic: {Topic}). Polly koruması devrede.", topic);
        }
    }

    public void Dispose()
    {
        _producer?.Flush(TimeSpan.FromSeconds(2));
        _producer?.Dispose();
    }
}
