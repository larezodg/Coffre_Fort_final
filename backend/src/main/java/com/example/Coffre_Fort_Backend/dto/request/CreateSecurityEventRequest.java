package com.example.Coffre_Fort_Backend.dto.request;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateSecurityEventRequest {
    @NotBlank public String event;
    public String source;
    @NotBlank public String severity;
    public String actionTaken;
}
