package com.example.orders.repo;

import com.example.orders.model.CartItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CartRepository extends JpaRepository<CartItemEntity, Long> {

    List<CartItemEntity> findByOwnerEmailOrderByIdAsc(String ownerEmail);

    Optional<CartItemEntity> findByOwnerEmailAndProductId(String ownerEmail, Long productId);

    void deleteByOwnerEmail(String ownerEmail);
}
