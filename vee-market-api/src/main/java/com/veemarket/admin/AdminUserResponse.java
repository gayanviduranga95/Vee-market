package com.veemarket.admin;

import com.veemarket.user.Role;
import com.veemarket.farmer.VerificationStatus;

import java.time.LocalDateTime;

public record AdminUserResponse(
        Long id,
        String name,
        String email,
        String phone,
        Role role,
        String profileName,
        VerificationStatus verificationStatus,
        LocalDateTime createdAt
) {}
