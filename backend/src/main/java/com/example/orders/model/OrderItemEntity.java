package com.example.orders.model;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;


@Entity
@Table(name = "order_items")
public class OrderItemEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Getter
    @Setter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private OrderEntity order;

    @Getter
    @Setter
    private Long productId;
    @Getter
    @Setter
    private String productName;
    @Getter
    @Setter
    private String imageUrl;


    @Getter
    @Setter
    private BigDecimal unitPrice;

    @Getter
    @Setter
    private int quantity;


    @Getter
    @Setter
    private BigDecimal totalPrice;


    public OrderItemEntity() {
    }


    public OrderItemEntity(Long productId, String productName,
                           String imageUrl, BigDecimal unitPrice,
            int quantity) {

        this.productId = productId;

        this.productName = productName;

        this.imageUrl = imageUrl;

        this.unitPrice = unitPrice;

        this.quantity = quantity;

        this.totalPrice =
                unitPrice.multiply(
                        BigDecimal.valueOf(quantity)
                );
    }



}