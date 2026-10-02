package com.example.Coffre_Fort_Backend.dto.response;
import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class UserResponse {
    private Long id;
    private String username;
    private String name;
    private String email;
    private String role;
    private boolean enabled;
    private LocalDateTime lastLoginAt;
    private LocalDateTime createdAt;
}
