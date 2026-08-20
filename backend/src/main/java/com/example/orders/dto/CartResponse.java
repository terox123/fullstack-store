package com.example.orders.dto;

import java.math.BigDecimal;
import java.util.List;

public record CartResponse(List<CartItemResponse> items, BigDecimal subtotal,
                           BigDecimal deliveryPrice, BigDecimal totalPrice) { }
