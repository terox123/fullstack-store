package com.example.orders.controller;


import com.example.orders.dto.CheckOutRequest;
import com.example.orders.dto.CartResponse;
import com.example.orders.dto.OrderResponse;
import com.example.orders.dto.UpdateCartRequest;
import com.example.orders.service.OrderService;

import jakarta.validation.Valid;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;

import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;


import java.util.List;


@RestController
@RequestMapping("/api")
public class OrderController {

    private final OrderService orderService;


    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }


    @GetMapping("/cart")
    public CartResponse getCart(Authentication authentication) {
        return orderService.getCart((Jwt) authentication.getPrincipal());
    }


    @PostMapping("/cart")
    public void addToCart(@Valid @RequestBody CartRequest request, BindingResult bindingResult,
                          Authentication authentication) {
        if (bindingResult.hasErrors()) {
            System.out.println(bindingResult.getAllErrors());
        }
        orderService.addToCart((Jwt) authentication.getPrincipal(), request.productId(), request.quantity());
    }


    @PutMapping("/cart/{productId}")
    public void updateCart(@PathVariable Long productId, @Valid @RequestBody UpdateCartRequest request,
                           BindingResult bindingResult, Authentication authentication) {
        if (bindingResult.hasErrors()) {
            System.out.println(bindingResult.getAllErrors());
        }
        orderService.updateCartQuantity((Jwt) authentication.getPrincipal(), productId, request.quantity());
    }


    @DeleteMapping("/cart/{productId}")
    public void removeFromCart(@PathVariable Long productId, Authentication authentication) {
        orderService.removeFromCart((Jwt) authentication.getPrincipal(), productId);
    }


    @PostMapping("/checkout")
    public OrderResponse checkout(@Valid @RequestBody CheckOutRequest request, Authentication authentication) {
        return orderService.checkout((Jwt) authentication.getPrincipal(), request);
    }


    @GetMapping("/orders")
    public List<OrderResponse> getMyOrders(Authentication authentication) {
        return orderService.getMyOrders((Jwt) authentication.getPrincipal());
    }


    @GetMapping("/orders/{id}")
    public OrderResponse getMyOrder(@PathVariable Long id, Authentication authentication) {
        return orderService.getMyOrder((Jwt) authentication.getPrincipal(), id);
    }


    @GetMapping("/admin/orders")
    public List<OrderResponse> getAllOrders() {
        return orderService.getAllOrders();
    }


    public record CartRequest(Long productId, int quantity) {
    }
}