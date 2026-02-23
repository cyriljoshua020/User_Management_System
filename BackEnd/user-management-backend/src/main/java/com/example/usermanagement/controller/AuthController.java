package com.example.usermanagement.controller;

import com.example.usermanagement.dto.LoginRequest;
import com.example.usermanagement.dto.SignupRequest;
import com.example.usermanagement.dto.UserDto;
import com.example.usermanagement.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // performedBy is optional:
    // - null for normal signup page
    // - admin username for "Add User" from Admin Dashboard
    @PostMapping("/signup")
    public UserDto signup(@Valid @RequestBody SignupRequest request,
                          @RequestParam(required = false) String performedBy) {
        return authService.signup(request, performedBy);
    }

    @PostMapping("/login")
    public UserDto login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }
}