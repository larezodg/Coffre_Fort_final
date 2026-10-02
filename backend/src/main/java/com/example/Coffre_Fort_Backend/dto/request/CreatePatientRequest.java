package com.example.Coffre_Fort_Backend.dto.request;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;

@Data
public class CreatePatientRequest {
    @NotBlank @Size(max = 150) public String name;
    @NotNull public LocalDate dateOfBirth;
    @Email @Size(max = 255) public String email;
    @Size(max = 30) public String phone;
    public Long doctorId;
    public Long userId;
}
