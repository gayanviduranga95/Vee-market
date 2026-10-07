package com.veemarket.business;

import com.veemarket.user.Role;
import com.veemarket.user.User;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BusinessRequirementService {
    private final BusinessRequirementRepository repository;

    public BusinessRequirementService(BusinessRequirementRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public BusinessRequirementResponse create(User user, BusinessRequirementRequest request) {
        requireBuyer(user);
        BusinessRequirement requirement = new BusinessRequirement();
        requirement.setBusinessUser(user);
        requirement.setRiceType(request.getRiceType().trim());
        requirement.setQuantityKg(request.getQuantityKg());
        requirement.setFrequency(request.getFrequency());
        return toResponse(repository.save(requirement));
    }

    @Transactional(readOnly = true)
    public List<BusinessRequirementResponse> getMine(User user) {
        requireBuyer(user);
        return repository.findByBusinessUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BusinessRequirementResponse> getActiveForMill(User user) {
        if (user.getRole() != Role.MILL) {
            throw new AccessDeniedException("Only mills can browse business requirements");
        }
        return repository.findAll().stream()
                .filter(requirement -> "ACTIVE".equals(requirement.getStatus()))
                .map(this::toResponse)
                .toList();
    }

    private void requireBuyer(User user) {
        if (user.getRole() != Role.BUYER) {
            throw new AccessDeniedException("Only shop and hotel users can manage requirements");
        }
    }

    private BusinessRequirementResponse toResponse(BusinessRequirement requirement) {
        return new BusinessRequirementResponse(
                requirement.getId(),
                requirement.getRiceType(),
                requirement.getQuantityKg(),
                requirement.getFrequency(),
                requirement.getStatus(),
                requirement.getCreatedAt()
        );
    }
}
