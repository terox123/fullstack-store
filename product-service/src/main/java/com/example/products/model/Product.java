package com.example.products.model;

import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String brand;
    private String name;
    @Column(length = 2000)
    private String description;
    private BigDecimal price;
    @Column(length = 1000)
    private String imageUrl;
    private int stock;
    private double rating;

    public Product() {
    }

    public Product(Long id, String brand, String name, String description, BigDecimal price, String imageUrl, int stock, double rating) {
        this.id = id;
        this.brand = brand;
        this.name = name;
        this.description = description;
        this.price = price;
        this.imageUrl = imageUrl;
        this.stock = stock;
        this.rating = rating;
    }

    public Long getId() { return id; }
    public String getBrand() { return brand; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public BigDecimal getPrice() { return price; }
    public String getImageUrl() { return imageUrl; }
    public int getStock() { return stock; }
    public double getRating() { return rating; }
    public void decreaseStock(int quantity) { stock -= quantity; }
}
