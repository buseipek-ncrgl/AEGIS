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

  // Gerçek Türkiye Havacılık Haritaları (ICAO / SHGM AIP Official Coordinates)
  // 1. LT-P1 Ankara Protokol & Anıtkabir Koruma Hava Sahası (Prohibited Area)
  const ltp1AnkaraProtocolsZone: [number, number][] = [
    [39.9380, 32.8250],
    [39.9480, 32.8650],
    [39.9100, 32.8800],
    [39.8950, 32.8350],
  ];

  // 2. LT-R4 Ankara Mürted / Akıncı Askeri Üssü Tahsisli Bölge (Restricted Area)
  const ltr4AkanciMilitaryZone: [number, number][] = [
    [40.0500, 32.5200],
    [40.1200, 32.6500],
    [40.0200, 32.7200],
    [39.9600, 32.5800],
  ];

  // 3. LT-P12 İzmir Çiğli 2. Ana Jet Üssü Askeri Uçuş Sahası (Prohibited Area)
  const ltp12CigliAirbaseZone: [number, number][] = [
    [38.4900, 27.0000],
    [38.5400, 27.0800],
    [38.4600, 27.1400],
    [38.4100, 27.0500],
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
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
      {/* HUD Radar Crosshair Reticle Overlay */}
      <div className="absolute inset-0 pointer-events-none z-[400] flex items-center justify-center opacity-30">
        <div className="w-[450px] h-[450px] border border-cyan-500/30 rounded-full border-dashed"></div>
        <div className="w-[300px] h-[300px] border border-cyan-500/40 rounded-full"></div>
        <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent"></div>
        <div className="absolute h-full w-[1px] bg-gradient-to-b from-transparent via-cyan-500/40 to-transparent"></div>
      </div>

      {/* Katman Seçici */}
      <div className="absolute top-4 right-4 z-[1000] bg-[#090e1a]/90 backdrop-blur-md border border-cyan-500/40 rounded-xl p-1.5 flex space-x-1.5 shadow-[0_0_20px_rgba(6,182,212,0.2)] font-mono">
        <button
          onClick={() => setTileSource("ESRI_DARK")}
          className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
            tileSource === "ESRI_DARK"
              ? "bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
              : "text-slate-300 hover:text-cyan-300"
          }`}
        >
          🌑 KOYU RADAR
        </button>
        <button
          onClick={() => setTileSource("SATELLITE")}
          className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
            tileSource === "SATELLITE"
              ? "bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
              : "text-slate-300 hover:text-cyan-300"
          }`}
        >
          🛰️ CANLI UYDU
        </button>
        <button
          onClick={() => setTileSource("OPENSTREETMAP")}
          className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
            tileSource === "OPENSTREETMAP"
              ? "bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
              : "text-slate-300 hover:text-cyan-300"
          }`}
        >
          🗺️ VEKTÖR HARİTA
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

        {/* Gerçek Türkiye ICAO/AIP Askeri & Protokol Yasaklı Bölgeleri */}
        <Polygon
          positions={ltp1AnkaraProtocolsZone}
          pathOptions={{
            color: "#f43f5e",
            fillColor: "#f43f5e",
            fillOpacity: 0.28,
            weight: 2,
            dashArray: "4, 6",
          }}
        >
          <Popup>
            <div className="font-sans text-xs p-1">
              <strong className="text-rose-700 block font-bold">🚫 LT-P1 ANKARA PROTOKOL & ANITKABİR KORUMA SAHASI</strong>
              <span className="text-slate-700">SHGM / ICAO Resmi Uçuşa Yasaklı Hava Sahası (Prohibited).</span>
            </div>
          </Popup>
        </Polygon>

        <Polygon
          positions={ltr4AkanciMilitaryZone}
          pathOptions={{
            color: "#eab308",
            fillColor: "#eab308",
            fillOpacity: 0.2,
            weight: 2,
            dashArray: "5, 5",
          }}
        >
          <Popup>
            <div className="font-sans text-xs p-1">
              <strong className="text-amber-700 block font-bold">⚠️ LT-R4 MÜRTED / AKINCI ASKERİ TAHSİSLİ SAHA</strong>
              <span className="text-slate-700">Askeri Uçuş Bölgesi (Restricted Airspace).</span>
            </div>
          </Popup>
        </Polygon>

        <Polygon
          positions={ltp12CigliAirbaseZone}
          pathOptions={{
            color: "#f43f5e",
            fillColor: "#f43f5e",
            fillOpacity: 0.28,
            weight: 2,
            dashArray: "4, 6",
          }}
        >
          <Popup>
            <div className="font-sans text-xs p-1">
              <strong className="text-rose-700 block font-bold">🚫 LT-P12 İZMİR ÇİĞLİ 2. ANA JET ÜSSÜ SAHASI</strong>
              <span className="text-slate-700">TSK Askeri Hava Savunma Bölgesi (Prohibited).</span>
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
