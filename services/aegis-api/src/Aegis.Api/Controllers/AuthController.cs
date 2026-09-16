using Aegis.Application.Abstractions.Services;
using Aegis.Application.Security.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace Aegis.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IJwtTokenGenerator tokenGenerator, ILogger<AuthController> logger) : ControllerBase
{
    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        logger.LogInformation("Kullanıcı giriş denemesi -> Kullanıcı Adı: {Username}", request.Username);

        string? role = null;
        var userId = Guid.NewGuid();

        if (string.Equals(request.Username, "operator", StringComparison.OrdinalIgnoreCase) && request.Password == "Password123!")
        {
            role = "Operator";
        }
        else if (string.Equals(request.Username, "device", StringComparison.OrdinalIgnoreCase) && request.Password == "Password123!")
        {
            role = "Device";
        }
        else if (string.Equals(request.Username, "guest", StringComparison.OrdinalIgnoreCase) && request.Password == "Password123!")
        {
            role = "Guest";
        }

        if (role is null)
        {
            logger.LogWarning("Geçersiz kullanıcı adı veya şifre -> Kullanıcı Adı: {Username}", request.Username);
            return Unauthorized(new LoginResponse(
                Success: false,
                Message: "Geçersiz kullanıcı adı veya şifre!",
                Token: null,
                Username: null,
                Role: null,
                ExpiresAt: null
            ));
        }

        var token = tokenGenerator.GenerateToken(userId, request.Username, role);
        var expiresAt = DateTimeOffset.UtcNow.AddHours(8);

        logger.LogInformation("Giriş başarılı! JWT Token üretildi -> Kullanıcı: {Username}, Rol: {Role}", request.Username, role);

        return Ok(new LoginResponse(
            Success: true,
            Message: $"Hoşgeldiniz {request.Username}. Yetkilendirme token'ınız başarıyla oluşturuldu.",
            Token: token,
            Username: request.Username,
            Role: role,
            ExpiresAt: expiresAt
        ));
    }
}
