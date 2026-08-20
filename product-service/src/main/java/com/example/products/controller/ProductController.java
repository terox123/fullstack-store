package com.example.products.controller;

import com.example.products.model.Product;
import com.example.products.repo.ProductRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
public class ProductController {

    private final ProductRepository repository;

    public ProductController(ProductRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/api/products")
    public List<Product> products(@RequestParam(required = false) String search) {
        if (search == null || search.isBlank()) {
            return repository.findAll();
        }
        return repository.findByNameContainingIgnoreCaseOrBrandContainingIgnoreCaseOrDescriptionContainingIgnoreCase(search, search, search);
    }

    @GetMapping("/api/products/{id}")
    public Product product(@PathVariable Long id) {
        return repository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
    }

    @GetMapping("/internal/products/{id}")
    public Product internalProduct(@PathVariable Long id) {
        return product(id);
    }

    @PostMapping("/internal/products/{id}/decrease")
    public Map<String, Object> decrease(@PathVariable Long id, @RequestParam int quantity) {
        Product product = product(id);

        if (quantity < 1 || product.getStock() < quantity) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Not enough stock");
        }

        product.decreaseStock(quantity);
        repository.save(product);
        return Map.of("updated", true, "stock", product.getStock());
    }
}
