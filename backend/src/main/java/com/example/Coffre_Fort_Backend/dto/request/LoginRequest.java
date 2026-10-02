package com.example.Coffre_Fort_Backend.dto.request;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank public String username;
    @NotBlank public String password;
}
