package com.example.Coffre_Fort_Backend.service;

import com.example.Coffre_Fort_Backend.model.AuditLog;
import com.example.Coffre_Fort_Backend.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    @Async
    public void log(Long userId, String username, String action, String resource,
                    String ip, AuditLog.Status status) {
        try {
            // Tronquer les champs pour éviter tout plantage "Data too long"
            String safeUsername = username != null && username.length() > 100 
                    ? username.substring(0, 100) : username;
            String safeIp = ip != null && ip.length() > 45 
                    ? ip.substring(0, 45) : ip;
            String safeResource = resource != null && resource.length() > 500 
                    ? resource.substring(0, 500) : resource;

            AuditLog logEntity = AuditLog.builder()
                    .userId(userId)
                    .username(safeUsername)
                    .action(action)
                    .resource(safeResource)
                    .ipAddress(safeIp)
                    .status(status)
                    .build();

            auditLogRepository.save(logEntity);
        } catch (Exception e) {
            // Loguer l'erreur sans faire échouer la requête HTTP globale
            log.error("Échec de l'enregistrement du log d'audit pour l'action {}: {}", action, e.getMessage());
        }
    }

    public void logSuccess(Long userId, String username, String action, String resource, String ip) {
        log(userId, username, action, resource, ip, AuditLog.Status.SUCCESS);
    }

    public void logFailure(String username, String action, String resource, String ip) {
        log(null, username, action, resource, ip, AuditLog.Status.FAILURE);
    }
}
