package com.veemarket.business;

import com.veemarket.user.Role;
import com.veemarket.user.User;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BusinessProfileService {
    private final BusinessProfileRepository repository;

    public BusinessProfileService(BusinessProfileRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public BusinessProfileResponse create(User user, BusinessProfileRequest request) {
        requireBuyer(user);
        if (repository.findByUserId(user.getId()).isPresent()) {
            throw new IllegalArgumentException("Business profile already exists");
        }

        BusinessProfile profile = new BusinessProfile();
        profile.setUser(user);
        profile.setBusinessType(request.getBusinessType());
        profile.setBusinessName(request.getBusinessName().trim());
        profile.setLocation(request.getLocation() == null ? null : request.getLocation().trim());
        return toResponse(repository.save(profile));
    }

    @Transactional(readOnly = true)
    public BusinessProfileResponse get(User user) {
        requireBuyer(user);
        return repository.findByUserId(user.getId())
                .map(this::toResponse)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Business profile not found"));
    }

    private void requireBuyer(User user) {
        if (user.getRole() != Role.BUYER) {
            throw new AccessDeniedException("Only shop and hotel users can access this profile");
        }
    }

    private BusinessProfileResponse toResponse(BusinessProfile profile) {
        return new BusinessProfileResponse(
                profile.getId(),
                profile.getBusinessType(),
                profile.getBusinessName(),
                profile.getLocation()
        );
    }
}
