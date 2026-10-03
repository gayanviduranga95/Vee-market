package com.veemarket.farmer;

import com.veemarket.bid.BidResponse;
import com.veemarket.bid.BidService;
import com.veemarket.farm.Farm;
import com.veemarket.farm.FarmRequest;
import com.veemarket.farm.FarmService;
import com.veemarket.listing.PaddyLotRequest;
import com.veemarket.listing.PaddyLotService;
import com.veemarket.listing.dto.PaddyLotResponse;
import com.veemarket.moisture.MoistureReadingRequest;
import com.veemarket.moisture.MoistureReadingResponse;
import com.veemarket.moisture.MoistureReadingService;
import com.veemarket.user.User;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/farmer")
public class FarmerController {

    private final FarmService farmService;
    private final PaddyLotService paddyLotService;
    private final MoistureReadingService moistureReadingService;
    private final BidService bidService;

    public FarmerController(
            FarmService farmService,
            PaddyLotService paddyLotService,
            MoistureReadingService moistureReadingService,
            BidService bidService
    ) {
        this.farmService = farmService;
        this.paddyLotService = paddyLotService;
        this.moistureReadingService = moistureReadingService;
        this.bidService = bidService;
    }

    @GetMapping("/me")
    public Map<String, Object> getMyProfile(
            Authentication authentication
    ) {

        User user = (User) authentication.getPrincipal();

        return Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "role", user.getRole().name(),
                "deviceNumber",
                user.getDeviceNumber() == null
                        ? ""
                        : user.getDeviceNumber()
        );
    }

    @PostMapping("/farms")
    public Farm createFarm(
            Authentication authentication,
            @Valid @RequestBody FarmRequest request
    ) {

        User user = (User) authentication.getPrincipal();

        return farmService.createFarm(user, request);
    }

    @GetMapping("/farms")
    public List<Farm> getMyFarms(
            Authentication authentication
    ) {

        User user = (User) authentication.getPrincipal();

        return farmService.getMyFarms(user);
    }

    @PostMapping("/lots")
    public PaddyLotResponse createLot(
            Authentication authentication,
            @Valid @RequestBody PaddyLotRequest request
    ) {

        User user = (User) authentication.getPrincipal();

        return paddyLotService.createLot(user, request);
    }

    @GetMapping("/lots")
    public List<PaddyLotResponse> getMyLots(
            Authentication authentication
    ) {

        User user = (User) authentication.getPrincipal();

        return paddyLotService.getMyLots(user);
    }

    @PostMapping("/lots/{lotId}/moisture")
    public ResponseEntity<MoistureReadingResponse> createMoistureReading(
            Authentication authentication,
            @PathVariable Long lotId,
            @Valid @RequestBody MoistureReadingRequest request
    ) {
        User user = (User) authentication.getPrincipal();

        MoistureReadingResponse response = moistureReadingService.createReading(
                user,
                lotId,
                request
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/lots/{lotId}/moisture")
    public List<MoistureReadingResponse> getMoistureReadings(
            Authentication authentication,
            @PathVariable Long lotId
    ) {
        User user = (User) authentication.getPrincipal();

        return moistureReadingService.getReadings(user, lotId);
    }

    @GetMapping("/lots/{lotId}/moisture/latest")
    public MoistureReadingResponse getLatestMoistureReading(
            Authentication authentication,
            @PathVariable Long lotId
    ) {
        User user = (User) authentication.getPrincipal();

        return moistureReadingService.getLatestReading(user, lotId);
    }

    @GetMapping("/lots/{lotId}/bids")
    public List<BidResponse> getLotBids(
            Authentication authentication,
            @PathVariable Long lotId
    ) {
        User user = (User) authentication.getPrincipal();
        return bidService.getLotBids(user, lotId);
    }

    @PostMapping("/bids/{bidId}/accept")
    public BidResponse acceptBid(
            Authentication authentication,
            @PathVariable Long bidId
    ) {
        User user = (User) authentication.getPrincipal();
        return bidService.acceptBid(user, bidId);
    }

    @PostMapping("/bids/{bidId}/reject")
    public BidResponse rejectBid(
            Authentication authentication,
            @PathVariable Long bidId
    ) {
        User user = (User) authentication.getPrincipal();
        return bidService.rejectBid(user, bidId);
    }
}