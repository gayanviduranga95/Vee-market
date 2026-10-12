package com.veemarket.device;

import com.veemarket.device.dto.ReadingRequest;
import com.veemarket.device.dto.StartTestRequest;
import com.veemarket.user.User;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
public class DeviceApiController {

    private final DeviceService deviceService;

    public DeviceApiController(DeviceService deviceService) {
        this.deviceService = deviceService;
    }

    // --- Farmer Test Endpoints ---

    @PostMapping("/api/tests/start")
    public ResponseEntity<Map<String, Object>> startTest(
            @AuthenticationPrincipal User farmer,
            @RequestBody StartTestRequest body
    ) {
        if (farmer == null) {
            throw new DeviceContractException(HttpStatus.UNAUTHORIZED, "not_logged_in", "Farmer login required.");
        }
        Map<String, Object> response = deviceService.startTest(farmer, body);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/tests/{sessionId}")
    public ResponseEntity<Map<String, Object>> getTest(
            @AuthenticationPrincipal User farmer,
            @PathVariable Long sessionId
    ) {
        if (farmer == null) {
            throw new DeviceContractException(HttpStatus.UNAUTHORIZED, "not_logged_in", "Farmer login required.");
        }
        Map<String, Object> response = deviceService.getTest(farmer, sessionId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/tests/{sessionId}/cancel")
    public ResponseEntity<Map<String, Object>> cancelTest(
            @AuthenticationPrincipal User farmer,
            @PathVariable Long sessionId
    ) {
        if (farmer == null) {
            throw new DeviceContractException(HttpStatus.UNAUTHORIZED, "not_logged_in", "Farmer login required.");
        }
        Map<String, Object> response = deviceService.cancelTest(farmer, sessionId);
        return ResponseEntity.ok(response);
    }

    // --- Device Hardware Endpoints ---

    @PostMapping("/api/device/poll")
    public ResponseEntity<Map<String, Object>> poll(
            @RequestHeader(value = "X-Device-Id", required = false) String deviceId,
            @RequestHeader(value = "X-Device-Key", required = false) String deviceKey
    ) {
        Device device = deviceService.authenticateDevice(deviceId, deviceKey);
        Map<String, Object> response = deviceService.pollDevice(device);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/device/reading")
    public ResponseEntity<Map<String, Object>> reading(
            @RequestHeader(value = "X-Device-Id", required = false) String deviceId,
            @RequestHeader(value = "X-Device-Key", required = false) String deviceKey,
            @RequestBody ReadingRequest body
    ) {
        Device device = deviceService.authenticateDevice(deviceId, deviceKey);
        Map<String, Object> response = deviceService.submitReading(device, body);
        return ResponseEntity.ok(response);
    }
}
