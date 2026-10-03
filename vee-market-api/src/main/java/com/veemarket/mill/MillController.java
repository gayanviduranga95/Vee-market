package com.veemarket.mill;

import com.veemarket.bid.BidRequest;
import com.veemarket.bid.BidResponse;
import com.veemarket.bid.BidService;
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

    public MillController(
            MillProfileService millProfileService,
            BidService bidService
    ) {
        this.millProfileService = millProfileService;
        this.bidService = bidService;
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
}
