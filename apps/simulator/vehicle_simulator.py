import math
import random
import time

class SimulatedVehicle:
    """
    AEGIS Platformu için Araç Telemetri Simülatörü.
    Gerçekçi GPS hareketleri, irtifa, hız ve batarya tüketimi simüle eder.
    """
    def __init__(self, vehicle_id: str, name: str, vehicle_type: int, start_lat: float, start_lng: float, base_altitude: float = 100.0, speed_kmh: float = 60.0):
        self.vehicle_id = vehicle_id
        self.name = name
        self.type = vehicle_type
        self.lat = start_lat
        self.lng = start_lng
        self.altitude = base_altitude
        self.speed = speed_kmh
        self.battery = 100.0
        self.temperature = 25.0
        self.heading = random.uniform(0, 360) # Derece yön (0=Kuzey, 90=Doğu, vb.)

    def step(self, delta_seconds: float = 2.0):
        """
        Her delta_seconds sürede bir aracın konumunu, bataryasını ve durumunu günceller.
        """
        # Hız km/s -> m/s dönüşümü
        speed_ms = (self.speed * 1000) / 3600
        distance_moved = speed_ms * delta_seconds # Metre cinsinden kat edilen mesafe

        # 1 derece enlem yaklaşık 111,000 metredir.
        # Yön derecesini radyana çevirelim
        heading_rad = math.radians(self.heading)
        
        # GPS koordinatlarını ilerlet
        delta_lat = (distance_moved * math.cos(heading_rad)) / 111000.0
        delta_lng = (distance_moved * math.sin(heading_rad)) / (111000.0 * math.cos(math.radians(self.lat)))

        self.lat += delta_lat
        self.lng += delta_lng

        # Küçük yön değişiklikleri (gerçekçi uçuş/sürüş rotası)
        self.heading += random.uniform(-5.0, 5.0)

        # İrtifa küçük dalgalanmalar (İHA uçuşu için +- 2 metre)
        self.altitude += random.uniform(-1.5, 1.5)
        self.altitude = max(10.0, self.altitude)

        # Batarya tüketimi (saniyede ~%0.05 harcama)
        self.battery -= random.uniform(0.02, 0.08)
        self.battery = max(0.0, self.battery)

        # Motor/Sistem sıcaklığı dalgalanması
        self.temperature += random.uniform(-0.5, 0.5)
        self.temperature = max(15.0, min(65.0, self.temperature))

    def to_telemetry_payload(self) -> dict:
        """
        ASP.NET Core REST API 'CreateTelemetryRequest' DTO'suna uygun JSON sözlüğü üretir.
        """
        return {
            "vehicleId": self.vehicle_id,
            "latitude": round(self.lat, 6),
            "longitude": round(self.lng, 6),
            "altitude": round(self.altitude, 1),
            "speed": round(self.speed, 1),
            "batteryPercentage": round(self.battery, 1),
            "temperature": round(self.temperature, 1)
        }
