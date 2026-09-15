package com.aegis.analytics.listener;

import com.aegis.analytics.model.TelemetryEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class TelemetryKafkaListener {

    private static final Logger log = LoggerFactory.getLogger(TelemetryKafkaListener.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    @KafkaListener(topics = "aegis.telemetry.events", groupId = "aegis-analytics-group")
    public void listenTelemetryEvent(String message) {
        try {
            TelemetryEvent event = objectMapper.readValue(message, TelemetryEvent.class);
            log.info("🍃 [JAVA SPRING BOOT] Kafka Event Alındı -> Araç ID: {}, Enlem: {}, Boylam: {}, Pil: %{}",
                    event.getVehicleId(), event.getLatitude(), event.getLongitude(), event.getBatteryPercentage());

            // Java Derin Analiz Motoru
            evaluateAnalyticsRules(event);
        } catch (Exception e) {
            log.error("❌ Kafka mesajı işlenirken hata oluştu: ", e);
        }
    }

    private void evaluateAnalyticsRules(TelemetryEvent event) {
        if (event.getBatteryPercentage() < 15.0) {
            log.warn("🚨 [JAVA ANALİTİK UYARI] Araç ID: {} için KRİTİK DÜŞÜK BATARYA (%{}) tespit edildi!",
                    event.getVehicleId(), event.getBatteryPercentage());
        }

        if (event.getLatitude() > 40.0 && event.getLongitude() > 32.7) {
            log.warn("🚨 [JAVA ANALİTİK UYARI] Araç ID: {} Ankara Kuzey Yasaklı Bölgeye girdi!",
                    event.getVehicleId());
        }

        if (event.getSpeed() > 120.0) {
            log.info("⚠️ [JAVA ANALİTİK UYARI] Araç ID: {} yüksek hızda ilerliyor: {} km/h",
                    event.getVehicleId(), event.getSpeed());
        }
    }
}
