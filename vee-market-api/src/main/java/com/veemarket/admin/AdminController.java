package com.veemarket.admin;

import com.veemarket.user.User;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final AdminService service;

    public AdminController(AdminService service) {
        this.service = service;
    }

    @GetMapping("/users")
    public List<AdminUserResponse> getUsers(Authentication authentication) {
        return service.getUsers((User) authentication.getPrincipal());
    }

    @PatchMapping("/users/{userId}/verification")
    public AdminUserResponse updateVerification(
            Authentication authentication,
            @PathVariable Long userId,
            @Valid @RequestBody VerificationUpdateRequest request
    ) {
        return service.updateVerification(
                (User) authentication.getPrincipal(),
                userId,
                request.getStatus()
        );
    }
}
