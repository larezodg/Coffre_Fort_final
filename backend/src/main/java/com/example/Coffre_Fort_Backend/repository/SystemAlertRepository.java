package com.example.Coffre_Fort_Backend.repository;

import com.example.Coffre_Fort_Backend.entity.SystemAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SystemAlertRepository extends JpaRepository<SystemAlert, Long> {
    List<SystemAlert> findTop20ByOrderByCreatedAtDesc();
}
