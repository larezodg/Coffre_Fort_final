package com.example.Coffre_Fort_Backend.dto.request;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class UpdateUserRequest {
    @Size(max = 150) public String name;
    @Email @Size(max = 255) public String email;
    public String role;
    public Boolean enabled;
    public String password;
}
