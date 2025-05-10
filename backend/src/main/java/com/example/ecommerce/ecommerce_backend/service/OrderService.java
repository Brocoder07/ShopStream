package com.example.ecommerce.ecommerce_backend.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.ecommerce.ecommerce_backend.dto.OrderItemDTO;
import com.example.ecommerce.ecommerce_backend.dto.OrderRequest;
import com.example.ecommerce.ecommerce_backend.entity.Order;
import com.example.ecommerce.ecommerce_backend.entity.OrderItem;
import com.example.ecommerce.ecommerce_backend.entity.Product;
import com.example.ecommerce.ecommerce_backend.entity.User;
import com.example.ecommerce.ecommerce_backend.repository.OrderItemRepository;
import com.example.ecommerce.ecommerce_backend.repository.OrderRepository;
import com.example.ecommerce.ecommerce_backend.repository.ProductRepository;
import com.example.ecommerce.ecommerce_backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public Order placeOrder(OrderRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Order order = Order.builder()
                .user(user)
                .orderDate(LocalDateTime.now())
                .status("PENDING")
                .build();

        List<OrderItem> orderItems = new ArrayList<>();
        double total = 0;

        for (OrderItemDTO itemDTO : request.getItems()) {
            Product product = productRepository.findById(itemDTO.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            if (product.getStock() < itemDTO.getQuantity()) {
                throw new RuntimeException("Not enough stock for " + product.getName());
            }

            product.setStock(product.getStock() - itemDTO.getQuantity());
            productRepository.save(product);

            OrderItem item = OrderItem.builder()
                    .product(product)
                    .quantity(itemDTO.getQuantity())
                    .price(product.getPrice())
                    .order(order)  // This sets the relationship
                    .build();

            total += product.getPrice() * itemDTO.getQuantity();
            orderItems.add(item);
        }

        order.setTotalAmount(total);
        order.setItems(orderItems);
        
        // Save order first to generate ID
        Order savedOrder = orderRepository.save(order);
        // Then save order items
        orderItemRepository.saveAll(orderItems);
        
        return savedOrder;
    }

    public List<Order> getUserOrders(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return orderRepository.findByUser(user);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public void updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(status);
        orderRepository.save(order);
    }
}