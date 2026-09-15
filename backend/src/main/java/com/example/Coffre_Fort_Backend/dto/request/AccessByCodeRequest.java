package com.example.Coffre_Fort_Backend.dto.request;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AccessByCodeRequest {
    @NotBlank public String code;
}
