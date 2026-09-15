package com.example.Coffre_Fort_Backend.dto.response;
import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AuditLogResponse {
    private Long id;
    private Long userId;
    private String user;
    private String action;
    private String resource;
    private String ip;
    private String status;
    private LocalDateTime date;
}
