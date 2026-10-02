package com.example.Coffre_Fort_Backend.controller;

import com.example.Coffre_Fort_Backend.dto.request.*;
import com.example.Coffre_Fort_Backend.dto.response.*;
import com.example.Coffre_Fort_Backend.security.AuthenticatedUser;
import com.example.Coffre_Fort_Backend.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /** POST /auth/login */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req,
                                               HttpServletRequest http) {
        return ResponseEntity.ok(authService.login(req, getIp(http)));
    }

    /** GET /auth/me */
    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(@AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(authService.getMe(user.getId()));
    }

    /** PATCH /auth/profile */
    @PatchMapping("/profile")
    public ResponseEntity<UserResponse> updateProfile(
            @AuthenticationPrincipal AuthenticatedUser user,
            @Valid @RequestBody UpdateProfileRequest req,
            HttpServletRequest http) {
        return ResponseEntity.ok(
                authService.updateProfile(user.getId(), user.getUsername(), req, getIp(http)));
    }

    /** POST /auth/password */
    @PostMapping("/password")
    public ResponseEntity<Void> changePassword(
            @AuthenticationPrincipal AuthenticatedUser user,
            @Valid @RequestBody ChangePasswordRequest req,
            HttpServletRequest http) {
        authService.changePassword(user.getId(), user.getUsername(), req, getIp(http));
        return ResponseEntity.noContent().build();
    }

    /** POST /auth/logout */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@AuthenticationPrincipal AuthenticatedUser user,
                                        HttpServletRequest http) {
        authService.logout(user.getId(), user.getUsername(), getIp(http));
        return ResponseEntity.noContent().build();
    }

    private String getIp(HttpServletRequest req) {
        String forwarded = req.getHeader("X-Forwarded-For");
        return (forwarded != null) ? forwarded.split(",")[0].trim() : req.getRemoteAddr();
    }
}
