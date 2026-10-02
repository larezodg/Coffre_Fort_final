package com.example.Coffre_Fort_Backend.controller;

import com.example.Coffre_Fort_Backend.dto.request.CreateSecurityEventRequest;
import com.example.Coffre_Fort_Backend.dto.response.SecurityStatsResponse;
import com.example.Coffre_Fort_Backend.service.SecurityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/security")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class SecurityController {

    private final SecurityService securityService;

    /** GET /security/events */
    @GetMapping("/events")
    public ResponseEntity<SecurityStatsResponse> getStats() {
        return ResponseEntity.ok(securityService.getStats());
    }

    /** POST /security/events — insérer un événement de sécurité */
    @PostMapping("/events")
    public ResponseEntity<Void> createEvent(@Valid @RequestBody CreateSecurityEventRequest req) {
        securityService.createEvent(req);
        return ResponseEntity.status(201).build();
    }
}
