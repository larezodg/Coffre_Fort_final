package com.example.Coffre_Fort_Backend.dto.response;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class SystemStatusResponse {
    private boolean dbOk;
    private double usedStorageMb;
    private long usersActive;
    private long documentsTotal;
    private long patientsActive;
    private List<AlertDto> alerts;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class AlertDto {
        private String message;
        private String severity;
        private LocalDateTime time;
    }
}
