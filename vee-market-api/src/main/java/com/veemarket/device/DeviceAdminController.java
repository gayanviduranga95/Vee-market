package com.veemarket.device;

import com.veemarket.device.dto.DeviceAdminCreateRequest;
import com.veemarket.device.dto.DeviceAdminStatusRequest;
import com.veemarket.device.dto.FarmerAdminCreateRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class DeviceAdminController {

    private final DeviceService deviceService;

    public DeviceAdminController(DeviceService deviceService) {
        this.deviceService = deviceService;
    }

    @PostMapping("/devices")
    public ResponseEntity<Map<String, Object>> createDevice(
            @RequestHeader(value = "X-Admin-Token", required = false) String adminToken,
            @RequestBody DeviceAdminCreateRequest body
    ) {
        Map<String, Object> response = deviceService.adminCreateDevice(adminToken, body);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/devices/{deviceCode}")
    public ResponseEntity<Map<String, Object>> updateDeviceStatus(
            @RequestHeader(value = "X-Admin-Token", required = false) String adminToken,
            @PathVariable String deviceCode,
            @RequestBody DeviceAdminStatusRequest body
    ) {
        Map<String, Object> response = deviceService.adminSetDeviceStatus(adminToken, deviceCode, body);
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
