package com.veemarket.business;

import com.veemarket.user.User;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/business", "/api/business/profile"})
public class BusinessController {
    private final BusinessProfileService service;
    private final BusinessRequirementService requirementService;
    private final RequirementOfferService offerService;

    public BusinessController(
            BusinessProfileService service,
            BusinessRequirementService requirementService,
            RequirementOfferService offerService
    ) {
        this.service = service;
        this.requirementService = requirementService;
        this.offerService = offerService;
    }

    @PostMapping
    public ResponseEntity<BusinessProfileResponse> create(
            Authentication authentication,
            @Valid @RequestBody BusinessProfileRequest request
    ) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(user, request));
    }

    @GetMapping
    public BusinessProfileResponse get(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return service.get(user);
    }

    @PostMapping("/requirements")
    public ResponseEntity<BusinessRequirementResponse> createRequirement(
            Authentication authentication,
            @Valid @RequestBody BusinessRequirementRequest request
    ) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(requirementService.create(user, request));
    }

    @GetMapping("/requirements")
    public java.util.List<BusinessRequirementResponse> getRequirements(
            Authentication authentication
    ) {
        User user = (User) authentication.getPrincipal();
        return requirementService.getMine(user);
    }

    @GetMapping("/requirements/{requirementId}/offers")
    public java.util.List<RequirementOfferResponse> getOffers(
            Authentication authentication,
            @PathVariable Long requirementId
    ) {
        return offerService.getForRequirement(
                (User) authentication.getPrincipal(), requirementId);
    }

    @PatchMapping("/offers/{offerId}")
    public RequirementOfferResponse updateOffer(
            Authentication authentication,
            @PathVariable Long offerId,
            @RequestParam RequirementOfferStatus status
    ) {
        return offerService.updateStatus(
                (User) authentication.getPrincipal(), offerId, status);
    }
}
