package com.example.Coffre_Fort_Backend.repository;

import com.example.Coffre_Fort_Backend.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {

    // documents_list_admin
    @Query("SELECT d FROM Document d JOIN FETCH d.patient p JOIN FETCH d.uploadedBy u " +
           "WHERE (:patientId IS NULL OR d.patient.id = :patientId) ORDER BY d.createdAt DESC")
    List<Document> findAllForAdmin(@Param("patientId") Long patientId);

    // documents_list_doctor
    @Query("SELECT d FROM Document d JOIN FETCH d.patient p JOIN FETCH d.uploadedBy u " +
           "WHERE p.doctor.id = :doctorId AND (:patientId IS NULL OR p.id = :patientId) ORDER BY d.createdAt DESC")
    List<Document> findAllForDoctor(@Param("doctorId") Long doctorId, @Param("patientId") Long patientId);

    // documents_list_patient
    @Query("SELECT d FROM Document d JOIN FETCH d.patient p JOIN FETCH d.uploadedBy u " +
           "WHERE p.user.id = :userId ORDER BY d.createdAt DESC")
    List<Document> findAllForPatient(@Param("userId") Long userId);

    // documents_upload_verify_patient (retourne patient si autorisé)
    @Query("SELECT d FROM Document d JOIN FETCH d.patient p WHERE d.id = :documentId " +
           "AND (:role = 'ADMIN' OR p.doctor.id = :actorId OR p.user.id = :actorId)")
    Optional<Document> findByIdWithAccess(@Param("documentId") Long documentId,
                                          @Param("role") String role,
                                          @Param("actorId") Long actorId);

    // dashboard_admin_document_count
    long count();

    // dashboard_doctor_documents_sent
    @Query("SELECT COUNT(d) FROM Document d WHERE d.patient.doctor.id = :doctorId")
    long countByDoctorId(@Param("doctorId") Long doctorId);

    // system_status_storage_used
    @Query("SELECT COALESCE(SUM(d.fileSize), 0) FROM Document d")
    long sumFileSize();

    // security_stats_encrypted_docs
    @Query("SELECT COUNT(d) FROM Document d WHERE d.encrypted = true")
    long countEncrypted();
}
