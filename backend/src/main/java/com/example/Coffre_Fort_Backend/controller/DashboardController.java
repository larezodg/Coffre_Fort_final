package com.example.Coffre_Fort_Backend.controller;

import com.example.Coffre_Fort_Backend.dto.response.DashboardResponse;
import com.example.Coffre_Fort_Backend.security.AuthenticatedUser;
import com.example.Coffre_Fort_Backend.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    /** GET /dashboard/summary */
    @GetMapping("/summary")
    public ResponseEntity<DashboardResponse> summary(@AuthenticationPrincipal AuthenticatedUser user) {
        return switch (user.getRole()) {
            case "ADMIN" -> ResponseEntity.ok(dashboardService.getAdminSummary());
            case "DOCTOR" -> ResponseEntity.ok(dashboardService.getDoctorSummary(user.getId()));
            default -> ResponseEntity.ok(dashboardService.getPatientSummary(user.getId()));
        };
    }
}
