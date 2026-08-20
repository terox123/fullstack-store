package com.example.orders.model;
import jakarta.persistence.*;
import lombok.Getter;

@Entity
@Table(name = "cart_items", uniqueConstraints = @UniqueConstraint
        (columnNames = {"owner_email", "product_id"}))
public class CartItemEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Getter
    private Long id;


    @Column(name = "owner_email", nullable = false)
    @Getter
    private String ownerEmail;


    @Column(name = "product_id", nullable = false)
    @Getter
    private Long productId;


    @Column(nullable = false)
    @Getter
    private int quantity;


    public CartItemEntity() {
    }


    public CartItemEntity(
            String ownerEmail,
            Long productId,
            int quantity
    ) {

        this.ownerEmail = ownerEmail;

        this.productId = productId;

        this.quantity = quantity;
    }


    public void addQuantity(
            int amount
    ) {

        this.quantity += amount;
    }


    public void updateQuantity(
            int quantity
    ) {

        this.quantity = quantity;
    }



}