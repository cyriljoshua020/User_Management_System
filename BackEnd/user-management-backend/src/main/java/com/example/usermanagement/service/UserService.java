package com.example.usermanagement.service;

import com.example.usermanagement.dto.UpdateUserRequest;
import com.example.usermanagement.dto.UserDto;

import java.util.List;

public interface UserService {

    List<UserDto> getAllUsers();

    UserDto getUserById(Long id);

    UserDto createUser(UserDto userDto); // for admin adding multiple users

    // add performedByUsername for audit logging
    UserDto updateUser(Long id, UpdateUserRequest request, String performedByUsername);

    void deleteUser(Long id, String performedByUsername);

    UserDto promoteToAdmin(Long id, String performedByUsername);
}
