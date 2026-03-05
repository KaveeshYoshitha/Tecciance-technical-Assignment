package com.ticketing.ticketing_system.service;

import com.ticketing.ticketing_system.dto.LoginRequest;
import com.ticketing.ticketing_system.dto.RegisterRequest;
import com.ticketing.ticketing_system.model.User;
import com.ticketing.ticketing_system.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

@Service
public class AuthService {
    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public void register(RegisterRequest request ){

        if (userRepository.findByEmail(request.getEmail()) != null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use");
        }

        var user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(hashPassword(request.getPassword()));

        userRepository.saveUser(user);
    }


    public boolean login(LoginRequest request ){
        var user = userRepository.findByEmail(request.getEmail());
        if (user == null) {
            return false;
        }
        return passwordsMatch(request.getPassword(), user.getPassword());
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    private String hashPassword(String rawPassword) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawPassword.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder(hash.length * 2);
            for (byte b : hash) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 algorithm is not available", e);
        }
    }

    private boolean passwordsMatch(String rawPassword, String storedHash) {
        String calculated = hashPassword(rawPassword);
        return MessageDigest.isEqual(
                calculated.getBytes(StandardCharsets.UTF_8),
                storedHash.getBytes(StandardCharsets.UTF_8)
        );
    }
}
