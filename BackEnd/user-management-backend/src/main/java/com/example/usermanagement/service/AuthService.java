package com.example.usermanagement.service;

import com.example.usermanagement.dto.LoginRequest;
import com.example.usermanagement.dto.SignupRequest;
import com.example.usermanagement.dto.UserDto;

public interface AuthService {

    // performedByUsername is optional (null when normal signup)
    UserDto signup(SignupRequest request, String performedByUsername);

    UserDto login(LoginRequest request);
}
