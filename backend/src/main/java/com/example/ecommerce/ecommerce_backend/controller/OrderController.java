package com.example.ecommerce.ecommerce_backend.controller;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import com.example.ecommerce.ecommerce_backend.entity.Order;
import com.example.ecommerce.ecommerce_backend.entity.OrderItem;
import com.example.ecommerce.ecommerce_backend.entity.Product;
import com.example.ecommerce.ecommerce_backend.entity.User;
import com.example.ecommerce.ecommerce_backend.repository.OrderRepository;
import com.example.ecommerce.ecommerce_backend.repository.ProductRepository;
import com.example.ecommerce.ecommerce_backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @PostMapping("/place")
    @Transactional
    public ResponseEntity<?> placeOrder(@RequestBody Map<String, Integer> cart, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        List<OrderItem> items = new ArrayList<>();
        double total = 0;

        for (Map.Entry<String, Integer> entry : cart.entrySet()) {
            Product product = productRepository.findById(Long.parseLong(entry.getKey())).orElseThrow();
            int quantity = entry.getValue();
            items.add(OrderItem.builder()
                    .product(product)
                    .quantity(quantity)
                    .price(product.getPrice() * quantity)
                    .build());
            total += product.getPrice() * quantity;
        }

        Order order = Order.builder()
                .user(user)
                .items(items)
                .status("PENDING")
                .totalAmount(total)  // Changed from totalPrice to totalAmount
                .orderDate(LocalDateTime.now())
                .build();

        return ResponseEntity.ok(orderRepository.save(order));
    }

    @GetMapping("/my")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getMyOrders(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        return ResponseEntity.ok(orderRepository.findByUser(user));
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getOrderDetails(@PathVariable Long id, Authentication authentication) {
        Order order = orderRepository.findById(id).orElseThrow();
        if (!order.getUser().getEmail().equals(authentication.getName())) {
            return ResponseEntity.status(403).body("Unauthorized");
        }
        return ResponseEntity.ok(order);
    }
    @GetMapping("/all")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getAllOrders() {
        return ResponseEntity.ok(orderRepository.findAll());
    }
}