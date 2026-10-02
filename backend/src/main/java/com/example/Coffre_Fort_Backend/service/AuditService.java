package com.example.Coffre_Fort_Backend.service;

import com.example.Coffre_Fort_Backend.entity.AuditLog;
import com.example.Coffre_Fort_Backend.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    @Async
    public void log(Long userId, String username, String action, String resource,
                    String ip, AuditLog.Status status) {
        AuditLog log = AuditLog.builder()
                .userId(userId)
                .username(username)
                .action(action)
                .resource(resource)
                .ipAddress(ip)
                .status(status)
                .build();
        auditLogRepository.save(log);
    }

    @Async
    public void logSuccess(Long userId, String username, String action, String resource, String ip) {
        log(userId, username, action, resource, ip, AuditLog.Status.SUCCESS);
    }

    @Async
    public void logFailure(String username, String action, String resource, String ip) {
        log(null, username, action, resource, ip, AuditLog.Status.FAILURE);
    }
}
