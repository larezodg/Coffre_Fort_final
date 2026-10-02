package com.example.Coffre_Fort_Backend.dto.response;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class SecurityStatsResponse {
    private List<SecurityEventDto> events;
    private Long encryptedCount;
    private Long threats24h;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class SecurityEventDto {
        private Long id;
        private String event;
        private String source;
        private String severity;
        private String action;
        private LocalDateTime date;
    }
}
