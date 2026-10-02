package com.example.Coffre_Fort_Backend.service;

import com.example.Coffre_Fort_Backend.dto.response.*;
import com.example.Coffre_Fort_Backend.entity.*;
import com.example.Coffre_Fort_Backend.exception.*;
import com.example.Coffre_Fort_Backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private static final long MAX_FILE_SIZE = 20L * 1024 * 1024;
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("pdf", "jpg", "jpeg", "png", "dicom");

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
        validateUpload(file);
        User uploader = userRepository.findById(uploaderId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));

        if (uploader.getRole() != User.Role.DOCTOR && uploader.getRole() != User.Role.ADMIN) {
            throw new ForbiddenException("Seul un médecin autorisé peut téléverser un document");
        }

        Patient patient;
        if (uploader.getRole() == User.Role.DOCTOR) {
            patient = patientRepository.findByIdAndDoctorId(patientId, uploaderId)
                    .orElseThrow(() -> new ForbiddenException("Accès refusé à ce patient"));
        } else {
            patient = patientRepository.findById(patientId)
                    .orElseThrow(() -> new ResourceNotFoundException("Patient introuvable"));
        }

        String originalName = safeFileName(file.getOriginalFilename());
        Document.DocumentType documentType = parseDocumentType(docType);
        Path dir = Paths.get(uploadDir).toAbsolutePath().normalize().resolve("patient_" + patientId).normalize();
        Path root = Paths.get(uploadDir).toAbsolutePath().normalize();
        if (!dir.startsWith(root)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Patient invalide");
        Files.createDirectories(dir);
        Path storagePath = dir.resolve(UUID.randomUUID().toString()).normalize();
        if (!storagePath.startsWith(dir)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chemin de fichier invalide");
        try (var input = file.getInputStream()) {
            Files.copy(input, storagePath);
        } catch (IOException ex) {
            Files.deleteIfExists(storagePath);
            throw ex;
        }

        Document doc;
        try {
            doc = Document.builder()
                .patient(patient)
                .uploadedBy(uploader)
                .fileName(originalName)
                .documentType(documentType)
                .description(description)
                .storagePath(storagePath.toString())
                .fileSize(file.getSize())
                .mimeType(detectMimeType(originalName))
                // Les fichiers existants et nouveaux sont stockés en clair. Ne pas déclarer un chiffrement inexistant.
                .encrypted(false)
                .build();
            doc = documentRepository.save(doc);
        } catch (RuntimeException ex) {
            Files.deleteIfExists(storagePath);
            throw ex;
        }

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
            Path path = resolveStoredFile(doc);
            Resource resource = new UrlResource(path.toUri());
            if (!resource.exists() || !resource.isReadable()) throw new ResourceNotFoundException("Fichier introuvable sur le disque");
            return Map.of("resource", resource, "fileName", doc.getFileName(),
                    "mimeType", safeMimeType(doc.getFileName()));
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
            Path path = resolveStoredFile(doc);
            Resource resource = new UrlResource(path.toUri());
            if (!resource.exists() || !resource.isReadable()) throw new ResourceNotFoundException("Fichier introuvable");
            return Map.of("resource", resource, "fileName", doc.getFileName(),
                    "mimeType", safeMimeType(doc.getFileName()));
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
            Files.deleteIfExists(resolveStoredFile(doc));
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

    private void validateUpload(MultipartFile file) {
        if (file == null || file.isEmpty()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fichier vide ou manquant");
        if (file.getSize() > MAX_FILE_SIZE) throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "La taille maximale est de 20 Mo");
        String name = safeFileName(file.getOriginalFilename());
        int dot = name.lastIndexOf('.');
        String extension = dot >= 0 ? name.substring(dot + 1).toLowerCase(Locale.ROOT) : "";
        if (!ALLOWED_EXTENSIONS.contains(extension)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Format de fichier non autorisé");
        try {
            byte[] header = file.getBytes();
            boolean valid = switch (extension) {
                case "pdf" -> startsWith(header, "%PDF-".getBytes(StandardCharsets.US_ASCII));
                case "jpg", "jpeg" -> header.length >= 3 && (header[0] & 0xff) == 0xff && (header[1] & 0xff) == 0xd8 && (header[2] & 0xff) == 0xff;
                case "png" -> startsWith(header, new byte[]{(byte) 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a});
                case "dicom" -> header.length >= 132 && header[128] == 'D' && header[129] == 'I' && header[130] == 'C' && header[131] == 'M';
                default -> false;
            };
            if (!valid) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le contenu ne correspond pas au format annoncé");
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Lecture du fichier impossible");
        }
    }

    private static boolean startsWith(byte[] bytes, byte[] prefix) {
        if (bytes.length < prefix.length) return false;
        for (int i = 0; i < prefix.length; i++) if (bytes[i] != prefix[i]) return false;
        return true;
    }

    private static String safeFileName(String suppliedName) {
        String name = suppliedName == null ? "document" : suppliedName.replace('\\', '/');
        name = name.substring(name.lastIndexOf('/') + 1).replaceAll("[\\p{Cntrl}]", "").trim();
        if (name.isBlank()) name = "document";
        if (name.length() > 255) name = name.substring(name.length() - 255);
        return name;
    }

    private static Document.DocumentType parseDocumentType(String value) {
        if (value != null) {
            String normalized = value.trim().replace('-', '_');
            try { return Document.DocumentType.valueOf(normalized); }
            catch (IllegalArgumentException ignored) { /* below */ }
        }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Type de document invalide");
    }

    private static String detectMimeType(String name) {
        String extension = name.substring(name.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
        return switch (extension) {
            case "pdf" -> "application/pdf";
            case "jpg", "jpeg" -> "image/jpeg";
            case "png" -> "image/png";
            case "dicom" -> "application/dicom";
            default -> "application/octet-stream";
        };
    }

    private static String safeMimeType(String name) {
        return detectMimeType(name);
    }

    private Path resolveStoredFile(Document doc) {
        Path root = Paths.get(uploadDir).toAbsolutePath().normalize();
        Path path = Paths.get(doc.getStoragePath()).toAbsolutePath().normalize();
        if (!path.startsWith(root) || !Files.isRegularFile(path)) throw new ResourceNotFoundException("Fichier introuvable sur le disque");
        return path;
    }
}
