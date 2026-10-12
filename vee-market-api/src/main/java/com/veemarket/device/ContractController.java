package com.veemarket.device;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
public class ContractController {

    @GetMapping("/healthz")
    public Map<String, Object> healthz() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("ok", true);
        response.put("server_time", DeviceContractUtils.toLocalIso(Instant.now()));
        return response;
    }

    @GetMapping("/api/contract")
    public Map<String, Object> contract() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("qr_text", "device code only, e.g. VM-0001");
        response.put("session_seconds", DeviceContractUtils.SESSION_SECONDS);
        response.put("device_poll_seconds", DeviceContractUtils.DEVICE_POLL_SECONDS);
        response.put("app_poll_seconds", DeviceContractUtils.APP_POLL_SECONDS);
        response.put("moisture_range_pct", List.of(DeviceContractUtils.MOISTURE_MIN, DeviceContractUtils.MOISTURE_MAX));
        response.put("zone_range_pct", List.of(DeviceContractUtils.ZONE_MIN, DeviceContractUtils.ZONE_MAX));
        response.put("decimals", 1);
        response.put("device_auth_headers", List.of("X-Device-Id", "X-Device-Key"));
        response.put("reading_label", DeviceContractUtils.READING_LABEL);
        return response;
    }
}
