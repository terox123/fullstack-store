package com.example.orders.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;

@Component
public class ProductClient {

    private final RestClient client;

    public ProductClient(@Value("${product-service.url}") String url) {
        this.client = RestClient.builder().baseUrl(url).build();
    }

    public ProductData getProduct(Long id, String serviceToken) {
        return client.get()
                .uri("/internal/products/{id}", id)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + serviceToken)
                .retrieve()
                .body(ProductData.class);
    }

    public void decreaseStock(Long id, int quantity, String serviceToken) {
        client.post()
                .uri(uriBuilder -> uriBuilder.path("/internal/products/{id}/decrease").queryParam("quantity", quantity).build(id))
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + serviceToken)
                .retrieve()
                .toBodilessEntity();
    }

    public record ProductData(Long id, String name, String description, BigDecimal price, String imageUrl, String brand, Integer stock) {
    }
}
