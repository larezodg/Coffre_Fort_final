package com.example.Coffre_Fort_Backend.dto.request;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CreateUserRequest {
    @NotBlank @Size(max = 50) public String username;
    @NotBlank @Size(min = 8) public String password;
    @NotBlank @Size(max = 150) public String name;
    @NotBlank @Email @Size(max = 255) public String email;
    @NotBlank public String role;
}
