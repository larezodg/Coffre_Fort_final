package com.example.Coffre_Fort_Backend.controller;

import com.example.Coffre_Fort_Backend.dto.response.SystemStatusResponse;
import com.example.Coffre_Fort_Backend.service.SystemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/system")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class SystemController {

    private final SystemService systemService;

    /** GET /system/status */
    @GetMapping("/status")
    public ResponseEntity<SystemStatusResponse> getStatus() {
        return ResponseEntity.ok(systemService.getStatus());
    }

    /** GET /system/alerts */
    @GetMapping("/alerts")
    public ResponseEntity<SystemStatusResponse> getAlerts() {
        // Réutilise le même objet, le frontend lit alerts[]
        return ResponseEntity.ok(systemService.getStatus());
    }
}
