package com.example.Coffre_Fort_Backend.controller;

import com.example.Coffre_Fort_Backend.dto.request.*;
import com.example.Coffre_Fort_Backend.dto.response.*;
import com.example.Coffre_Fort_Backend.security.AuthenticatedUser;
import com.example.Coffre_Fort_Backend.service.PatientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/patients")
@RequiredArgsConstructor
@Tag(name = "Utilisateurs", description = "Endpoints de gestion des utilisateurs")
public class PatientController {

    private final PatientService patientService;

    /** POST /patients/access — Accès par code (public) */
    @PostMapping("/access")
    @Operation(summary = "Obtenir un utilisateur par ID", description = "Renvoie les détails d'un utilisateur spécifique")
    public ResponseEntity<AuthResponse> accessByCode(@Valid @RequestBody AccessByCodeRequest req,
                                                      HttpServletRequest http) {
        return ResponseEntity.ok(patientService.accessByCode(req, getIp(http)));
    }

    /** GET /patients */
    @GetMapping
    public ResponseEntity<List<PatientResponse>> list(@AuthenticationPrincipal AuthenticatedUser user) {
        if ("ADMIN".equals(user.getRole())) {
            return ResponseEntity.ok(patientService.listAll());
        }
        return ResponseEntity.ok(patientService.listByDoctor(user.getId()));
    }

    /** GET /patients/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<PatientResponse> getById(@PathVariable Long id,
                                                    @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(patientService.getById(id, user.getRole(), user.getId()));
    }

    /** POST /patients */
    @PostMapping
    public ResponseEntity<PatientResponse> create(@Valid @RequestBody CreatePatientRequest req,
                                                   @AuthenticationPrincipal AuthenticatedUser user,
                                                   HttpServletRequest http) {
        return ResponseEntity.status(201).body(
                patientService.create(req, user.getId(), user.getUsername(), getIp(http)));
    }

    /** PUT /patients/{id} */
    @PutMapping("/{id}")
    public ResponseEntity<PatientResponse> update(@PathVariable Long id,
                                                   @Valid @RequestBody UpdatePatientRequest req,
                                                   @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(patientService.update(id, req, user.getRole(), user.getId()));
    }

    /** DELETE /patients/{id} */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id,
                                        @AuthenticationPrincipal AuthenticatedUser user,
                                        HttpServletRequest http) {
        patientService.delete(id, user.getRole(), user.getId(), user.getUsername(), getIp(http));
        return ResponseEntity.noContent().build();
    }

    private String getIp(HttpServletRequest req) {
        String fwd = req.getHeader("X-Forwarded-For");
        return fwd != null ? fwd.split(",")[0].trim() : req.getRemoteAddr();
    }
}
