/* <<<<<<<<<<<<<<  ✨ Windsurf Command 🌟 >>>>>>>>>>>>>>>> */
package com.example.orders.model;


import jakarta.persistence.*;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;



import java.time.LocalDateTime;
import java.util.ArrayList;

import java.util.List;

@Setter
@Getter
@Entity
@Table(name = "orders")
public class OrderEntity {

    @Setter
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Setter
    private String ownerEmail;

    @Setter
    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    @Setter
    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    @Setter
    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus;

    @Setter
    private String firstName;

    @Setter
    private String lastName;

    @Setter
    private String phone;

    @Setter
    private String country;

    @Setter
    private String city;

    @Setter
    private String address;

    @Setter
    private String postalCode;

    @Setter
    private String apartment;

    @Setter

    private BigDecimal subtotal;

    @Setter
    private BigDecimal deliveryPrice;

    @Setter
    private BigDecimal totalPrice;

    @Setter
    private LocalDateTime createdAt;

    @Setter
    private LocalDateTime updatedAt;

    @Setter
    @OneToMany(
            mappedBy = "order",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<OrderItemEntity> items =
            new ArrayList<>();


    public OrderEntity() {
    }


    public void addItem(
            OrderItemEntity item
    ) {

        item.setOrder(this);

        items.add(item);
    }


    public void removeItem(
            OrderItemEntity item
    ) {

        items.remove(item);

        item.setOrder(null);
    }



    @PrePersist
    private void onCreate() {

        LocalDateTime now = LocalDateTime.now();

        createdAt = now;

        updatedAt = now;
    }


    @PreUpdate
    private void onUpdate() {

        updatedAt = LocalDateTime.now();
    }
}
