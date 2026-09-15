using Aegis.Application;
using Aegis.Application.Abstractions.Services;
using Aegis.Infrastructure;
using Aegis.Api.Hubs;
using Aegis.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Application ve Infrastructure katmanlarını kaydet
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

// SignalR ve Canlı Yayın Servisi
builder.Services.AddSignalR();
builder.Services.AddScoped<ITelemetryBroadcastService, TelemetryBroadcastService>();

// CORS Politikası (Web Arayüzü / Next.js bağlantısı için)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyHeader()
              .AllowAnyMethod()
              .SetIsOriginAllowed(_ => true)
              .AllowCredentials();
    });
});

// REST API Controller desteği ve OpenAPI/Swagger
builder.Services.AddControllers();
builder.Services.AddOpenApi();

var app = builder.Build();

// HTTP Pipeline Konfigürasyonu
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");

// REST Controller Endpoint Eşlemesi
app.MapControllers();

// SignalR WebSocket Hub Endpoint Eşlemesi
app.MapHub<TelemetryHub>("/hubs/telemetry");

app.Run();
