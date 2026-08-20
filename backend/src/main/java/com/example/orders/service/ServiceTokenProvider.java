package com.example.orders.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

@Component
public class ServiceTokenProvider {

    private final RestClient client;
    private final String clientId;
    private final String clientSecret;

    public ServiceTokenProvider(
            @Value("${keycloak.token-url}") String tokenUrl,
            @Value("${service.client-id}") String clientId,
            @Value("${service.client-secret}") String clientSecret) {
        this.client = RestClient.builder().baseUrl(tokenUrl).build();
        this.clientId = clientId;
        this.clientSecret = clientSecret;
    }

    public String getToken() {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", "client_credentials");
        form.add("client_id", clientId);
        form.add("client_secret", clientSecret);

        TokenResponse response = client.post()
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(form)
                .retrieve()
                .body(TokenResponse.class);

        if (response == null || response.access_token() == null) {
            throw new IllegalStateException("Could not obtain service token");
        }

        return response.access_token();
    }

    private record TokenResponse(String access_token) {
    }
}
