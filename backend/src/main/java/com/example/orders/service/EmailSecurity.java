package com.example.orders.service;

import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

@Component
public class EmailSecurity {

    public String verifiedEmail(Jwt jwt) {
        String email = jwt.getClaimAsString("email");
        Boolean verified = jwt.getClaim("email_verified");

        if (email == null || !Boolean.TRUE.equals(verified)) {
            throw new IllegalStateException("A verified email is required");
        }

        return email;
    }
}
