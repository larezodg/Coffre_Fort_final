package com.example.Coffre_Fort_Backend.repository;

import com.example.Coffre_Fort_Backend.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    // audit_list + audit_count
    @Query("SELECT a FROM AuditLog a " +
           "WHERE (:user IS NULL OR a.username LIKE %:user%) " +
           "AND (:action IS NULL OR a.action = :action) " +
           "AND (:from IS NULL OR a.createdAt >= :from) " +
           "AND (:to IS NULL OR a.createdAt <= :to) " +
           "ORDER BY a.createdAt DESC")
    Page<AuditLog> findFiltered(@Param("user") String user,
                                @Param("action") String action,
                                @Param("from") LocalDateTime from,
                                @Param("to") LocalDateTime to,
                                Pageable pageable);

    // dashboard_admin_recent_audit
    List<AuditLog> findTop5ByOrderByCreatedAtDesc();
}
