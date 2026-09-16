namespace Aegis.Application.Security.DTOs;

public record LoginRequest(string Username, string Password);

public record LoginResponse(
    bool Success,
    string Message,
    string? Token,
    string? Username,
    string? Role,
    DateTimeOffset? ExpiresAt
);
