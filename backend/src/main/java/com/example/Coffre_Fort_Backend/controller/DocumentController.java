package com.example.Coffre_Fort_Backend.controller;

import com.example.Coffre_Fort_Backend.dto.response.DocumentResponse;
import com.example.Coffre_Fort_Backend.security.AuthenticatedUser;
import com.example.Coffre_Fort_Backend.service.DocumentService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    /** GET /documents */
    @GetMapping
    public ResponseEntity<List<DocumentResponse>> list(
            @RequestParam(required = false) Long patientId,
            @AuthenticationPrincipal AuthenticatedUser user) {

        return switch (user.getRole()) {
            case "ADMIN" -> ResponseEntity.ok(documentService.listForAdmin(patientId));
            case "DOCTOR" -> ResponseEntity.ok(documentService.listForDoctor(user.getId(), patientId));
            default -> ResponseEntity.ok(documentService.listForPatient(user.getId()));
        };
    }

    /** POST /documents/upload */
    @PostMapping("/upload")
    public ResponseEntity<DocumentResponse> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam Long patientId,
            @RequestParam String type,
            @RequestParam(required = false) String description,
            @AuthenticationPrincipal AuthenticatedUser user,
            HttpServletRequest http) throws IOException {

        DocumentResponse doc = documentService.upload(
                file, patientId, type, description,
                user.getId(), user.getUsername(), getIp(http));
        return ResponseEntity.status(201).body(doc);
    }

    /** GET /documents/{id}/download */
    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> download(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser user,
            HttpServletRequest http) {

        Map<String, Object> result = documentService.download(
                id, user.getId(), user.getRole(), user.getUsername(), getIp(http));

        Resource resource = (Resource) result.get("resource");
        String fileName = (String) result.get("fileName");
        String mimeType = (String) result.get("mimeType");

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(mimeType))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + fileName + "\"")
                .body(resource);
    }

    /** GET /documents/{id}/preview */
    @GetMapping("/{id}/preview")
    public ResponseEntity<Resource> preview(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser user,
            HttpServletRequest http) {

        Map<String, Object> result = documentService.preview(
                id, user.getId(), user.getRole(), user.getUsername(), getIp(http));

        Resource resource = (Resource) result.get("resource");
        String fileName = (String) result.get("fileName");
        String mimeType = (String) result.get("mimeType");

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(mimeType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
                .body(resource);
    }

    /** DELETE /documents/{id} */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser user,
            HttpServletRequest http) {

        documentService.delete(id, user.getId(), user.getRole(), user.getUsername(), getIp(http));
        return ResponseEntity.noContent().build();
    }

    private String getIp(HttpServletRequest req) {
        String fwd = req.getHeader("X-Forwarded-For");
        return fwd != null ? fwd.split(",")[0].trim() : req.getRemoteAddr();
    }
}
