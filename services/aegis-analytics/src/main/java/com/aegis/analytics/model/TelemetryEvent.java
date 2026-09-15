package com.aegis.analytics.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public class TelemetryEvent {

    @JsonProperty("TelemetryId")
    private String telemetryId;

    @JsonProperty("VehicleId")
    private String vehicleId;

    @JsonProperty("Latitude")
    private double latitude;

    @JsonProperty("Longitude")
    private double longitude;

    @JsonProperty("Altitude")
    private double altitude;

    @JsonProperty("Speed")
    private double speed;

    @JsonProperty("BatteryPercentage")
    private double batteryPercentage;

    @JsonProperty("Temperature")
    private double temperature;

    @JsonProperty("Timestamp")
    private String timestamp;

    public TelemetryEvent() {}

    public String getTelemetryId() { return telemetryId; }
    public void setTelemetryId(String telemetryId) { this.telemetryId = telemetryId; }

    public String getVehicleId() { return vehicleId; }
    public void setVehicleId(String vehicleId) { this.vehicleId = vehicleId; }

    public double getLatitude() { return latitude; }
    public void setLatitude(double latitude) { this.latitude = latitude; }

    public double getLongitude() { return longitude; }
    public void setLongitude(double longitude) { this.longitude = longitude; }

    public double getAltitude() { return altitude; }
    public void setAltitude(double altitude) { this.altitude = altitude; }

    public double getSpeed() { return speed; }
    public void setSpeed(double speed) { this.speed = speed; }

    public double getBatteryPercentage() { return batteryPercentage; }
    public void setBatteryPercentage(double batteryPercentage) { this.batteryPercentage = batteryPercentage; }

    public double getTemperature() { return temperature; }
    public void setTemperature(double temperature) { this.temperature = temperature; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
}
