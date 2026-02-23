package com.example.usermanagement.service.Impl;

import com.example.usermanagement.dto.UpdateUserRequest;
import com.example.usermanagement.dto.UserDto;
import com.example.usermanagement.entity.User;
import com.example.usermanagement.exception.BadRequestException;
import com.example.usermanagement.exception.ResourceNotFoundException;
import com.example.usermanagement.repository.UserRepository;
import com.example.usermanagement.service.AuditLogService;
import com.example.usermanagement.service.UserService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public UserServiceImpl(UserRepository userRepository,
                           AuditLogService auditLogService) {
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    @Override
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public UserDto getUserById(Long id) {
        User user = getUserOrThrow(id);
        return toDto(user);
    }

    @Override
    public UserDto createUser(UserDto userDto) {
        // Admin-created user must at least have a username and email.
        if (userDto.getUsername() == null || userDto.getEmail() == null) {
            throw new BadRequestException("Username and email are required.");
        }

        // Check duplicates
        if (userRepository.existsByUsername(userDto.getUsername())) {
            throw new BadRequestException("Username already exists");
        }

        if (userRepository.existsByEmail(userDto.getEmail())) {
            throw new BadRequestException("Email already exists");
        }

        User user = new User();
        user.setUsername(userDto.getUsername());
        user.setFullName(userDto.getFullName());
        user.setEmail(userDto.getEmail());
        user.setRole(userDto.getRole() != null ? userDto.getRole() : "USER");
        user.setActive(true);

        // Password is not set here (can be generated separately if needed)
        User saved = userRepository.save(user);
        return toDto(saved);
    }

    @Override
    public UserDto updateUser(Long id, UpdateUserRequest request, String performedByUsername) {
        User user = getUserOrThrow(id);

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        if (request.getActive() != null) {
            user.setActive(request.getActive());
        }

        User saved = userRepository.save(user);

        //  Log UPDATE_USER only if an admin performed it (performedByUsername not null)
        if (performedByUsername != null && !performedByUsername.isBlank()) {
            String details = "Admin " + performedByUsername + " has updated user " + user.getUsername();
            auditLogService.log(performedByUsername, "UPDATE_USER", details);
        }

        return toDto(saved);
    }

    @Override
    public void deleteUser(Long id, String performedByUsername) {
        User user = getUserOrThrow(id);
        userRepository.delete(user);

        String details = "Admin " + performedByUsername + " has deleted user " + user.getUsername();
        auditLogService.log(performedByUsername, "DELETE_USER", details);
    }

    @Override
    public UserDto promoteToAdmin(Long id, String performedByUsername) {
        User user = getUserOrThrow(id);
        user.setRole("ADMIN");
        User saved = userRepository.save(user);

        String details = "Admin " + performedByUsername + " has promoted user "
                + user.getUsername() + " to ADMIN";
        auditLogService.log(performedByUsername, "PROMOTE_TO_ADMIN", details);

        return toDto(saved);
    }

    private User getUserOrThrow(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
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