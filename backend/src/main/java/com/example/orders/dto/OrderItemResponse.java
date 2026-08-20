package com.example.orders.dto;

import java.math.BigDecimal;

public record OrderItemResponse(Long productId, String productName, String imageUrl,
                                BigDecimal unitPrice, int quantity, BigDecimal totalPrice) {
}
