package com.example.Coffre_Fort_Backend.service;

import com.example.Coffre_Fort_Backend.dto.request.*;
import com.example.Coffre_Fort_Backend.dto.response.*;
import com.example.Coffre_Fort_Backend.entity.User;
import com.example.Coffre_Fort_Backend.exception.*;
import com.example.Coffre_Fort_Backend.repository.UserRepository;
import com.example.Coffre_Fort_Backend.util.JwtUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuditService auditService;

    @Transactional
    public AuthResponse login(LoginRequest req, String ip) {
        User user = userRepository.findByUsernameAndEnabledTrue(req.getUsername())
                .orElseThrow(() -> {
                    auditService.logFailure(req.getUsername(), "LOGIN_FAILED", "auth/login", ip);
                    return new UnauthorizedException("Identifiants incorrects");
                });


        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            auditService.logFailure(req.getUsername(), "LOGIN_FAILED", "auth/login", ip);
            throw new UnauthorizedException("Identifiants incorrects");
        }

        userRepository.updateLastLogin(user.getId());
        auditService.logSuccess(user.getId(), user.getUsername(), "LOGIN_SUCCESS", "auth/login", ip);

        String token = jwtUtil.generateToken(user.getId(), user.getUsername(), user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .user(toUserResponse(user))
                .build();

    }

    public UserResponse getMe(Long userId) {
        User user = userRepository.findActiveById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        return toUserResponse(user);
    }

    @Transactional
    public UserResponse updateProfile(Long userId, String username, UpdateProfileRequest req, String ip) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));

        // Vérifier unicité email
        userRepository.findIdByEmailExcluding(req.getEmail(), userId)
                .ifPresent(id -> { throw new ConflictException("Email déjà utilisé"); });

        user.setName(req.getName());
        user.setEmail(req.getEmail());
        userRepository.save(user);

        auditService.logSuccess(userId, username, "PROFILE_UPDATE", "user:" + userId, ip);
        return toUserResponse(user);
    }

    @Transactional
    public void changePassword(Long userId, String username, ChangePasswordRequest req, String ip) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));

        if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Mot de passe actuel incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);

        auditService.logSuccess(userId, username, "PASSWORD_CHANGE", "user:" + userId, ip);
    }

    public void logout(Long userId, String username, String ip) {
        auditService.logSuccess(userId, username, "LOGOUT", "auth/logout", ip);
    }

    public UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .enabled(user.isEnabled())
                .lastLoginAt(user.getLastLoginAt())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
