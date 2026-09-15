package com.example.Coffre_Fort_Backend.repository;

import com.example.Coffre_Fort_Backend.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {

    // patients_access_select
    @Query("SELECT p FROM Patient p LEFT JOIN FETCH p.user WHERE p.accessCode = :code AND p.status = com.example.Coffre_Fort_Backend.entity.Patient$Status.ACTIVE")
    Optional<Patient> findActiveByAccessCode(@Param("code") String code);

    // patients_access_code_exists
    boolean existsByAccessCode(String accessCode);

    // patients_list_admin
    @Query("SELECT p FROM Patient p LEFT JOIN FETCH p.doctor ORDER BY p.name")
    List<Patient> findAllWithDoctor();

    // patients_list_doctor
    @Query("SELECT p FROM Patient p WHERE p.doctor.id = :doctorId ORDER BY p.name")
    List<Patient> findByDoctorId(@Param("doctorId") Long doctorId);

    // patients_get_by_id (admin)
    @Query("SELECT p FROM Patient p LEFT JOIN FETCH p.doctor LEFT JOIN FETCH p.user WHERE p.id = :patientId")
    Optional<Patient> findByIdWithDetails(@Param("patientId") Long patientId);

    // patients_get_by_id (doctor)
    @Query("SELECT p FROM Patient p LEFT JOIN FETCH p.doctor LEFT JOIN FETCH p.user WHERE p.id = :patientId AND p.doctor.id = :doctorId")
    Optional<Patient> findByIdAndDoctorId(@Param("patientId") Long patientId, @Param("doctorId") Long doctorId);

    // helper_patient_by_user_id
    Optional<Patient> findFirstByUserId(Long userId);

    // dashboard_doctor_patient_count
    @Query("SELECT COUNT(p) FROM Patient p WHERE p.doctor.id = :doctorId AND p.status = com.example.Coffre_Fort_Backend.entity.Patient$Status.ACTIVE")
    long countActiveByDoctorId(@Param("doctorId") Long doctorId);

    // system_status_counters
    @Query("SELECT COUNT(p) FROM Patient p WHERE p.status = com.example.Coffre_Fort_Backend.entity.Patient$Status.ACTIVE")
    long countAll();
}
