using Aegis.Application;
using Aegis.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// Application ve Infrastructure katmanlarını kaydet
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

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

// Controller Endpoint Eşlemesi
app.MapControllers();

app.Run();
