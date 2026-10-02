package com.example.Coffre_Fort_Backend.repository;

import com.example.Coffre_Fort_Backend.entity.SecurityEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SecurityEventRepository extends JpaRepository<SecurityEvent, Long> {

    // security_events_list
    List<SecurityEvent> findTop100ByOrderByCreatedAtDesc();

    // dashboard_admin_security_alerts
    @Query("SELECT COUNT(se) FROM SecurityEvent se WHERE se.severity IN ('CRITICAL', 'HIGH') AND se.createdAt >= :since")
    long countHighSeveritySince(LocalDateTime since);

    // security_stats_threats_24h
    @Query("SELECT COUNT(se) FROM SecurityEvent se WHERE se.createdAt >= :since")
    long countSince(LocalDateTime since);
}
