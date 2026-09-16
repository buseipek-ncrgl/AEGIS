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

// REST API Controller desteği, gRPC ve OpenAPI/Swagger
builder.Services.AddControllers();
builder.Services.AddGrpc();
builder.Services.AddOpenApi();

var app = builder.Build();

// HTTP Pipeline Konfigürasyonu
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("AllowAll");

// Ana Sayfa (Root) Hoşgeldiniz & API Durum Endpoint'i
app.MapGet("/", () => Results.Ok(new 
{ 
    system = "AEGIS Command & Control API", 
    status = "Online", 
    version = "v2.0 (Distributed Architecture)",
    endpoints = new[] { "/api/vehicles", "/api/telemetry", "/api/alerts", "/hubs/telemetry", "gRPC: TelemetryGrpc" }
}));

// REST Controller Endpoint Eşlemesi
app.MapControllers();

// gRPC Service Endpoint Eşlemesi
app.MapGrpcService<TelemetryGrpcService>();

// SignalR WebSocket Hub Endpoint Eşlemesi
app.MapHub<TelemetryHub>("/hubs/telemetry");

app.Run();
