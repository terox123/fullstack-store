package com.example.orders.dto;

import java.math.BigDecimal;


public record CartItemResponse(Long id, Long productId, String productName, String imageUrl,
                               BigDecimal unitPrice, int quantity, BigDecimal totalPrice) { }
