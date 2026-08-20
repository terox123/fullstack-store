package com.example.orders.exceptions;



import org.slf4j.Logger;

import org.slf4j.LoggerFactory;


import org.springframework.http.HttpStatus;

import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.MethodArgumentNotValidException;

import org.springframework.web.bind.annotation.ExceptionHandler;

import org.springframework.web.bind.annotation.RestControllerAdvice;

import org.springframework.web.server.ResponseStatusException;


import jakarta.servlet.http.HttpServletRequest;


import java.time.Instant;

import java.util.List;


@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log =
            LoggerFactory.getLogger(
                    GlobalExceptionHandler.class
            );


    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(
            MethodArgumentNotValidException exception,
            HttpServletRequest request
    ) {

        List<ApiError.FieldErrorResponse> fields =
                exception.getBindingResult()
                        .getFieldErrors()
                        .stream()
                        .map(error ->
                                new ApiError.FieldErrorResponse(
                                        error.getField(),
                                        error.getDefaultMessage()
                                )
                        )
                        .toList();


        ApiError response =
                new ApiError(
                        Instant.now(),
                        HttpStatus.BAD_REQUEST.value(),
                        "Validation failed",
                        "Проверьте введённые данные",
                        request.getRequestURI(),
                        fields
                );


        return ResponseEntity
                .badRequest()
                .body(response);
    }


    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiError> handleResponseStatus(
            ResponseStatusException exception,
            HttpServletRequest request
    ) {

        int status =
                exception.getStatusCode().value();


        ApiError response =
                new ApiError(
                        Instant.now(),
                        status,
                        exception.getStatusCode().toString(),
                        exception.getReason() != null
                                ? exception.getReason()
                                : "Request failed",
                        request.getRequestURI(),
                        List.of()
                );


        return ResponseEntity
                .status(status)
                .body(response);
    }


    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleUnexpected(
            Exception exception,
            HttpServletRequest request
    ) {

        log.error(
                "Unexpected error while processing {}",
                request.getRequestURI(),
                exception
        );


        ApiError response =
                new ApiError(
                        Instant.now(),
                        HttpStatus.INTERNAL_SERVER_ERROR.value(),
                        "Internal Server Error",
                        "Произошла внутренняя ошибка сервера",
                        request.getRequestURI(),
                        List.of()
                );


        return ResponseEntity
                .status(
                        HttpStatus.INTERNAL_SERVER_ERROR
                )
                .body(response);
    }
}