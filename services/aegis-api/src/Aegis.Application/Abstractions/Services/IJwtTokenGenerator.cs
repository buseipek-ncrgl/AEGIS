namespace Aegis.Application.Abstractions.Services;

public interface IJwtTokenGenerator
{
    string GenerateToken(Guid userId, string username, string role);
}
