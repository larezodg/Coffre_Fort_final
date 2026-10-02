package com.example.Coffre_Fort_Backend.dto.response;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DashboardResponse {
    private Long userCount;
    private Long documentCount;
    private Long securityAlerts;
    private Long doctorPatientCount;
    private Long doctorDocumentsSent;
    private Long doctorPending;
    private Long doctorDocumentsViewed;
    private Long patientDocumentCount;
    private Long patientUnread;
    private List<RecentActivity> recentActivity;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class RecentActivity {
        private String action;
        private String user;
        private LocalDateTime time;
        private String type;
    }
}
