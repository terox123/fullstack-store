package com.example.orders.service;


import com.example.orders.dto.CartItemResponse;
import com.example.orders.dto.CartResponse;
import com.example.orders.dto.CheckOutRequest;
import com.example.orders.dto.OrderItemResponse;
import com.example.orders.dto.OrderResponse;
import com.example.orders.metrics.OrderMetrics;
import com.example.orders.model.CartItemEntity;
import com.example.orders.model.OrderEntity;
import com.example.orders.model.OrderItemEntity;
import com.example.orders.model.OrderStatus;
import com.example.orders.model.PaymentMethod;
import com.example.orders.model.PaymentStatus;
import com.example.orders.repo.CartRepository;
import com.example.orders.repo.OrderRepository;


import org.springframework.http.HttpStatus;

import org.springframework.security.oauth2.jwt.Jwt;

import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

import org.springframework.web.server.ResponseStatusException;


import java.math.BigDecimal;

import java.time.LocalDateTime;
import java.util.List;


@Service
public class OrderService {

    private final OrderMetrics orderMetrics;

    private static final BigDecimal FREE_DELIVERY_LIMIT =
            new BigDecimal("1000.00");


    private static final BigDecimal DELIVERY_PRICE =
            new BigDecimal("9.99");


    private final OrderRepository orderRepository;

    private final CartRepository cartRepository;

    private final EmailSecurity emailSecurity;

    private final ProductClient productClient;

    private final ServiceTokenProvider serviceTokenProvider;


    public OrderService(
            OrderRepository orderRepository,
            CartRepository cartRepository,
            EmailSecurity emailSecurity,
            ProductClient productClient,
            ServiceTokenProvider serviceTokenProvider,
            OrderMetrics orderMetrics
    ) {

        this.orderRepository = orderRepository;

        this.cartRepository = cartRepository;

        this.emailSecurity = emailSecurity;

        this.productClient = productClient;

        this.serviceTokenProvider =
                serviceTokenProvider;

        this.orderMetrics = orderMetrics;
    }


    public CartResponse getCart(
            Jwt jwt
    ) {

        String email =
                emailSecurity.verifiedEmail(jwt);


        List<CartItemEntity> items =
                cartRepository
                        .findByOwnerEmailOrderByIdAsc(
                                email
                        );


        String serviceToken =
                serviceTokenProvider.getToken();


        List<CartItemResponse> responses =
                items.stream()
                        .map(item ->
                                toCartItemResponse(
                                        item,
                                        serviceToken
                                )
                        )
                        .toList();


        BigDecimal subtotal =
                responses.stream()
                        .map(CartItemResponse::totalPrice)
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );


        BigDecimal delivery =
                calculateDelivery(
                        subtotal
                );


        BigDecimal total =
                subtotal.add(delivery);


        return new CartResponse(
                responses,
                subtotal,
                delivery,
                total
        );
    }


    @Transactional
    public void addToCart(
            Jwt jwt,
            Long productId,
            int quantity
    ) {

        String email =
                emailSecurity.verifiedEmail(jwt);


        if (quantity < 1) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Quantity must be positive"
            );
        }


        String serviceToken =
                serviceTokenProvider.getToken();


        ProductClient.ProductData product =
                productClient.getProduct(
                        productId,
                        serviceToken
                );


        if (
                product.stock() == null ||
                        product.stock() <= 0
        ) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Product is out of stock"
            );
        }


        CartItemEntity item =
                cartRepository
                        .findByOwnerEmailAndProductId(
                                email,
                                productId
                        )
                        .orElseGet(() ->
                                new CartItemEntity(
                                        email,
                                        productId,
                                        0
                                )
                        );


        int newQuantity =
                item.getQuantity() + quantity;


        if (
                product.stock() < newQuantity
        ) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Not enough stock"
            );
        }


        item.addQuantity(quantity);

        cartRepository.save(item);
        orderMetrics.cartAdded();
    }


    @Transactional
    public void updateCartQuantity(
            Jwt jwt,
            Long productId,
            int quantity
    ) {

        String email =
                emailSecurity.verifiedEmail(jwt);


        CartItemEntity item =
                cartRepository
                        .findByOwnerEmailAndProductId(
                                email,
                                productId
                        )
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Cart item not found"
                                )
                        );


        if (quantity < 1) {

            cartRepository.delete(item);

            return;
        }


        String serviceToken =
                serviceTokenProvider.getToken();


        ProductClient.ProductData product =
                productClient.getProduct(
                        productId,
                        serviceToken
                );


        if (
                product.stock() == null ||
                        product.stock() < quantity
        ) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Not enough stock"
            );
        }


        item.updateQuantity(quantity);

        cartRepository.save(item);

    }


    @Transactional
    public void removeFromCart(
            Jwt jwt,
            Long productId
    ) {

        String email =
                emailSecurity.verifiedEmail(jwt);


        cartRepository
                .findByOwnerEmailAndProductId(
                        email,
                        productId
                )
                .ifPresent(
                        cartRepository::delete

                );
        orderMetrics.cartRemoved();
    }


    @Transactional
    public OrderResponse checkout(
            Jwt jwt,
            CheckOutRequest request
    ) {

        String email =
                emailSecurity.verifiedEmail(jwt);


        validateCheckout(request);


        List<CartItemEntity> cartItems =
                cartRepository
                        .findByOwnerEmailOrderByIdAsc(
                                email
                        );


        if (cartItems.isEmpty()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Cart is empty"
            );
        }


        String serviceToken =
                serviceTokenProvider.getToken();


        OrderEntity order =
                new OrderEntity();


        order.setOwnerEmail(email);

        order.setStatus(
                OrderStatus.CREATED
        );

        order.setPaymentMethod(
                request.paymentMethod()
        );

        order.setPaymentStatus(
                resolvePaymentStatus(
                        request.paymentMethod()
                )
        );


        order.setFirstName(
                request.firstName()
        );

        order.setLastName(
                request.lastName()
        );

        order.setPhone(
                request.phone()
        );

        order.setCountry(
                request.country()
        );

        order.setCity(
                request.city()
        );

        order.setAddress(
                request.address()
        );

        order.setPostalCode(
                request.postalCode()
        );

        order.setApartment(
                request.apartment()
        );


        BigDecimal subtotal =
                BigDecimal.ZERO;


        for (
                CartItemEntity cartItem :
                cartItems
        ) {

            ProductClient.ProductData product =
                    productClient.getProduct(
                            cartItem.getProductId(),
                            serviceToken
                    );


            if (
                    product.stock() == null ||
                            product.stock()
                                    < cartItem.getQuantity()
            ) {

                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Not enough stock for "
                                + product.name()
                );
            }


            BigDecimal itemTotal =
                    product.price()
                            .multiply(
                                    BigDecimal.valueOf(
                                            cartItem.getQuantity()
                                    )
                            );


            subtotal =
                    subtotal.add(itemTotal);


            OrderItemEntity orderItem =
                    new OrderItemEntity(
                            product.id(),
                            product.name(),
                            product.imageUrl(),
                            product.price(),
                            cartItem.getQuantity()
                    );


            order.addItem(orderItem);


            productClient.decreaseStock(
                    product.id(),
                    cartItem.getQuantity(),
                    serviceToken
            );
        }


        BigDecimal delivery =
                calculateDelivery(subtotal);


        BigDecimal total =
                subtotal.add(delivery);


        order.setSubtotal(subtotal);

        order.setDeliveryPrice(delivery);

        order.setTotalPrice(total);


        OrderEntity saved =
                orderRepository.save(order);

        orderMetrics.orderCreated();
        orderMetrics.checkoutSuccess();

        cartRepository.deleteByOwnerEmail(
                email
        );


        return toOrderResponse(saved);
    }


    public List<OrderResponse> getMyOrders(
            Jwt jwt
    ) {

        String email =
                emailSecurity.verifiedEmail(jwt);


        return orderRepository
                .findByOwnerEmailOrderByCreatedAtDesc(
                        email
                )
                .stream()
                .map(this::toOrderResponse)
                .toList();
    }


    public OrderResponse getMyOrder(
            Jwt jwt,
            Long id
    ) {

        String email =
                emailSecurity.verifiedEmail(jwt);


        OrderEntity order =
                orderRepository
                        .findByIdAndOwnerEmail(
                                id,
                                email
                        )
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Order not found"
                                )
                        );


        return toOrderResponse(order);
    }


    public List<OrderResponse> getAllOrders() {

        return orderRepository
                .findOrderEntityByCreatedAt(LocalDateTime.now())
                .stream()
                .map(this::toOrderResponse)
                .toList();
    }


    private CartItemResponse toCartItemResponse(
            CartItemEntity item,
            String serviceToken
    ) {

        ProductClient.ProductData product =
                productClient.getProduct(
                        item.getProductId(),
                        serviceToken
                );


        BigDecimal total =
                product.price()
                        .multiply(
                                BigDecimal.valueOf(
                                        item.getQuantity()
                                )
                        );


        return new CartItemResponse(
                item.getId(),
                product.id(),
                product.name(),
                product.imageUrl(),
                product.price(),
                item.getQuantity(),
                total
        );
    }


    private OrderResponse toOrderResponse(
            OrderEntity order
    ) {

        List<OrderItemResponse> items =
                order.getItems()
                        .stream()
                        .map(item ->
                                new OrderItemResponse(
                                        item.getProductId(),
                                        item.getProductName(),
                                        item.getImageUrl(),
                                        item.getUnitPrice(),
                                        item.getQuantity(),
                                        item.getTotalPrice()
                                )
                        )
                        .toList();


        return new OrderResponse(
                order.getId(),
                order.getOwnerEmail(),
                order.getStatus(),
                order.getPaymentMethod(),
                order.getPaymentStatus(),
                order.getFirstName(),
                order.getLastName(),
                order.getPhone(),
                order.getCountry(),
                order.getCity(),
                order.getAddress(),
                order.getPostalCode(),
                order.getApartment(),
                order.getSubtotal(),
                order.getDeliveryPrice(),
                order.getTotalPrice(),
                order.getCreatedAt(),
                items
        );
    }


    private BigDecimal calculateDelivery(
            BigDecimal subtotal
    ) {

        if (
                subtotal.compareTo(
                        FREE_DELIVERY_LIMIT
                ) >= 0
        ) {

            return BigDecimal.ZERO;
        }


        return DELIVERY_PRICE;
    }


    private PaymentStatus resolvePaymentStatus(
            PaymentMethod method
    ) {

        return switch (method) {

            case CARD, SBP ->
                    PaymentStatus.PAID;

            case AT_SHOP ->
                    PaymentStatus.PENDING;
        };
    }


    private void validateCheckout(
            CheckOutRequest request
    ) {

        if (
                isBlank(request.firstName()) ||
                        isBlank(request.lastName()) ||
                        isBlank(request.phone()) ||
                        isBlank(request.country()) ||
                        isBlank(request.city()) ||
                        isBlank(request.address()) ||
                        isBlank(request.postalCode()) ||
                        request.paymentMethod() == null
        ) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "All required checkout fields must be filled"
            );
        }
    }


    private boolean isBlank(
            String value
    ) {

        return value == null ||
                value.isBlank();
    }
}