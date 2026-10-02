package com.example.Coffre_Fort_Backend.dto.request;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class UpdateProfileRequest {
    @NotBlank @Size(max = 150) public String name;
    @NotBlank @Email @Size(max = 255) public String email;
}
