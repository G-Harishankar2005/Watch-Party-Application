package com.watchparty.controller;

import com.watchparty.dto.LoginRequest;
import com.watchparty.dto.LoginResponse;
import com.watchparty.dto.RegisterRequest;
import com.watchparty.dto.RegisterResponse;
import com.watchparty.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5174")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public RegisterResponse register(@RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }
}