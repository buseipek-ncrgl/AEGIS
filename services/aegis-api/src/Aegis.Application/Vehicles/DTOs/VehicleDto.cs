using Aegis.Domain.Enums;

namespace Aegis.Application.Vehicles.DTOs;

public record VehicleDto(
    Guid Id,
    string Name,
    VehicleType Type,
    VehicleStatus Status,
    DateTimeOffset LastSeenAt
);

public record CreateVehicleRequest(
    string Name,
    VehicleType Type
);
