package com.example.Coffre_Fort_Backend.service;

import com.example.Coffre_Fort_Backend.dto.request.CreateSecurityEventRequest;
import com.example.Coffre_Fort_Backend.dto.response.SecurityStatsResponse;
import com.example.Coffre_Fort_Backend.entity.SecurityEvent;
import com.example.Coffre_Fort_Backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SecurityService {

    private final SecurityEventRepository securityEventRepository;
    private final DocumentRepository documentRepository;

    public SecurityStatsResponse getStats() {
        List<SecurityEvent> events = securityEventRepository.findTop100ByOrderByCreatedAtDesc();
        long encryptedCount = documentRepository.countEncrypted();
        long threats24h = securityEventRepository.countSince(LocalDateTime.now().minusHours(24));

        List<SecurityStatsResponse.SecurityEventDto> dtos = events.stream()
                .map(e -> SecurityStatsResponse.SecurityEventDto.builder()
                        .id(e.getId())
                        .event(e.getEvent())
                        .source(e.getSource())
                        .severity(e.getSeverity().name())
                        .action(e.getActionTaken())
                        .date(e.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return SecurityStatsResponse.builder()
                .events(dtos)
                .encryptedCount(encryptedCount)
                .threats24h(threats24h)
                .build();
    }

    public SecurityEvent createEvent(CreateSecurityEventRequest req) {
        SecurityEvent event = SecurityEvent.builder()
                .event(req.getEvent())
                .source(req.getSource())
                .severity(SecurityEvent.Severity.valueOf(req.getSeverity()))
                .actionTaken(req.getActionTaken())
                .build();
        return securityEventRepository.save(event);
    }
}
