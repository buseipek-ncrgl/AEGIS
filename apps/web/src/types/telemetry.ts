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

export enum AnomalyType {
  None = 0,
  GpsSpoofing = 1,
  SuddenFreefall = 2,
  ThermalRunaway = 3
}

export interface TelemetryAnomaly {
  anomalyType: AnomalyType;
  description: string;
  confidenceScore: number;
  detectedAt: string;
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
  anomalies?: TelemetryAnomaly[];
}

export interface TrackedVehicleState {
  vehicle: Vehicle;
  latestTelemetry?: TelemetryDto;
  telemetryHistory: TelemetryDto[];
}
