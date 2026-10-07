package com.veemarket.auth;

import com.veemarket.auth.dto.RegisterRequest;
import com.veemarket.user.User;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.veemarket.auth.dto.LoginRequest;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @Valid @RequestBody RegisterRequest request
    ) {

        try {
            User user = authService.register(request);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(Map.of(
                            "message", "Registration successful",
                            "userId", user.getId(),
                            "name", user.getName(),
                            "email", user.getEmail(),
                            "role", user.getRole().name()
                    ));

        } catch (IllegalArgumentException ex) {

            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "message", ex.getMessage()
                    ));
        }
    }
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Valid @RequestBody LoginRequest request
    ) {

        try {
                        AuthService.LoginResult result = authService.login(request);

            return ResponseEntity.ok(
                    Map.of(
                            "message", "Login successful",
                                                "token", result.token(),
                                                "userId", result.user().getId(),
                                                "email", result.user().getEmail(),
                                                "role", result.user().getRole().name()
                    )
            );

        } catch (IllegalArgumentException ex) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "message", ex.getMessage()
                    ));
        }
    }
}
