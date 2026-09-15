package com.example.Coffre_Fort_Backend.service;

import com.example.Coffre_Fort_Backend.dto.response.SystemStatusResponse;
import com.example.Coffre_Fort_Backend.entity.SystemAlert;
import com.example.Coffre_Fort_Backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SystemService {

    private final SystemAlertRepository systemAlertRepository;
    private final UserRepository userRepository;
    private final DocumentRepository documentRepository;
    private final PatientRepository patientRepository;

    public SystemStatusResponse getStatus() {
        long usedBytes = documentRepository.sumFileSize();
        double usedMb = Math.round(usedBytes / 1024.0 / 1024.0 * 100) / 100.0;

        long usersActive = userRepository.countActiveUsers();
        long documentsTotal = documentRepository.count();
        long patientsActive = patientRepository.countAll();

        List<SystemAlert> alerts = systemAlertRepository.findTop20ByOrderByCreatedAtDesc();
        List<SystemStatusResponse.AlertDto> alertDtos = alerts.stream()
                .map(a -> SystemStatusResponse.AlertDto.builder()
                        .message(a.getMessage())
                        .severity(a.getSeverity().name())
                        .time(a.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return SystemStatusResponse.builder()
                .dbOk(true)
                .usedStorageMb(usedMb)
                .usersActive(usersActive)
                .documentsTotal(documentsTotal)
                .patientsActive(patientsActive)
                .alerts(alertDtos)
                .build();
    }
}
