import requests
import time
import sys

# Windows konsolunda UTF-8 Türkçe ve Emoji desteği sağla
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from vehicle_simulator import SimulatedVehicle

import os

# AEGIS API URL'si
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:5000/api")

def register_vehicle(name: str, vehicle_type: int) -> str:
    """
    API'ye araç kaydeder veya kayıtlı aracın ID'sini döner.
    """
    url = f"{API_BASE_URL}/vehicles"
    payload = {"name": name, "type": vehicle_type}
    try:
        response = requests.post(url, json=payload, timeout=10)
        if response.status_code in [200, 201]:
            data = response.json()
            print(f"[OK] Araç Kayıtlı: {name} (ID: {data['id']})")
            return data["id"]
        else:
            print(f"[UYARI] Araç kaydı başarısız ({response.status_code}): {response.text}")
    except Exception as e:
        print(f"[HATA] API Bağlantı Hatası: {e}")
    return ""

def main():
    print("=" * 60)
    print("AEGIS GERCEK ZAMANLI TELEMETRI SIMULATORU BASLATILIYOR")
    print("=" * 60)

    # Official STM & Turkish Defense Tactical Platform Fleet
    vehicles = [
        SimulatedVehicle(
            vehicle_id="",
            name="STM-KARGU-2",
            vehicle_type=1, # Drone (Taktik Vurucu İHA)
            start_lat=39.9334,
            start_lng=32.8597,
            base_altitude=850.0,
            speed_kmh=110.0
        ),
        SimulatedVehicle(
            vehicle_id="",
            name="STM-TOGAN-2",
            vehicle_type=1, # Drone (Otonom Keşif İHA)
            start_lat=39.9520,
            start_lng=32.8800,
            base_altitude=920.0,
            speed_kmh=130.0
        ),
        SimulatedVehicle(
            vehicle_id="",
            name="STM-ALPAGU-1",
            vehicle_type=1, # Drone (Akıllı Dolanıcı Mühimmat)
            start_lat=39.9100,
            start_lng=32.8300,
            base_altitude=780.0,
            speed_kmh=150.0
        ),
        SimulatedVehicle(
            vehicle_id="",
            name="AFAD-AMBULANS-06",
            vehicle_type=2, # Ambulance
            start_lat=39.9208,
            start_lng=32.8541,
            base_altitude=890.0,
            speed_kmh=65.0
        ),
        SimulatedVehicle(
            vehicle_id="",
            name="TSK-HELS-35",
            vehicle_type=5, # Helicopter
            start_lat=38.4237,
            start_lng=27.1428,
            base_altitude=450.0,
            speed_kmh=140.0
        )
    ]

    print("\n1. Araçlar API'ye kaydettiriliyor...")
    registered_vehicles = []

    for v in vehicles:
        vid = register_vehicle(v.name, v.type)
        if vid:
            v.vehicle_id = vid
            registered_vehicles.append(v)
        time.sleep(0.5)

    if not registered_vehicles:
        print("\n[HATA] Hiçbir araç API'ye kaydedilemedi. Lütfen C# ASP.NET Core API'sinin ayakta olduğundan emin olun!")
        sys.exit(1)

    print(f"\n2. {len(registered_vehicles)} araç için CANLI TELEMETRİ DÖNGÜSÜ BAŞLIYOR...\n")

    step_count = 0
    while True:
        step_count += 1
        print(f"--- [ADIM #{step_count}] - {time.strftime('%H:%M:%S')} ---")

        for v in registered_vehicles:
            # 1. Simülasyonda 2 saniyelik adımı ilerlet (konum, batarya, irtifa değişir)
            v.step(delta_seconds=2.0)

            # 2. REST API için JSON paketini hazırla
            telemetry_payload = v.to_telemetry_payload()

            # 3. HTTP POST isteği ile telemetriyi C# API'ye gönder
            try:
                res = requests.post(f"{API_BASE_URL}/telemetry", json=telemetry_payload, timeout=10)
                if res.status_code == 200:
                    print(f"   [CANLI] [{v.name}] -> Enlem: {v.lat:.4f}, Boylam: {v.lng:.4f} | Batarya: %{v.battery:.1f} | İrtifa: {v.altitude:.1f}m | Hız: {v.speed:.1f} km/h (200 OK)")
                elif res.status_code == 404:
                    print(f"   [YENİDEN KAYIT] [{v.name}] -> Veritabanı sıfırlanmış, araç tekrar kaydediliyor...")
                    new_id = register_vehicle(v.name, v.type)
                    if new_id:
                        v.vehicle_id = new_id
                else:
                    print(f"   [UYARI] [{v.name}] -> Telemetri gönderilemedi ({res.status_code})")
            except Exception as e:
                print(f"   [HATA] [{v.name}] -> Gönderim hatası: {e}")

        time.sleep(1.5)

if __name__ == "__main__":
    main()
