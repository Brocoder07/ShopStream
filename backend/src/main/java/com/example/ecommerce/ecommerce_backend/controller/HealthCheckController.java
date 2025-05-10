package com.example.ecommerce.ecommerce_backend.controller;

import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/health")
public class HealthCheckController implements HealthIndicator {

    @GetMapping
    public String healthCheck() {
        return "Service is up and running";
    }

    @Override
    public Health health() {
        // Add additional health checks here
        return Health.up().build();
    }
}
