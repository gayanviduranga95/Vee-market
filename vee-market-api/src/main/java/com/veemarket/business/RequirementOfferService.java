package com.veemarket.business;

import com.veemarket.user.Role;
import com.veemarket.user.User;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RequirementOfferService {
    private final BusinessRequirementRepository requirementRepository;
    private final RequirementOfferRepository offerRepository;

    public RequirementOfferService(BusinessRequirementRepository requirementRepository, RequirementOfferRepository offerRepository) {
        this.requirementRepository = requirementRepository;
        this.offerRepository = offerRepository;
    }

    @Transactional
    public RequirementOfferResponse createOffer(User mill, Long requirementId, RequirementOfferRequest request) {
        requireRole(mill, Role.MILL);
        BusinessRequirement requirement = getRequirement(requirementId);
        if (!"ACTIVE".equals(requirement.getStatus())) throw new IllegalArgumentException("Requirement is not active");
        if (offerRepository.findByRequirementIdAndMillUserId(requirementId, mill.getId()).isPresent()) throw new IllegalArgumentException("You already offered on this requirement");
        RequirementOffer offer = new RequirementOffer();
        offer.setRequirement(requirement);
        offer.setMillUser(mill);
        offer.setPricePerKg(request.getPricePerKg());
        return toResponse(offerRepository.save(offer));
    }

    @Transactional(readOnly = true)
    public List<RequirementOfferResponse> getForRequirement(User buyer, Long requirementId) {
        requireRole(buyer, Role.BUYER);
        BusinessRequirement requirement = getRequirement(requirementId);
        validateBuyerOwns(buyer, requirement);
        return offerRepository.findByRequirementIdOrderByCreatedAtDesc(requirementId).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<RequirementOfferResponse> getMillOffers(User mill) {
        requireRole(mill, Role.MILL);
        return offerRepository.findByMillUserIdOrderByCreatedAtDesc(mill.getId()).stream().map(this::toResponse).toList();
    }

    @Transactional
    public RequirementOfferResponse updateStatus(User buyer, Long offerId, RequirementOfferStatus status) {
        requireRole(buyer, Role.BUYER);
        RequirementOffer offer = offerRepository.findById(offerId).orElseThrow(() -> new EntityNotFoundException("Requirement offer not found"));
        validateBuyerOwns(buyer, offer.getRequirement());
        if (status == RequirementOfferStatus.ACCEPTED) {
            offerRepository.findByRequirementIdOrderByCreatedAtDesc(offer.getRequirement().getId()).forEach(other -> {
                if (!other.getId().equals(offerId) && other.getStatus() == RequirementOfferStatus.PENDING) other.setStatus(RequirementOfferStatus.REJECTED);
            });
        }
        offer.setStatus(status);
        return toResponse(offerRepository.save(offer));
    }

    private BusinessRequirement getRequirement(Long id) { return requirementRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Business requirement not found")); }
    private void validateBuyerOwns(User user, BusinessRequirement requirement) { if (!requirement.getBusinessUser().getId().equals(user.getId())) throw new AccessDeniedException("You can only manage your own requirements"); }
    private void requireRole(User user, Role role) { if (user.getRole() != role) throw new AccessDeniedException("This action is not available for this account"); }
    private RequirementOfferResponse toResponse(RequirementOffer offer) { return new RequirementOfferResponse(offer.getId(), offer.getRequirement().getId(), offer.getMillUser().getName(), offer.getPricePerKg(), offer.getStatus(), offer.getCreatedAt()); }
}
