package com.example.Coffre_Fort_Backend.service;

import com.example.Coffre_Fort_Backend.dto.request.*;
import com.example.Coffre_Fort_Backend.dto.response.UserResponse;
import com.example.Coffre_Fort_Backend.entity.User;
import com.example.Coffre_Fort_Backend.exception.*;
import com.example.Coffre_Fort_Backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    public List<UserResponse> listAll() {
        return userRepository.findAllByOrderByName().stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public List<UserResponse> listDoctors() {
        return userRepository.findByRoleAndEnabledTrueOrderByName(User.Role.DOCTOR).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public UserResponse getById(Long userId) {
        return userRepository.findById(userId)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
    }

    @Transactional
    public UserResponse create(CreateUserRequest req, Long adminId, String adminUsername, String ip) {
        long count = userRepository.countByUsernameOrEmail(req.getUsername(), req.getEmail());
        if (count > 0) throw new ConflictException("Username ou email déjà utilisé");

        User user = User.builder()
                .username(req.getUsername())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .name(req.getName())
                .email(req.getEmail())
                .role(User.Role.valueOf(req.getRole().toUpperCase()))
                .enabled(true)
                .build();
        user = userRepository.save(user);

        auditService.logSuccess(adminId, adminUsername, "USER_CREATE", "user:" + user.getId(), ip);
        return toResponse(user);
    }

    @Transactional
    public UserResponse update(Long userId, UpdateUserRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));

        if (req.getName() != null) user.setName(req.getName());
        if (req.getEmail() != null) user.setEmail(req.getEmail());
        if (req.getRole() != null) user.setRole(User.Role.valueOf(req.getRole()));
        if (req.getEnabled() != null) user.setEnabled(req.getEnabled());
        if (req.getPassword() != null) user.setPasswordHash(passwordEncoder.encode(req.getPassword()));

        return toResponse(userRepository.save(user));
    }

    @Transactional
    public void deactivate(Long userId, Long adminId, String adminUsername, String ip) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        user.setEnabled(false);
        userRepository.save(user);
        auditService.logSuccess(adminId, adminUsername, "USER_DEACTIVATE", "user:" + userId, ip);
    }

    @Transactional
    public void hardDelete(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        if (user.getRole() == User.Role.ADMIN) {
            throw new ForbiddenException("Impossible de supprimer un admin");
        }
        userRepository.delete(user);
    }

    private UserResponse toResponse(User u) {
        return UserResponse.builder()
                .id(u.getId()).username(u.getUsername()).name(u.getName())
                .email(u.getEmail()).role(u.getRole().name()).enabled(u.isEnabled())
                .lastLoginAt(u.getLastLoginAt()).createdAt(u.getCreatedAt())
                .build();
    }
}
