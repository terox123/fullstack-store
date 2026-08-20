package com.example.orders.dto;

import com.example.orders.model.OrderStatus;
import com.example.orders.model.PaymentMethod;
import com.example.orders.model.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderResponse(Long id, String ownerEmail,
                            OrderStatus status,
                            PaymentMethod paymentMethod,
                            PaymentStatus paymentStatus,
                            String firstName,
                            String lastName,
                            String phone,
                            String country,
                            String city,
                            String address,
                            String postalCode,
                            String apartment,
                            BigDecimal subtotal,
                            BigDecimal deliveryPrice,
                            BigDecimal totalPrice,
                            LocalDateTime createdAt,
                            List<OrderItemResponse> items
) {

    public static final int DISTANCE = 10;

}

