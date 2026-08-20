package com.example.orders.metrics;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.stereotype.Component;

@Component
public class OrderMetrics {

    private final Counter ordersCreated;
    private final Counter checkoutSuccess;
    private final Counter checkoutFailed;
    private final Counter cartAdditions;
    private final Counter cartRemovals;

    public OrderMetrics(MeterRegistry meterRegistry){
        ordersCreated = Counter.builder("orders_created_total")
                .description("Total number of created orders")
                .register(meterRegistry);
        checkoutSuccess =
                Counter.builder(
                                "checkout_success_total"
                        )
                        .description(
                                "Successful checkouts"
                        )
                        .register(meterRegistry);


        checkoutFailed =
                Counter.builder(
                                "checkout_failed_total"
                        )
                        .description(
                                "Failed checkouts"
                        )
                        .register(meterRegistry);


        cartAdditions =
                Counter.builder(
                                "cart_additions_total"
                        )
                        .description(
                                "Items added to cart"
                        )
                        .register(meterRegistry);


        cartRemovals =
                Counter.builder(
                                "cart_removals_total"
                        )
                        .description(
                                "Items removed from cart"
                        )
                        .register(meterRegistry);
    }


    public void orderCreated() {

        ordersCreated.increment();
    }


    public void checkoutSuccess() {

        checkoutSuccess.increment();
    }


    public void checkoutFailed() {

        checkoutFailed.increment();
    }


    public void cartAdded() {

        cartAdditions.increment();
    }


    public void cartRemoved() {

        cartRemovals.increment();
    }


    }



