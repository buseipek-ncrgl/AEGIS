"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, Polygon, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { TrackedVehicleState, VehicleType, TelemetryDto } from "@/types/telemetry";

// Custom Leaflet Icons for Drone, Ambulance, Helicopter
const createCustomIcon = (type: VehicleType, isSelected: boolean) => {
  let color = "#10b981"; // Emerald
  let symbol = "✈️";

  if (type === VehicleType.Ambulance) {
    color = "#f43f5e"; // Rose
    symbol = "🚑";
  } else if (type === VehicleType.Helicopter) {
    color = "#06b6d4"; // Cyan
    symbol = "🚁";
  }

  const border = isSelected ? "3px solid #34d399" : "2px solid rgba(255,255,255,0.3)";
  const glow = isSelected ? "box-shadow: 0 0 15px #34d399;" : "";

  return L.divIcon({
    className: "custom-leaflet-marker",
    html: `<div style="
      background: ${color};
      width: 34px;
      height: 34px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      border: ${border};
      ${glow}
      transition: all 0.3s ease;
    ">${symbol}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
};

function MapRecenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], map.getZoom(), { animate: true, duration: 1.0 });
  }, [lat, lng, map]);
  return null;
}

interface GisMapProps {
  trackedVehicles: Map<string, TrackedVehicleState>;
  selectedVehicleId: string | null;
  onSelectVehicle: (id: string) => void;
  playbackTelemetry?: TelemetryDto | null;
}

type TileSource = "ESRI_DARK" | "SATELLITE" | "OPENSTREETMAP";

export default function GisMap({
  trackedVehicles,
  selectedVehicleId,
  onSelectVehicle,
  playbackTelemetry,
}: GisMapProps) {
  const [tileSource, setTileSource] = useState<TileSource>("ESRI_DARK");

  const vehicleList = Array.from(trackedVehicles.values());
  const selectedState = selectedVehicleId ? trackedVehicles.get(selectedVehicleId) : null;

  // Center on Ankara (default) or Selected Vehicle / Playback Point
  const activeLat =
    playbackTelemetry?.latitude ?? selectedState?.latestTelemetry?.latitude ?? 39.9334;
  const activeLng =
    playbackTelemetry?.longitude ?? selectedState?.latestTelemetry?.longitude ?? 32.8597;

  // Ankara & İzmir Askeri Yasaklı Bölge (No-Fly Zone Geofence Polygons)
  const ankaraRestrictedZone: [number, number][] = [
    [39.9650, 32.8200],
    [39.9750, 32.9000],
    [39.9100, 32.9150],
    [39.9000, 32.8300],
  ];

  const izmirRestrictedZone: [number, number][] = [
    [38.4800, 27.1000],
    [38.5000, 27.1800],
    [38.4200, 27.2000],
    [38.4100, 27.1200],
  ];

  const tileConfigs = {
    ESRI_DARK: {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
      attribution: "&copy; Esri &mdash; Esri, DeLorme, NAVTEQ, USGS",
    },
    SATELLITE: {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution: "&copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics",
    },
    OPENSTREETMAP: {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
  };

  const currentTile = tileConfigs[tileSource];

  return (
    <div className="relative w-full h-full">
      {/* Katman Seçici */}
      <div className="absolute top-3 right-3 z-[1000] bg-slate-900/90 backdrop-blur border border-slate-700/80 rounded-lg p-1 flex space-x-1 shadow-lg">
        <button
          onClick={() => setTileSource("ESRI_DARK")}
          className={`px-2.5 py-1 text-[10px] font-bold rounded transition ${
            tileSource === "ESRI_DARK" ? "bg-emerald-600 text-white" : "text-slate-300 hover:text-white"
          }`}
        >
          🌑 Karanlık GIS
        </button>
        <button
          onClick={() => setTileSource("SATELLITE")}
          className={`px-2.5 py-1 text-[10px] font-bold rounded transition ${
            tileSource === "SATELLITE" ? "bg-emerald-600 text-white" : "text-slate-300 hover:text-white"
          }`}
        >
          🛰️ Uydu
        </button>
        <button
          onClick={() => setTileSource("OPENSTREETMAP")}
          className={`px-2.5 py-1 text-[10px] font-bold rounded transition ${
            tileSource === "OPENSTREETMAP" ? "bg-emerald-600 text-white" : "text-slate-300 hover:text-white"
          }`}
        >
          🗺️ Sokak
        </button>
      </div>

      <MapContainer
        center={[activeLat, activeLng]}
        zoom={11}
        scrollWheelZoom={true}
        style={{ width: "100%", height: "100%", background: "#090d16" }}
      >
        <TileLayer key={tileSource} attribution={currentTile.attribution} url={currentTile.url} maxZoom={18} />

        <MapRecenter lat={activeLat} lng={activeLng} />

        {/* Askeri Yasaklı Hava Sahaları (Geofence No-Fly Zone Polygons) */}
        <Polygon
          positions={ankaraRestrictedZone}
          pathOptions={{
            color: "#f43f5e",
            fillColor: "#f43f5e",
            fillOpacity: 0.25,
            weight: 2,
            dashArray: "4, 6",
          }}
        >
          <Popup>
            <div className="font-sans text-xs p-1">
              <strong className="text-rose-700 block font-bold">🚫 ANKARA ASKERİ YASAKLI BÖLGE</strong>
              <span className="text-slate-700">Geofence İhlali Halinde Taktik Alarm Fırlatılır.</span>
            </div>
          </Popup>
        </Polygon>

        <Polygon
          positions={izmirRestrictedZone}
          pathOptions={{
            color: "#f43f5e",
            fillColor: "#f43f5e",
            fillOpacity: 0.25,
            weight: 2,
            dashArray: "4, 6",
          }}
        >
          <Popup>
            <div className="font-sans text-xs p-1">
              <strong className="text-rose-700 block font-bold">🚫 İZMİR ASKERİ HAVA SAHASI (NO-FLY ZONE)</strong>
              <span className="text-slate-700">İzin Olmadan Girilemez.</span>
            </div>
          </Popup>
        </Polygon>

        {/* Araç Rota İzi Çizimi (Neon Flight Path Trails) */}
        {vehicleList.map((state) => {
          if (state.telemetryHistory.length < 2) return null;

          const positions: [number, number][] = state.telemetryHistory.map((t) => [t.latitude, t.longitude]);

          let pathColor = "#10b981";
          if (state.vehicle.type === VehicleType.Ambulance) pathColor = "#f43f5e";
          else if (state.vehicle.type === VehicleType.Helicopter) pathColor = "#06b6d4";

          const isSelected = state.vehicle.id === selectedVehicleId;

          return (
            <Polyline
              key={`path-${state.vehicle.id}`}
              positions={positions}
              pathOptions={{
                color: pathColor,
                weight: isSelected ? 4 : 2,
                opacity: isSelected ? 0.9 : 0.6,
                dashArray: "6, 8",
              }}
            />
          );
        })}

        {/* Map Vehicle Markers */}
        {vehicleList.map((state) => {
          const isSelected = state.vehicle.id === selectedVehicleId;
          const t = isSelected && playbackTelemetry ? playbackTelemetry : state.latestTelemetry;
          if (!t) return null;

          const icon = createCustomIcon(state.vehicle.type, isSelected);

          return (
            <Marker
              key={state.vehicle.id}
              position={[t.latitude, t.longitude]}
              icon={icon}
              eventHandlers={{
                click: () => onSelectVehicle(state.vehicle.id),
              }}
            >
              <Popup className="custom-leaflet-popup">
                <div className="p-1 font-sans text-xs">
                  <strong className="text-slate-900 block text-sm mb-1">{state.vehicle.name}</strong>
                  <div>Enlem: {t.latitude.toFixed(4)}</div>
                  <div>Boylam: {t.longitude.toFixed(4)}</div>
                  <div>İrtifa: {t.altitude} m</div>
                  <div>Hız: {t.speed} km/h</div>
                  <div>Batarya: %{t.batteryPercentage}</div>
                  {playbackTelemetry && isSelected && (
                    <div className="mt-1 font-mono text-[10px] text-cyan-700 bg-cyan-100 p-1 rounded font-bold">
                      ⏪ Uçuş Geçmişi Oynatılıyor
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
