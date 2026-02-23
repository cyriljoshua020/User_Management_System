package com.example.usermanagement.controller;

import com.example.usermanagement.dto.UpdateUserRequest;
import com.example.usermanagement.dto.UserDto;
import com.example.usermanagement.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:4200")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // Admin: view all users
    @GetMapping
    public List<UserDto> getAllUsers() {
        return userService.getAllUsers();
    }

    // Admin/User: view by id
    @GetMapping("/{id}")
    public UserDto getUserById(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    // User or Admin: update user details
    // performedBy is optional:
    //  - when admin updates user (from Admin Dashboard), we pass performedBy
    //  - when user updates own profile, performedBy can be null
    @PutMapping("/{id}")
    public UserDto updateUser(@PathVariable Long id,
                              @Valid @RequestBody UpdateUserRequest request,
                              @RequestParam(required = false) String performedBy) {
        return userService.updateUser(id, request, performedBy);
    }

    // Admin: delete user
    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id,
                           @RequestParam String performedBy) {
        userService.deleteUser(id, performedBy);
    }

    // Admin: promote user to ADMIN
    @PutMapping("/{id}/promote")
    public UserDto promoteToAdmin(@PathVariable Long id,
                                  @RequestParam String performedBy) {
        return userService.promoteToAdmin(id, performedBy);
    }
}