namespace Aegis.Application.Abstractions.Services;

public interface IKafkaProducerService
{
    Task PublishAsync<TEvent>(string topic, string key, TEvent @event, CancellationToken cancellationToken = default);
}
