package com.example.Coffre_Fort_Backend.controller;

import com.example.Coffre_Fort_Backend.dto.response.*;
import com.example.Coffre_Fort_Backend.entity.AuditLog;
import com.example.Coffre_Fort_Backend.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/audit")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AuditController {

    private final AuditLogRepository auditLogRepository;

    /** GET /audit */
    @GetMapping
    public ResponseEntity<PageResponse<AuditLogResponse>> list(
            @RequestParam(required = false) String user,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<AuditLog> result = auditLogRepository.findFiltered(
                user, action, from, to, PageRequest.of(page, size));

        List<AuditLogResponse> content = result.getContent().stream()
                .map(a -> AuditLogResponse.builder()
                        .id(a.getId())
                        .userId(a.getUserId())
                        .user(a.getUsername())
                        .action(a.getAction())
                        .resource(a.getResource())
                        .ip(a.getIpAddress())
                        .status(a.getStatus().name())
                        .date(a.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(PageResponse.<AuditLogResponse>builder()
                .content(content)
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .page(page)
                .size(size)
                .build());
    }
}
