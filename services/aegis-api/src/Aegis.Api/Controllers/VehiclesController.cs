using Aegis.Application.Vehicles.DTOs;
using Aegis.Application.Vehicles.Services;
using Microsoft.AspNetCore.Mvc;

namespace Aegis.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VehiclesController(IVehicleService vehicleService) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<VehicleDto>> CreateVehicle([FromBody] CreateVehicleRequest request, CancellationToken cancellationToken)
    {
        var vehicle = await vehicleService.CreateVehicleAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetVehicleById), new { id = vehicle.Id }, vehicle);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<VehicleDto>> GetVehicleById(Guid id, CancellationToken cancellationToken)
    {
        var vehicle = await vehicleService.GetVehicleByIdAsync(id, cancellationToken);
        if (vehicle is null)
            return NotFound(new { Message = $"Id'si '{id}' olan araç bulunamadı." });

        return Ok(vehicle);
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<VehicleDto>>> GetAllVehicles(CancellationToken cancellationToken)
    {
        var vehicles = await vehicleService.GetAllVehiclesAsync(cancellationToken);
        return Ok(vehicles);
    }
}
