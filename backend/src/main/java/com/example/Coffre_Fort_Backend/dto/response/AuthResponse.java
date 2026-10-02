package com.example.Coffre_Fort_Backend.dto.response;
import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AuthResponse {
    private String token;
    private String type = "Bearer";
    private UserResponse user;
}
