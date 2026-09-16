import http from 'k6/http';
import { check, sleep } from 'k6';

// AEGIS V2 k6 Yük ve Performans Testi Konfigürasyonu
export const options = {
  stages: [
    { duration: '10s', target: 50 },  // 10 saniyede 50 Eşzamanlı Donanım/Araç Seviyesine Tırman
    { duration: '20s', target: 200 }, // 20 saniye boyunca 200 Eşzamanlı Araç Yükü (Peak Load)
    { duration: '10s', target: 0 },   // 10 saniyede Yükü Sıfırla (Cool-down)
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // Yanıtların %95'i 500ms'den hızlı olmalı
    http_req_failed: ['rate<0.01'],    // Başarısızlık/Hata oranı %1'in altında olmalı
  },
};

export default function () {
  const url = 'http://localhost:5000/api/telemetry';
  
  // Rastgele GPS Telemetri Verisi Üretimi (Ankara Semaları)
  const payload = JSON.stringify({
    vehicleId: 'bc2201bf-acab-4b23-9332-3996bb8e553e',
    latitude: 39.9334 + (Math.random() - 0.5) * 0.02,
    longitude: 32.8597 + (Math.random() - 0.5) * 0.02,
    altitude: 850.0 + Math.random() * 100,
    speed: 90.0 + Math.random() * 40,
    batteryPercentage: 85.0 - Math.random() * 20,
    temperature: 24.0 + Math.random() * 10,
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post(url, payload, params);

  // Yanıt Kontrolü (HTTP 200 OK)
  check(res, {
    'status is 200 or 201': (r) => r.status === 200 || r.status === 201,
  });

  sleep(0.1); // 100ms Simülasyon Gecikmesi
}
