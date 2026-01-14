package com.watchparty.service;

import com.watchparty.dto.LoginRequest;
import com.watchparty.dto.LoginResponse;
import com.watchparty.dto.RegisterRequest;
import com.watchparty.dto.RegisterResponse;
import com.watchparty.model.User;
import com.watchparty.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.watchparty.security.JwtUtil;
import java.time.LocalDateTime;

@Service

@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public RegisterResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword())) // hashing later
                .createdAt(LocalDateTime.now())
                .build();

        userRepository.save(user);

        return new RegisterResponse("User registered successfully");
    }
    private final JwtUtil jwtUtil;

    public LoginResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(user.getEmail());
        return new LoginResponse(token);
    }

}
