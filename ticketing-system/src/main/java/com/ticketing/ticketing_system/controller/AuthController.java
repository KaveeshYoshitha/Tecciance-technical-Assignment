package com.ticketing.ticketing_system.controller;

import com.ticketing.ticketing_system.dto.AuthResponse;
import com.ticketing.ticketing_system.dto.LoginRequest;
import com.ticketing.ticketing_system.dto.RegisterRequest;
import com.ticketing.ticketing_system.model.User;
import com.ticketing.ticketing_system.security.JwtUtil;
import com.ticketing.ticketing_system.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtUtil jwtUtil;

    public AuthController(AuthService authService, JwtUtil jwtUtil) {
        this.authService = authService;
        this.jwtUtil = jwtUtil;
    }

//    Register a new user
    @PostMapping("/register")
    public String register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return "User registered successfully";
    }

//    Login
    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        boolean valid = authService.login(request);

        if (valid) {
            User user = authService.getUserByEmail(request.getEmail());
            if (user == null) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "User record not found after successful login");
            }

            String token = jwtUtil.generateToken(user.getId(), user.getEmail());
            return new AuthResponse(token);
        }

        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
    }

}
