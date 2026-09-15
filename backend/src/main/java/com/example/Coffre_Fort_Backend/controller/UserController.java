package com.example.Coffre_Fort_Backend.controller;

import com.example.Coffre_Fort_Backend.dto.request.*;
import com.example.Coffre_Fort_Backend.dto.response.UserResponse;
import com.example.Coffre_Fort_Backend.security.AuthenticatedUser;
import com.example.Coffre_Fort_Backend.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /** GET /users */
    @GetMapping
    public ResponseEntity<List<UserResponse>> listAll() {
        return ResponseEntity.ok(userService.listAll());
    }

    /** GET /users/doctors — pour le dropdown patients */
    @GetMapping("/doctors")
    public ResponseEntity<List<UserResponse>> listDoctors() {
        return ResponseEntity.ok(userService.listDoctors());
    }

    /** GET /users/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getById(id));
    }

    /** POST /users */
    @PostMapping
    public ResponseEntity<UserResponse> create(@Valid @RequestBody CreateUserRequest req,
                                                @AuthenticationPrincipal AuthenticatedUser admin,
                                                HttpServletRequest http) {
        return ResponseEntity.status(201).body(
                userService.create(req, admin.getId(), admin.getUsername(), getIp(http)));
    }

    /** PUT /users/{id} */
    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> update(@PathVariable Long id,
                                                @Valid @RequestBody UpdateUserRequest req) {
        return ResponseEntity.ok(userService.update(id, req));
    }

    /** DELETE /users/{id} — soft delete (désactivation) */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivate(@PathVariable Long id,
                                            @AuthenticationPrincipal AuthenticatedUser admin,
                                            HttpServletRequest http) {
        userService.deactivate(id, admin.getId(), admin.getUsername(), getIp(http));
        return ResponseEntity.noContent().build();
    }

    /** DELETE /users/{id}/hard — suppression physique (attention FK) */
    @DeleteMapping("/{id}/hard")
    public ResponseEntity<Void> hardDelete(@PathVariable Long id) {
        userService.hardDelete(id);
        return ResponseEntity.noContent().build();
    }

    private String getIp(HttpServletRequest req) {
        String fwd = req.getHeader("X-Forwarded-For");
        return fwd != null ? fwd.split(",")[0].trim() : req.getRemoteAddr();
    }
}
