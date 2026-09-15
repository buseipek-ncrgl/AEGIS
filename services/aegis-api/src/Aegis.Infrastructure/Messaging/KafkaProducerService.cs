using System.Text.Json;
using Aegis.Application.Abstractions.Services;
using Confluent.Kafka;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Aegis.Infrastructure.Messaging;

public class KafkaProducerService : IKafkaProducerService, IDisposable
{
    private readonly IProducer<string, string>? _producer;
    private readonly ILogger<KafkaProducerService> _logger;
    private readonly bool _isEnabled;

    public KafkaProducerService(IConfiguration configuration, ILogger<KafkaProducerService> logger)
    {
        _logger = logger;
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

            var result = await _producer.ProduceAsync(topic, message, cancellationToken);
            _logger.LogDebug("Kafka Event Yayımlandı -> Topic: {Topic}, Partition: {Partition}, Offset: {Offset}", topic, result.Partition.Value, result.Offset.Value);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Kafka Event yayınlama hatası (Topic: {Topic})", topic);
        }
    }

    public void Dispose()
    {
        _producer?.Flush(TimeSpan.FromSeconds(2));
        _producer?.Dispose();
    }
}
