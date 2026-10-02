package com.example.Coffre_Fort_Backend.repository;

import com.example.Coffre_Fort_Backend.entity.DocumentView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DocumentViewRepository extends JpaRepository<DocumentView, Long> {

    Optional<DocumentView> findByDocumentIdAndUserId(Long documentId, Long userId);

    // dashboard_doctor_documents_viewed
    @Query("SELECT COUNT(v) FROM DocumentView v WHERE v.document.patient.doctor.id = :doctorId")
    long countViewedByDoctorPatients(@Param("doctorId") Long doctorId);

    // dashboard_doctor_pending (documents non vus par patient)
    @Query("SELECT COUNT(d) FROM Document d JOIN d.patient p " +
           "WHERE p.doctor.id = :doctorId AND p.user IS NOT NULL " +
           "AND NOT EXISTS (SELECT v FROM DocumentView v WHERE v.document = d AND v.user = p.user)")
    long countPendingForDoctor(@Param("doctorId") Long doctorId);

    // dashboard_patient_unread
    @Query("SELECT COUNT(d) FROM Document d JOIN d.patient p " +
           "WHERE p.user.id = :userId " +
           "AND NOT EXISTS (SELECT v FROM DocumentView v WHERE v.document = d AND v.user.id = :userId)")
    long countUnreadForPatient(@Param("userId") Long userId);

    // dashboard_patient_document_count
    @Query("SELECT COUNT(d) FROM Document d WHERE d.patient.user.id = :userId")
    long countDocumentsForPatient(@Param("userId") Long userId);
}
