export enum AlertSeverity {
  Low = 1,
  Medium = 2,
  High = 3,
  Critical = 4,
}

export enum AlertType {
  LowBattery = 1,
  HighTemperature = 2,
  GeofenceViolation = 3,
  ConnectionLost = 4,
}

export interface AlertDto {
  id: string;
  vehicleId: string;
  vehicleName: string;
  severity: AlertSeverity;
  type: AlertType;
  message: string;
  createdAt: string;
  isAcknowledged: boolean;
}
