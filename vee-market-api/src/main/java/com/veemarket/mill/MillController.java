package com.veemarket.mill;

import com.veemarket.bid.BidRequest;
import com.veemarket.bid.BidResponse;
import com.veemarket.bid.BidService;
import com.veemarket.deal.DealResponse;
import com.veemarket.deal.DealService;
import com.veemarket.deal.DealStatusUpdateRequest;
import com.veemarket.business.RequirementOfferRequest;
import com.veemarket.business.RequirementOfferResponse;
import com.veemarket.business.RequirementOfferService;
import com.veemarket.business.BusinessRequirementResponse;
import com.veemarket.business.BusinessRequirementService;
import com.veemarket.user.User;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mill")
public class MillController {

    private final MillProfileService millProfileService;
    private final BidService bidService;
    private final DealService dealService;
    private final RequirementOfferService requirementOfferService;
    private final BusinessRequirementService businessRequirementService;

    public MillController(
            MillProfileService millProfileService,
            BidService bidService,
            DealService dealService,
            RequirementOfferService requirementOfferService,
            BusinessRequirementService businessRequirementService
    ) {
        this.millProfileService = millProfileService;
        this.bidService = bidService;
        this.dealService = dealService;
        this.requirementOfferService = requirementOfferService;
        this.businessRequirementService = businessRequirementService;
    }

    @PostMapping("/profile")
    public ResponseEntity<MillProfileResponse> createProfile(
            Authentication authentication,
            @Valid @RequestBody MillProfileRequest request
    ) {
        User user = (User) authentication.getPrincipal();

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(millProfileService.createProfile(user, request));
    }

    @GetMapping("/profile")
    public MillProfileResponse getProfile(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return millProfileService.getProfile(user);
    }

    @GetMapping("/lots")
    public List<MillLotResponse> getActiveLots(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        if (user.getRole() == null || !"MILL".equals(user.getRole().name())) {
            throw new IllegalArgumentException("Only mill users can browse paddy lots");
        }
        return millProfileService.getAvailableLots();
    }

    @GetMapping("/lots/{lotId}")
    public MillLotResponse getLot(
            Authentication authentication,
            @PathVariable Long lotId
    ) {
        User user = (User) authentication.getPrincipal();
        if (user.getRole() == null || !"MILL".equals(user.getRole().name())) {
            throw new IllegalArgumentException("Only mill users can view paddy lots");
        }
        return millProfileService.getLot(lotId);
    }

    @PostMapping("/lots/{lotId}/bids")
    public ResponseEntity<BidResponse> createBid(
            Authentication authentication,
            @PathVariable Long lotId,
            @Valid @RequestBody BidRequest request
    ) {
        User user = (User) authentication.getPrincipal();
        BidResponse response = bidService.createBid(user, lotId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/bids")
    public List<BidResponse> getMyBids(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return bidService.getMyBids(user);
    }

    @GetMapping("/bids/{bidId}")
    public BidResponse getMyBid(
            Authentication authentication,
            @PathVariable Long bidId
    ) {
        User user = (User) authentication.getPrincipal();
        return bidService.getMyBid(user, bidId);
    }

    @PostMapping("/bids/{bidId}/withdraw")
    public BidResponse withdrawBid(
            Authentication authentication,
            @PathVariable Long bidId
    ) {
        User user = (User) authentication.getPrincipal();
        return bidService.withdrawBid(user, bidId);
    }

    @GetMapping("/deals")
    public List<DealResponse> getDeals(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return dealService.getDeals(user);
    }

    @PostMapping("/deals/{dealId}/confirm")
    public DealResponse confirmDeal(
            Authentication authentication,
            @PathVariable Long dealId
    ) {
        User user = (User) authentication.getPrincipal();
        return dealService.confirm(user, dealId);
    }

    @PostMapping("/deals/{dealId}/payment")
    public DealResponse updatePayment(
            Authentication authentication,
            @PathVariable Long dealId,
            @Valid @RequestBody DealStatusUpdateRequest request
    ) {
        User user = (User) authentication.getPrincipal();
        return dealService.updatePayment(user, dealId, request.getStatus());
    }

    @PostMapping("/deals/{dealId}/delivery")
    public DealResponse updateDelivery(
            Authentication authentication,
            @PathVariable Long dealId,
            @Valid @RequestBody DealStatusUpdateRequest request
    ) {
        User user = (User) authentication.getPrincipal();
        return dealService.updateDelivery(user, dealId, request.getStatus());
    }

    @GetMapping("/requirements/offers")
    public List<RequirementOfferResponse> getRequirementOffers(Authentication authentication) {
        return requirementOfferService.getMillOffers((User) authentication.getPrincipal());
    }

    @GetMapping("/requirements")
    public List<BusinessRequirementResponse> getRequirements(Authentication authentication) {
        return businessRequirementService.getActiveForMill((User) authentication.getPrincipal());
    }

    @PostMapping("/requirements/{requirementId}/offers")
    public ResponseEntity<RequirementOfferResponse> createRequirementOffer(
            Authentication authentication,
            @PathVariable Long requirementId,
            @Valid @RequestBody RequirementOfferRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                requirementOfferService.createOffer(
                        (User) authentication.getPrincipal(), requirementId, request));
    }
}
