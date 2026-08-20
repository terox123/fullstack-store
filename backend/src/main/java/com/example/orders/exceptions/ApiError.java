package com.example.orders.exceptions;


import java.time.Instant;

import java.util.List;


public record ApiError(Instant timestamp, int status, String error, String message,
                       String path, List<FieldErrorResponse> fields) {


    public record FieldErrorResponse(String field, String message) {
    }
}