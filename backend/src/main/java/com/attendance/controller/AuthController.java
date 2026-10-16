package com.attendance.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

/**
 * Controller providing Authentication and Role-Based Faculty Profiles.
 * Supports 3 designated faculty logins:
 * 1. ME Faculty (Mechanical Engineering only)
 * 2. CE Faculty (Computer Engineering only)
 * 3. HOD (University Head of Department - Full access across all branches)
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"})
public class AuthController {

    public static class LoginRequest {
        private String username;
        private String password;

        public LoginRequest() {}

        public LoginRequest(String username, String password) {
            this.username = username;
            this.password = password;
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }

    public static class FacultyUser {
        private String username;
        private String name;
        private String role; // "HOD" or "FACULTY"
        private String department; // "Mechanical Engineering", "Computer Science & Engineering", or "ALL"
        private String email;

        public FacultyUser(String username, String name, String role, String department, String email) {
            this.username = username;
            this.name = name;
            this.role = role;
            this.department = department;
            this.email = email;
        }

        public String getUsername() {
            return username;
        }

        public String getName() {
            return name;
        }

        public String getRole() {
            return role;
        }

        public String getDepartment() {
            return department;
        }

        public String getEmail() {
            return email;
        }
    }

    // Pre-configured Faculty Directory for Academic Lab Course
    private static final Map<String, FacultyUser> FACULTY_REGISTRY = Map.of(
            "me_faculty", new FacultyUser(
                    "me_faculty",
                    "Prof. Vikram Malhotra",
                    "FACULTY",
                    "Mechanical Engineering",
                    "vikram.me@university.edu"
            ),
            "ce_faculty", new FacultyUser(
                    "ce_faculty",
                    "Prof. Sunita Rao",
                    "FACULTY",
                    "Computer Science & Engineering",
                    "sunita.ce@university.edu"
            ),
            "hod", new FacultyUser(
                    "hod",
                    "Dr. A. V. Raman (HOD)",
                    "HOD",
                    "ALL",
                    "hod.engineering@university.edu"
            )
    );

    /**
     * POST /api/auth/login - Authenticate faculty user
     */
    @PostMapping("/login")
    public ResponseEntity<FacultyUser> login(@RequestBody LoginRequest request) {
        if (request == null || request.getUsername() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username is required");
        }

        String username = request.getUsername().trim().toLowerCase();
        FacultyUser user = FACULTY_REGISTRY.get(username);

        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid faculty credentials: User '" + username + "' not found");
        }

        // Demo password check (accepts "password123", "admin123", or matching username)
        if (request.getPassword() != null && !request.getPassword().trim().isEmpty() &&
                !request.getPassword().equals("password123") &&
                !request.getPassword().equals("admin123") &&
                !request.getPassword().equals(username)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid password for faculty user: " + username);
        }

        return ResponseEntity.ok(user);
    }

    /**
     * GET /api/auth/users - List available demo faculty logins for quick testing
     */
    @GetMapping("/users")
    public ResponseEntity<List<FacultyUser>> getAvailableUsers() {
        return ResponseEntity.ok(List.copyOf(FACULTY_REGISTRY.values()));
    }
}

