export enum VehicleType {
  Drone = 1,
  Ambulance = 2,
  RescueTeam = 3,
  UnmannedGroundVehicle = 4,
  Helicopter = 5
}

export enum VehicleStatus {
  Idle = 1,
  Active = 2,
  Maintenance = 3,
  Emergency = 4
}

export interface Vehicle {
  id: string;
  name: string;
  type: VehicleType;
  status: VehicleStatus;
  lastSeenAt: string;
}

export interface TelemetryDto {
  id: string;
  vehicleId: string;
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number;
  batteryPercentage: number;
  temperature: number;
  timestamp: string;
}

export interface TrackedVehicleState {
  vehicle: Vehicle;
  latestTelemetry?: TelemetryDto;
  telemetryHistory: TelemetryDto[];
}
