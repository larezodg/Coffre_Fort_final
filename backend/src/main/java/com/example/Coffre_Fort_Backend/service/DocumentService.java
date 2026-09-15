package com.example.Coffre_Fort_Backend.service;

import com.example.Coffre_Fort_Backend.dto.request.UpdateProfileRequest;
import com.example.Coffre_Fort_Backend.dto.response.*;
import com.example.Coffre_Fort_Backend.entity.*;
import com.example.Coffre_Fort_Backend.exception.*;
import com.example.Coffre_Fort_Backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final DocumentViewRepository documentViewRepository;
    private final AuditService auditService;

    @Value("${app.upload.dir}")
    private String uploadDir;

    // ---------- Liste ----------

    public List<DocumentResponse> listForAdmin(Long patientId) {
        return documentRepository.findAllForAdmin(patientId).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public List<DocumentResponse> listForDoctor(Long doctorId, Long patientId) {
        return documentRepository.findAllForDoctor(doctorId, patientId).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public List<DocumentResponse> listForPatient(Long userId) {
        return documentRepository.findAllForPatient(userId).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    // ---------- Upload ----------

    @Transactional
    public DocumentResponse upload(MultipartFile file, Long patientId, String docType,
                                    String description, Long uploaderId, String username, String ip) throws IOException {
        User uploader = userRepository.findById(uploaderId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));

        Patient patient;
        if (uploader.getRole() == User.Role.DOCTOR) {
            patient = patientRepository.findByIdAndDoctorId(patientId, uploaderId)
                    .orElseThrow(() -> new ForbiddenException("Accès refusé à ce patient"));
        } else {
            patient = patientRepository.findById(patientId)
                    .orElseThrow(() -> new ResourceNotFoundException("Patient introuvable"));
        }

        // Sauvegarder le fichier
        Path dir = Paths.get(uploadDir, "patient_" + patientId);
        Files.createDirectories(dir);
        String storedName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path storagePath = dir.resolve(storedName);
        Files.copy(file.getInputStream(), storagePath, StandardCopyOption.REPLACE_EXISTING);

        Document doc = Document.builder()
                .patient(patient)
                .uploadedBy(uploader)
                .fileName(file.getOriginalFilename())
                .documentType(Document.DocumentType.valueOf(docType.replace("-", "_")))
                .description(description)
                .storagePath(storagePath.toString())
                .fileSize(file.getSize())
                .mimeType(file.getContentType())
                .encrypted(true)
                .build();
        doc = documentRepository.save(doc);

        patient.setLastVisitAt(LocalDateTime.now());
        patientRepository.save(patient);

        auditService.logSuccess(uploaderId, username, "DOCUMENT_UPLOAD",
                "document:" + doc.getId() + " patient:" + patientId, ip);

        return toResponse(doc);
    }

    // ---------- Download ----------

    public Map<String, Object> download(Long documentId, Long userId, String role, String username, String ip) {
        Document doc = documentRepository.findByIdWithAccess(documentId, role, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Document introuvable ou accès refusé"));

        auditService.logSuccess(userId, username, "DOCUMENT_DOWNLOAD", "document:" + documentId, ip);

        try {
            Path path = Paths.get(doc.getStoragePath());
            Resource resource = new UrlResource(path.toUri());
            return Map.of("resource", resource, "fileName", doc.getFileName(),
                    "mimeType", doc.getMimeType() != null ? doc.getMimeType() : "application/octet-stream");
        } catch (MalformedURLException e) {
            throw new ResourceNotFoundException("Fichier introuvable sur le disque");
        }
    }

    // ---------- Preview ----------

    @Transactional
    public Map<String, Object> preview(Long documentId, Long userId, String role, String username, String ip) {
        Document doc = documentRepository.findByIdWithAccess(documentId, role, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Document introuvable ou accès refusé"));

        // Tracker la vue
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        DocumentView view = documentViewRepository.findByDocumentIdAndUserId(documentId, userId)
                .orElse(DocumentView.builder().document(doc).user(user).build());
        view.setViewedAt(LocalDateTime.now());
        documentViewRepository.save(view);

        auditService.logSuccess(userId, username, "DOCUMENT_VIEW", "document:" + documentId, ip);

        try {
            Path path = Paths.get(doc.getStoragePath());
            Resource resource = new UrlResource(path.toUri());
            return Map.of("resource", resource, "fileName", doc.getFileName(),
                    "mimeType", doc.getMimeType() != null ? doc.getMimeType() : "application/octet-stream");
        } catch (MalformedURLException e) {
            throw new ResourceNotFoundException("Fichier introuvable");
        }
    }

    // ---------- Delete ----------

    @Transactional
    public void delete(Long documentId, Long userId, String role, String username, String ip) {
        Document doc = documentRepository.findByIdWithAccess(documentId, role, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Document introuvable ou accès refusé"));

        try {
            Files.deleteIfExists(Paths.get(doc.getStoragePath()));
        } catch (IOException e) {
            // log silencieux, supprimer la BDD quand même
        }

        documentRepository.delete(doc);
        auditService.logSuccess(userId, username, "DOCUMENT_DELETE", "document:" + documentId, ip);
    }

    // ---------- Helper ----------

    private DocumentResponse toResponse(Document d) {
        return DocumentResponse.builder()
                .id(d.getId())
                .name(d.getFileName())
                .patientName(d.getPatient() != null ? d.getPatient().getName() : null)
                .type(d.getDocumentType().getValue())
                .date(d.getCreatedAt())
                .size(d.getFileSize())
                .encrypted(d.isEncrypted())
                .doctorName(d.getUploadedBy() != null ? d.getUploadedBy().getName() : null)
                .uploadedBy(d.getUploadedBy() != null ? d.getUploadedBy().getName() : null)
                .build();
    }
}
