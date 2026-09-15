package com.example.Coffre_Fort_Backend.service;

import com.example.Coffre_Fort_Backend.dto.request.*;
import com.example.Coffre_Fort_Backend.dto.response.*;
import com.example.Coffre_Fort_Backend.entity.*;
import com.example.Coffre_Fort_Backend.exception.*;
import com.example.Coffre_Fort_Backend.repository.*;
import com.example.Coffre_Fort_Backend.util.AccessCodeGenerator;
import com.example.Coffre_Fort_Backend.util.JwtUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final DocumentRepository documentRepository;
    private final AuditService auditService;
    private final AccessCodeGenerator codeGenerator;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    // ---------- Accès par code ----------

    @Transactional
    public AuthResponse accessByCode(AccessByCodeRequest req, String ip) {
        Patient patient = patientRepository.findActiveByAccessCode(req.getCode())
                .orElseThrow(() -> new ResourceNotFoundException("Code d'accès invalide"));

        User user;
        if (patient.getUser() != null) {
            // Compte existant — vérifier password
            user = patient.getUser();

        } else {
            // Créer un compte patient
            String generatedUsername = "patient_" + patient.getId();
            user = User.builder()
                    .username(generatedUsername)
                    .name(patient.getName())
                    .email(patient.getEmail() != null ? patient.getEmail() : generatedUsername + "@coffre.local")
                    .role(User.Role.PATIENT)
                    .enabled(true)
                    .build();
            user = userRepository.save(user);
            patient.setUser(user);
            patientRepository.save(patient);
        }

        userRepository.updateLastLogin(user.getId());
        auditService.logSuccess(user.getId(), user.getUsername(), "PATIENT_ACCESS_BY_CODE",
                "patient:" + patient.getId(), ip);

        String token = jwtUtil.generateToken(user.getId(), user.getUsername(), user.getRole().name());
        return new AuthResponse(token, "Bearer",
                UserResponse.builder()
                        .id(user.getId()).username(user.getUsername()).name(user.getName())
                        .email(user.getEmail()).role(user.getRole().name()).enabled(user.isEnabled())
                        .build());
    }

    // ---------- CRUD patients ----------

    public List<PatientResponse> listAll() {
        return patientRepository.findAllWithDoctor().stream()
                .map(p -> toResponse(p, documentRepository.countByDoctorId(
                        p.getDoctor() != null ? p.getDoctor().getId() : -1L)))
                .collect(Collectors.toList());
    }

    public List<PatientResponse> listByDoctor(Long doctorId) {
        return patientRepository.findByDoctorId(doctorId).stream()
                .map(p -> toResponse(p, 0))
                .collect(Collectors.toList());
    }

    public PatientResponse getById(Long patientId, String role, Long actorId) {
        Patient patient;
        if ("ADMIN".equals(role)) {
            patient = patientRepository.findByIdWithDetails(patientId)
                    .orElseThrow(() -> new ResourceNotFoundException("Patient introuvable"));
        } else {
            patient = patientRepository.findByIdAndDoctorId(patientId, actorId)
                    .orElseThrow(() -> new ResourceNotFoundException("Patient introuvable"));
        }
        long docCount = documentRepository.countByDoctorId(
                patient.getDoctor() != null ? patient.getDoctor().getId() : -1L);
        return toResponse(patient, docCount);
    }

    @Transactional
    public PatientResponse create(CreatePatientRequest req, Long actorId, String username, String ip) {
        User user = null;
        if (req.getUserId() != null) {
            user = userRepository.findById(req.getUserId())
                    .filter(u -> u.getRole() == User.Role.PATIENT && u.isEnabled())
                    .orElseThrow(() -> new ResourceNotFoundException("utilisateur introuvable"));
        }

        // Vérifier médecin si spécifié
        User doctor = null;
        if (req.getDoctorId() != null) {
            doctor = userRepository.findById(req.getDoctorId())
                    .filter(u -> u.getRole() == User.Role.DOCTOR && u.isEnabled())
                    .orElseThrow(() -> new ResourceNotFoundException("Médecin introuvable"));
        }

        // Générer code unique
        String code;
        do { code = codeGenerator.generate(); } while (patientRepository.existsByAccessCode(code));

        Patient patient = Patient.builder()

                .name(req.getName())
                .dateOfBirth(req.getDateOfBirth())
                .email(req.getEmail())
                .phone(req.getPhone())
                .user(user)
                .doctor(doctor)
                .accessCode(code)
                .status(Patient.Status.ACTIVE)
                .build();
        patient = patientRepository.save(patient);
        auditService.logSuccess(actorId, username, "PATIENT_CREATE", "patient:" + patient.getId(), ip);
        return toResponse(patient, 0);
    }

    @Transactional
    public PatientResponse update(Long patientId, UpdatePatientRequest req,
                                   String role, Long actorId) {
        Patient patient = "ADMIN".equals(role)
                ? patientRepository.findById(patientId)
                    .orElseThrow(() -> new ResourceNotFoundException("Patient introuvable"))
                : patientRepository.findByIdAndDoctorId(patientId, actorId)
                    .orElseThrow(() -> new ResourceNotFoundException("Patient introuvable"));

        if (req.getName() != null) patient.setName(req.getName());
        if (req.getDateOfBirth() != null) patient.setDateOfBirth(req.getDateOfBirth());
        if (req.getEmail() != null) patient.setEmail(req.getEmail());
        if (req.getPhone() != null) patient.setPhone(req.getPhone());
        if (req.getStatus() != null) patient.setStatus(Patient.Status.valueOf(req.getStatus()));
        if (req.getDoctorId() != null) {
            User doc = userRepository.findById(req.getDoctorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Médecin introuvable"));
            patient.setDoctor(doc);
        }

        patient = patientRepository.save(patient);
        return toResponse(patient, 0);
    }

    @Transactional
    public void delete(Long patientId, String role, Long actorId, String username, String ip) {
        Patient patient = "ADMIN".equals(role)
                ? patientRepository.findById(patientId)
                    .orElseThrow(() -> new ResourceNotFoundException("Patient introuvable"))
                : patientRepository.findByIdAndDoctorId(patientId, actorId)
                    .orElseThrow(() -> new ResourceNotFoundException("Patient introuvable"));

        patientRepository.delete(patient);
        auditService.logSuccess(actorId, username, "PATIENT_DELETE", "patient:" + patientId, ip);
    }

    // ---------- Helper ----------

    private PatientResponse toResponse(Patient p, long docCount) {
        return PatientResponse.builder()
                .id(p.getId())
                .userId(p.getUser() != null ? p.getUser().getId() : null)
                .doctorId(p.getDoctor() != null ? p.getDoctor().getId() : null)
                .name(p.getName())
                .dateOfBirth(p.getDateOfBirth())
                .email(p.getEmail())
                .phone(p.getPhone())
                .code(p.getAccessCode())
                .status(p.getStatus().name())
                .lastVisit(p.getLastVisitAt())
                .doctorName(p.getDoctor() != null ? p.getDoctor().getName() : null)
                .documentCount(docCount)
                .createdAt(p.getCreatedAt())
                .build();
    }
}
