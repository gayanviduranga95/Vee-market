package com.veemarket.device;

import com.veemarket.device.dto.LotCreateRequest;
import com.veemarket.device.dto.LotPatchRequest;
import com.veemarket.user.User;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/lots")
public class ReferenceLotController {

    private final DeviceService deviceService;

    public ReferenceLotController(DeviceService deviceService) {
        this.deviceService = deviceService;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createLot(
            @AuthenticationPrincipal User farmer,
            @RequestBody LotCreateRequest body
    ) {
        if (farmer == null) {
            throw new DeviceContractException(HttpStatus.UNAUTHORIZED, "not_logged_in", "Farmer login required.");
        }
        Map<String, Object> response = deviceService.createLot(farmer, body);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getLot(
            @AuthenticationPrincipal User farmer,
            @PathVariable Long id
    ) {
        if (farmer == null) {
            throw new DeviceContractException(HttpStatus.UNAUTHORIZED, "not_logged_in", "Farmer login required.");
        }
        Map<String, Object> response = deviceService.getLot(farmer, id);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Map<String, Object>> patchLot(
            @AuthenticationPrincipal User farmer,
            @PathVariable Long id,
            @RequestBody LotPatchRequest body
    ) {
        if (farmer == null) {
            throw new DeviceContractException(HttpStatus.UNAUTHORIZED, "not_logged_in", "Farmer login required.");
        }
        Map<String, Object> response = deviceService.patchLot(farmer, id, body);
        return ResponseEntity.ok(response);
    }
}
