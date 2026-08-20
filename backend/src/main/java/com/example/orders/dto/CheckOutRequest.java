package com.example.orders.dto;

import com.example.orders.model.PaymentMethod;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CheckOutRequest (
        @NotBlank(message = "Имя обязательно")
        @Size(min = 2, max = 50)
        String firstName,

        @NotBlank(message = "Фамилия обязательна")
        @Size(min = 2, max = 50)
        String lastName,

        @NotBlank(message = "Телефон обязателен")
        @Pattern(regexp = "^\\+?[0-9 ()-]{7,20}$")
        String phone,


        @NotBlank(message = "Страна обязательна")
        @Size(min = 2, max = 80, message = "Некорректная страна")
        String country,


        @NotBlank(message = "Город обязателен")
        @Size(min = 2, max = 80, message = "Некорректный город")
        String city,

        @NotBlank(message = "Адрес обязателен")
        @Size(min = 3, max = 200, message = "Адрес должен содержать от 3 до 200 символов")
        String address,


        @NotBlank(message = "Почтовый индекс обязателен")
        @Pattern(regexp = "^[A-Za-z0-9 -]{3,10}$", message = "Некорректный почтовый индекс")
        String postalCode,

        @Size(max = 20, message = "Номер квартиры слишком длинный")
        String apartment,

        @NotNull(message = "Необходимо выбрать способ оплаты")
        PaymentMethod paymentMethod
) {}
