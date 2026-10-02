package com.example.Coffre_Fort_Backend.dto.response;
import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DocumentResponse {
    private Long id;
    private String name;
    private String patientName;
    private String type;
    private LocalDateTime date;
    private Long size;
    private boolean encrypted;
    private String doctorName;
    private String uploadedBy;
}
