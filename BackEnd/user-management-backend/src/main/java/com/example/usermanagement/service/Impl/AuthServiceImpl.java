package com.example.usermanagement.service.Impl;

import com.example.usermanagement.dto.LoginRequest;
import com.example.usermanagement.dto.SignupRequest;
import com.example.usermanagement.dto.UserDto;
import com.example.usermanagement.entity.User;
import com.example.usermanagement.exception.BadRequestException;
import com.example.usermanagement.repository.UserRepository;
import com.example.usermanagement.service.AuditLogService;
import com.example.usermanagement.service.AuthService;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public AuthServiceImpl(UserRepository userRepository,
                           AuditLogService auditLogService) {
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    @Override
    public UserDto signup(SignupRequest request, String performedByUsername) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username is already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already in use");
        }

        User user = new User();
        user.setUsername(request.getUsername());

        // Store raw password directly (NO encoding)
        user.setPassword(request.getPassword());

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());

        // ADMIN SECRET CHECK
        if ("SUPERADMIN123".equals(request.getAdminSecret())) {
            user.setRole("ADMIN");
        } else {
            user.setRole("USER");
        }

        user.setActive(true);

        User saved = userRepository.save(user);

        // If an admin used "Add User" (performedByUsername not null), log CREATE_USER
        if (performedByUsername != null && !performedByUsername.isBlank()) {
            String details = "Admin " + performedByUsername
                    + " has created user " + saved.getUsername();
            auditLogService.log(performedByUsername, "CREATE_USER", details);
        }

        return toDto(saved);
    }

    @Override
    public UserDto login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BadRequestException("Invalid username or password"));

        // Direct password comparison (plain text)
        if (!request.getPassword().equals(user.getPassword())) {
            throw new BadRequestException("Invalid username or password");
        }

        if (!Boolean.TRUE.equals(user.getActive())) {
            throw new BadRequestException("User account is inactive");
        }

        return toDto(user);
    }

    private UserDto toDto(User user) {
        return new UserDto(
                user.getId(),
                user.getUsername(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.getActive()
        );
    }
}
