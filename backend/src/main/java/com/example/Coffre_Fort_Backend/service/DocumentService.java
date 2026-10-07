package com.example.Coffre_Fort_Backend.service;

import com.example.Coffre_Fort_Backend.dto.request.UpdateProfileRequest;
import com.example.Coffre_Fort_Backend.dto.response.*;
import com.example.Coffre_Fort_Backend.entity.*;
import com.example.Coffre_Fort_Backend.exception.*;
import com.example.Coffre_Fort_Backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
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
    private final S3Client s3Client;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

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

        // Définir la clé d'objet dans le Bucket R2 (ex: patients/patient_1/uuid_nom.pdf)
        String s3ObjectKey = "patients/patient_" + patientId + "/" + UUID.randomUUID() + "_" + file.getOriginalFilename();

        // Envoyer le fichier sur Cloudflare R2
        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(s3ObjectKey)
                .contentType(file.getContentType())
                .contentLength(file.getSize())
                .build();

        s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

        Document doc = Document.builder()
                .patient(patient)
                .uploadedBy(uploader)
                .fileName(file.getOriginalFilename())
                .documentType(Document.DocumentType.valueOf(docType.replace("-", "_")))
                .description(description)
                .storagePath(s3ObjectKey) // On stocke la clé S3 dans storagePath
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
            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(doc.getStoragePath())
                    .build();

            ResponseBytes<GetObjectResponse> objectBytes = s3Client.getObjectAsBytes(getObjectRequest);
            Resource resource = new ByteArrayResource(objectBytes.asByteArray());

            return Map.of("resource", resource, "fileName", doc.getFileName(),
                    "mimeType", doc.getMimeType() != null ? doc.getMimeType() : "application/octet-stream");
        } catch (Exception e) {
            throw new ResourceNotFoundException("Fichier introuvable sur le stockage Cloud R2");
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
            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(doc.getStoragePath())
                    .build();

            ResponseBytes<GetObjectResponse> objectBytes = s3Client.getObjectAsBytes(getObjectRequest);
            Resource resource = new ByteArrayResource(objectBytes.asByteArray());

            return Map.of("resource", resource, "fileName", doc.getFileName(),
                    "mimeType", doc.getMimeType() != null ? doc.getMimeType() : "application/octet-stream");
        } catch (Exception e) {
            throw new ResourceNotFoundException("Fichier introuvable sur le stockage Cloud R2");
        }
    }

    // ---------- Delete ----------

    @Transactional
    public void delete(Long documentId, Long userId, String role, String username, String ip) {
        Document doc = documentRepository.findByIdWithAccess(documentId, role, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Document introuvable ou accès refusé"));

        try {
            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(doc.getStoragePath())
                    .build();
            s3Client.deleteObject(deleteObjectRequest);
        } catch (Exception e) {
            // Log silencieux si l'objet n'existe plus sur Cloudflare, pour supprimer la BDD
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
