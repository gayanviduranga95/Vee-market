package com.veemarket.admin;

import com.veemarket.business.BusinessProfileRepository;
import com.veemarket.farmer.FarmerProfile;
import com.veemarket.farmer.FarmerProfileRepository;
import com.veemarket.farmer.VerificationStatus;
import com.veemarket.mill.MillProfile;
import com.veemarket.mill.MillProfileRepository;
import com.veemarket.user.Role;
import com.veemarket.user.User;
import com.veemarket.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminService {
    private final UserRepository userRepository;
    private final FarmerProfileRepository farmerProfiles;
    private final MillProfileRepository millProfiles;
    private final BusinessProfileRepository businessProfiles;

    public AdminService(
            UserRepository userRepository,
            FarmerProfileRepository farmerProfiles,
            MillProfileRepository millProfiles,
            BusinessProfileRepository businessProfiles
    ) {
        this.userRepository = userRepository;
        this.farmerProfiles = farmerProfiles;
        this.millProfiles = millProfiles;
        this.businessProfiles = businessProfiles;
    }

    @Transactional(readOnly = true)
    public List<AdminUserResponse> getUsers(User admin) {
        requireAdmin(admin);
        return userRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional
    public AdminUserResponse updateVerification(
            User admin,
            Long userId,
            VerificationStatus status
    ) {
        requireAdmin(admin);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        if (user.getRole() == Role.FARMER) {
            FarmerProfile profile = farmerProfiles.findByUserId(userId)
                    .orElseThrow(() -> new EntityNotFoundException("Farmer profile not found"));
            profile.setVerificationStatus(status);
            farmerProfiles.save(profile);
        } else if (user.getRole() == Role.MILL) {
            MillProfile profile = millProfiles.findByUserId(userId)
                    .orElseThrow(() -> new EntityNotFoundException("Mill profile not found"));
            profile.setVerificationStatus(status);
            millProfiles.save(profile);
        } else {
            throw new IllegalArgumentException("Only farmers and mills have verification status");
        }

        return toResponse(user);
    }

    private void requireAdmin(User user) {
        if (user.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Only administrators can access this resource");
        }
    }

    private AdminUserResponse toResponse(User user) {
        String profileName = null;
        VerificationStatus status = null;

        if (user.getRole() == Role.FARMER) {
            FarmerProfile profile = farmerProfiles.findByUserId(user.getId()).orElse(null);
            if (profile != null) status = profile.getVerificationStatus();
        } else if (user.getRole() == Role.MILL) {
            MillProfile profile = millProfiles.findByUserId(user.getId()).orElse(null);
            if (profile != null) {
                profileName = profile.getMillName();
                status = profile.getVerificationStatus();
            }
        } else if (user.getRole() == Role.BUYER) {
            profileName = businessProfiles.findByUserId(user.getId())
                    .map(profile -> profile.getBusinessName())
                    .orElse(null);
        }

        return new AdminUserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                profileName,
                status,
                user.getCreatedAt()
        );
    }
}
