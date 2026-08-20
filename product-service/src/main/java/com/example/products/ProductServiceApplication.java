package com.example.products;

import com.example.products.model.Product;
import com.example.products.repo.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.math.BigDecimal;

@SpringBootApplication
public class ProductServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(ProductServiceApplication.class, args);
    }

    @Bean
    CommandLineRunner seed(ProductRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                repository.save(new Product(null, "Apple", "iPhone 16 Pro", "Apple iPhone 16 Pro with titanium design and A18 Pro chip.", new BigDecimal("1199.00"), "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd", 25, 4.8));
                repository.save(new Product(null, "Sony", "WH-1000XM5", "Premium wireless noise-cancelling headphones.", new BigDecimal("349.00"), "https://images.unsplash.com/photo-1505740420928-5e560c06d30e", 40, 4.7));
                repository.save(new Product(null, "Dell", "XPS 15", "Powerful 15-inch laptop for work and development.", new BigDecimal("1599.00"), "https://images.unsplash.com/photo-1496181133206-80ce9b88a853", 12, 4.6));
                repository.save(new Product(null, "Logitech", "MX Master 3S", "Ergonomic wireless mouse with precise tracking.", new BigDecimal("99.00"), "https://images.unsplash.com/photo-1527814050087-3793815479db", 80, 4.8));
                repository.save(new Product(null, "Samsung", "Galaxy Tab S10", "High-end Android tablet with AMOLED display.", new BigDecimal("799.00"), "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0", 20, 4.5));
            }
        };
    }
}
