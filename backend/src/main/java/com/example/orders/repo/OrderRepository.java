package com.example.orders.repo;

import com.example.orders.model.OrderEntity;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<OrderEntity, Long> {

    @EntityGraph(attributePaths = "items")
    List<OrderEntity> findByOwnerEmailOrderByCreatedAtDesc(String ownerEmail);

    @EntityGraph(attributePaths = "items")
    Optional<OrderEntity> findByIdAndOwnerEmail(Long id, String ownerEmail);

    @EntityGraph(attributePaths = "items")
    List<OrderEntity> findOrderEntityByCreatedAt(LocalDateTime localDateTime);

}
