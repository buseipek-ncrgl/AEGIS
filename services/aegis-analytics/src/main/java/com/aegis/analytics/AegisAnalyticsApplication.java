package com.aegis.analytics;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class AegisAnalyticsApplication {

    public static void main(String[] args) {
        System.out.println("==========================================================");
        System.out.println("AEGIS JAVA SPRING BOOT TELEMETRY ANALYTICS MICROSERVICE");
        System.out.println("==========================================================");
        SpringApplication.run(AegisAnalyticsApplication.class, args);
    }
}
