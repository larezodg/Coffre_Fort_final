package com.example.Coffre_Fort_Backend.dto.response;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PatientResponse {
    private Long id;
    private Long userId;
    private Long doctorId;
    private String name;
    private LocalDate dateOfBirth;
    private String email;
    private String phone;
    private String code;
    private String status;
    private LocalDateTime lastVisit;
    private String doctorName;
    private long documentCount;
    private LocalDateTime createdAt;
}
