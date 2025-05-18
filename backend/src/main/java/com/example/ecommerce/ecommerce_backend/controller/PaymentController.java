package com.example.ecommerce.ecommerce_backend.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @PostMapping("/simulate")
    public ResponseEntity<?> simulatePayment(@RequestBody Map<String, Object> payload) {
        // Simulate payment logic (e.g., always succeed)
        return ResponseEntity.ok(Map.of("status", "Payment Successful", "reference", "TXN" + System.currentTimeMillis()));
    }
}
