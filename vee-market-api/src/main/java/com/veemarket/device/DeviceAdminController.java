package com.veemarket.device;

import com.veemarket.device.dto.DeviceAdminCreateRequest;
import com.veemarket.device.dto.DeviceAdminStatusRequest;
import com.veemarket.device.dto.FarmerAdminCreateRequest;
import com.veemarket.user.User;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class DeviceAdminController {

    private final DeviceService deviceService;

    public DeviceAdminController(DeviceService deviceService) {
        this.deviceService = deviceService;
    }

    @GetMapping("/devices")
    public ResponseEntity<List<Map<String, Object>>> getDevices(
            @AuthenticationPrincipal User user,
            @RequestHeader(value = "X-Admin-Token", required = false) String adminToken
    ) {
        List<Map<String, Object>> response = deviceService.adminGetDevices(user, adminToken);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/devices/{deviceCode}")
    public ResponseEntity<Map<String, Object>> getDevice(
            @AuthenticationPrincipal User user,
            @RequestHeader(value = "X-Admin-Token", required = false) String adminToken,
            @PathVariable String deviceCode
    ) {
        Map<String, Object> response = deviceService.adminGetDevice(user, adminToken, deviceCode);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/devices")
    public ResponseEntity<Map<String, Object>> createDevice(
            @AuthenticationPrincipal User user,
            @RequestHeader(value = "X-Admin-Token", required = false) String adminToken,
            @RequestBody DeviceAdminCreateRequest body
    ) {
        Map<String, Object> response = deviceService.adminCreateDevice(user, adminToken, body);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/devices/{deviceCode}")
    public ResponseEntity<Map<String, Object>> updateDeviceStatus(
            @AuthenticationPrincipal User user,
            @RequestHeader(value = "X-Admin-Token", required = false) String adminToken,
            @PathVariable String deviceCode,
            @RequestBody DeviceAdminStatusRequest body
    ) {
        Map<String, Object> response = deviceService.adminSetDeviceStatus(user, adminToken, deviceCode, body);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/devices/{deviceCode}/rotate-key")
    public ResponseEntity<Map<String, Object>> rotateDeviceKey(
            @AuthenticationPrincipal User user,
            @RequestHeader(value = "X-Admin-Token", required = false) String adminToken,
            @PathVariable String deviceCode
    ) {
        Map<String, Object> response = deviceService.adminRotateDeviceKey(user, adminToken, deviceCode);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/farmers")
    public ResponseEntity<Map<String, Object>> createFarmer(
            @RequestHeader(value = "X-Admin-Token", required = false) String adminToken,
            @RequestBody FarmerAdminCreateRequest body
    ) {
        Map<String, Object> response = deviceService.adminCreateFarmer(adminToken, body);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
