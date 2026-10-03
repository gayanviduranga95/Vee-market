package com.veemarket.mill;

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

    public MillController(MillProfileService millProfileService) {
        this.millProfileService = millProfileService;
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
}
