# .NET 9 SDK ile Derleme (Build Stage)
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Proje dosyalarını kopyala ve geri yükle (Restore)
COPY ["services/aegis-api/src/Aegis.Domain/Aegis.Domain.csproj", "services/aegis-api/src/Aegis.Domain/"]
COPY ["services/aegis-api/src/Aegis.Application/Aegis.Application.csproj", "services/aegis-api/src/Aegis.Application/"]
COPY ["services/aegis-api/src/Aegis.Infrastructure/Aegis.Infrastructure.csproj", "services/aegis-api/src/Aegis.Infrastructure/"]
COPY ["services/aegis-api/src/Aegis.Api/Aegis.Api.csproj", "services/aegis-api/src/Aegis.Api/"]

RUN dotnet restore "services/aegis-api/src/Aegis.Api/Aegis.Api.csproj"

# Tüm kaynak kodları kopyala ve derle (Publish)
COPY services/aegis-api/src/ services/aegis-api/src/
WORKDIR "/src/services/aegis-api/src/Aegis.Api"
RUN dotnet publish "Aegis.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Çalıştırma Aşaması (Runtime Stage)
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 5000
ENTRYPOINT ["dotnet", "Aegis.Api.dll"]
