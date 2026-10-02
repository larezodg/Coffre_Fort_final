package com.example.Coffre_Fort_Backend.service;

import com.example.Coffre_Fort_Backend.dto.response.DashboardResponse;
import com.example.Coffre_Fort_Backend.entity.AuditLog;
import com.example.Coffre_Fort_Backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final DocumentRepository documentRepository;
    private final PatientRepository patientRepository;
    private final SecurityEventRepository securityEventRepository;
    private final AuditLogRepository auditLogRepository;
    private final DocumentRepository docRepository;
    private final DocumentViewRepository documentViewRepository;

    public DashboardResponse getAdminSummary() {
        long userCount = userRepository.countActiveUsers();
        long documentCount = documentRepository.count();
        long securityAlerts = securityEventRepository
                .countHighSeveritySince(LocalDateTime.now().minusHours(24));

        List<AuditLog> recentAudit = auditLogRepository.findTop5ByOrderByCreatedAtDesc();
        List<DashboardResponse.RecentActivity> activities = recentAudit.stream()
                .map(a -> DashboardResponse.RecentActivity.builder()
                        .action(a.getAction())
                        .user(a.getUsername())
                        .time(a.getCreatedAt())
                        .type("audit")
                        .build())
                .collect(Collectors.toList());

        return DashboardResponse.builder()
                .userCount(userCount)
                .documentCount(documentCount)
                .securityAlerts(securityAlerts)
                .recentActivity(activities)
                .build();
    }

    public DashboardResponse getDoctorSummary(Long doctorId) {
        long patientCount = patientRepository.countActiveByDoctorId(doctorId);
        long docsSent = documentRepository.countByDoctorId(doctorId);
        long pending = documentViewRepository.countPendingForDoctor(doctorId);
        long viewed = documentViewRepository.countViewedByDoctorPatients(doctorId);

        return DashboardResponse.builder()
                .doctorPatientCount(patientCount)
                .doctorDocumentsSent(docsSent)
                .doctorPending(pending)
                .doctorDocumentsViewed(viewed)
                .recentActivity(List.of())
                .build();
    }

    public DashboardResponse getPatientSummary(Long userId) {
        long docCount = documentViewRepository.countDocumentsForPatient(userId);
        long unread = documentViewRepository.countUnreadForPatient(userId);

        return DashboardResponse.builder()
                .patientDocumentCount(docCount)
                .patientUnread(unread)
                .recentActivity(List.of())
                .build();
    }
}
