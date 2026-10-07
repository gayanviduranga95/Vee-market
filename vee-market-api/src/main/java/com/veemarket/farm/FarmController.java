package com.veemarket.farm;

import com.veemarket.user.User;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/farmer")
public class FarmController {

    private final FarmService farmService;

    public FarmController(FarmService farmService) {
        this.farmService = farmService;
    }

    // =========================================================
    // CREATE FARM
    // =========================================================

    @PostMapping("/farms")
    public FarmResponse createFarm(
            Authentication authentication,
            @Valid @RequestBody FarmRequest request
    ) {

        User user = (User) authentication.getPrincipal();

        return farmService.createFarm(user, request);
    }

    // =========================================================
    // GET MY FARMS
    // =========================================================

    @GetMapping("/farms")
    public List<FarmResponse> getMyFarms(
            Authentication authentication
    ) {

        User user = (User) authentication.getPrincipal();

        return farmService.getMyFarms(user);
    }
}
