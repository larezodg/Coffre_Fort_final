package com.example.Coffre_Fort_Backend.dto.request;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ChangePasswordRequest {
    @NotBlank public String currentPassword;
    @NotBlank @Size(min = 8) public String newPassword;
}
