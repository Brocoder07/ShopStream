package com.example.ecommerce.ecommerce_backend.dto;

import java.util.List;

import lombok.Data;

@Data
public class OrderRequest {
    private List<OrderItemDTO> items;
}
