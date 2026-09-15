package com.example.Coffre_Fort_Backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "documents")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by", nullable = false)
    private User uploadedBy;

    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;

    @Enumerated(EnumType.STRING)
    @Column(name = "document_type", nullable = false,
            columnDefinition = "ENUM('ordonnance','analyse','radiologie','compte-rendu','certificat','autre')")
    private DocumentType documentType;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "storage_path", nullable = false, length = 500)
    private String storagePath;

    @Column(name = "file_size", nullable = false)
    private Long fileSize = 0L;

    @Column(name = "mime_type", length = 100)
    private String mimeType;

    @Column(nullable = false)
    private boolean encrypted = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum DocumentType {
        ordonnance, analyse, radiologie, compte_rendu("compte-rendu"), certificat, autre;

        private final String value;

        DocumentType() { this.value = this.name(); }
        DocumentType(String value) { this.value = value; }

        public String getValue() { return value; }
    }
}
