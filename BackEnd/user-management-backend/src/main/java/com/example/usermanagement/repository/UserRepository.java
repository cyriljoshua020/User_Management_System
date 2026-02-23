package com.example.usermanagement.repository;

import com.example.usermanagement.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    // Get the current maximum id in the users table
    @Query("SELECT COALESCE(MAX(u.id), 0) FROM User u")
    Long findMaxId();

    // Reset AUTO_INCREMENT to a specific value
    @Modifying
    @Transactional
    @Query(value = "ALTER TABLE users AUTO_INCREMENT = ?1", nativeQuery = true)
    void resetAutoIncrement(Long nextId);
}