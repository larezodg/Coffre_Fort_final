package com.example.Coffre_Fort_Backend.repository;

import com.example.Coffre_Fort_Backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // auth_login_select_user
    Optional<User> findByUsernameAndEnabledTrue( String username);


    // auth_me
    @Query("SELECT u FROM User u WHERE u.id = :userId AND u.enabled = true")
    Optional<User> findActiveById(@Param("userId") Long userId);

    // users_list_all
    List<User> findAllByOrderByName();

    // users_list_doctors
    List<User> findByRoleAndEnabledTrueOrderByName(User.Role role);

    // users_create_check_duplicate
    @Query("SELECT COUNT(u) FROM User u WHERE u.username = :username OR u.email = :email")
    long countByUsernameOrEmail(@Param("username") String username, @Param("email") String email);

    // helper_email_unique
    @Query("SELECT u.id FROM User u WHERE u.email = :email AND u.id <> :excludeId")
    Optional<Long> findIdByEmailExcluding(@Param("email") String email, @Param("excludeId") Long excludeId);

    // helper_username_unique
    @Query("SELECT u.id FROM User u WHERE u.username = :username AND u.id <> :excludeId")
    Optional<Long> findIdByUsernameExcluding(@Param("username") String username, @Param("excludeId") Long excludeId);

    // dashboard_admin_user_count
    @Query("SELECT COUNT(u) FROM User u WHERE u.enabled = true")
    long countActiveUsers();

    // auth_login_update_last_login
    @Modifying
    @Query("UPDATE User u SET u.lastLoginAt = CURRENT_TIMESTAMP WHERE u.id = :userId")
    void updateLastLogin(@Param("userId") Long userId);
}
