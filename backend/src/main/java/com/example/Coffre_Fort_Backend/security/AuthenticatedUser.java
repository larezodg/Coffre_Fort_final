package com.example.Coffre_Fort_Backend.security;

import lombok.*;

@Data
@AllArgsConstructor
public class AuthenticatedUser {
    private Long id;
    private String username;
    private String role;
}
