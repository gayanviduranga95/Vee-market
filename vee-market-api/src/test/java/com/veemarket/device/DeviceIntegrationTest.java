package com.veemarket.device;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.veemarket.device.dto.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class DeviceIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    @DisplayName("Healthz endpoint returns ok and local timestamp")
    void healthzEndpointWorks() throws Exception {
        mockMvc.perform(get("/healthz"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ok").value(true))
                .andExpect(jsonPath("$.server_time", containsString("+05:30")));
    }

    @Test
    @DisplayName("Contract endpoint returns agreed numbers")
    void contractEndpointReturnsAgreedNumbers() throws Exception {
        mockMvc.perform(get("/api/contract"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.session_seconds").value(300))
                .andExpect(jsonPath("$.device_poll_seconds").value(2))
                .andExpect(jsonPath("$.moisture_range_pct[0]").value(5.0))
                .andExpect(jsonPath("$.moisture_range_pct[1]").value(40.0))
                .andExpect(jsonPath("$.reading_label").value("Device reading"));
    }

    @Test
    @DisplayName("Complete test session flow with device polling and measurement submission")
    void completeDeviceWorkflow() throws Exception {
        String adminToken = "dev-admin-token";
        String deviceCode = "VM-TEST-" + System.currentTimeMillis();

        // 1. Provision device
        MvcResult devRes = mockMvc.perform(post("/api/admin/devices")
                        .header("X-Admin-Token", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new DeviceAdminCreateRequest(deviceCode))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.device_code").value(deviceCode))
                .andExpect(jsonPath("$.secret").isNotEmpty())
                .andReturn();

        Map<?, ?> devMap = objectMapper.readValue(devRes.getResponse().getContentAsString(), Map.class);
        String deviceKey = (String) devMap.get("secret");

        // 2. Provision farmer
        MvcResult farmerRes = mockMvc.perform(post("/api/admin/farmers")
                        .header("X-Admin-Token", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new FarmerAdminCreateRequest("Sunil", "0771234567"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andReturn();

        Map<?, ?> farmerMap = objectMapper.readValue(farmerRes.getResponse().getContentAsString(), Map.class);
        String farmerToken = (String) farmerMap.get("token");

        // 3. Create lot
        LotCreateRequest lotReq = new LotCreateRequest();
        lotReq.setVariety("Keeri Samba");
        lotReq.setQuantityKg(2500.0);
        lotReq.setLotCode("L-SUNIL-" + (System.currentTimeMillis() % 10000));

        MvcResult lotRes = mockMvc.perform(post("/api/lots")
                        .header("Authorization", "Bearer " + farmerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(lotReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.lot_id").isNotEmpty())
                .andReturn();

        Map<?, ?> lotMap = objectMapper.readValue(lotRes.getResponse().getContentAsString(), Map.class);
        Number lotIdNum = (Number) lotMap.get("lot_id");
        Long lotId = lotIdNum.longValue();

        // 4. Idle device poll -> session null
        mockMvc.perform(post("/api/device/poll")
                        .header("X-Device-Id", deviceCode)
                        .header("X-Device-Key", deviceKey))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.session").value(nullValue()));

        // 5. Start test session
        StartTestRequest startReq = new StartTestRequest(deviceCode, lotId);
        MvcResult startRes = mockMvc.perform(post("/api/tests/start")
                        .header("Authorization", "Bearer " + farmerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(startReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.session_id").isNotEmpty())
                .andExpect(jsonPath("$.status").value("open"))
                .andExpect(jsonPath("$.expires_at", containsString("+05:30")))
                .andReturn();

        Map<?, ?> startMap = objectMapper.readValue(startRes.getResponse().getContentAsString(), Map.class);
        Number sidNum = (Number) startMap.get("session_id");
        Long sessionId = sidNum.longValue();

        // 6. Device busy: 2nd start returns 409
        mockMvc.perform(post("/api/tests/start")
                        .header("Authorization", "Bearer " + farmerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(startReq)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error.code").value("device_busy"));

        // 7. Device polls and gets open session
        mockMvc.perform(post("/api/device/poll")
                        .header("X-Device-Id", deviceCode)
                        .header("X-Device-Key", deviceKey))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.session.id").value(sessionId))
                .andExpect(jsonPath("$.session.farmer_name").value("Sunil"));

        // 8. 422 out of range: moisture 80.0
        ReadingRequest badReading = new ReadingRequest();
        badReading.setSessionId(sessionId);
        badReading.setMoisturePct(80.0);
        badReading.setZones(new ZonesDto(78.0, 80.0, 82.0));
        badReading.setSpreadPct(4.0);
        badReading.setCalibrationVersion("cal-v1");

        mockMvc.perform(post("/api/device/reading")
                        .header("X-Device-Id", deviceCode)
                        .header("X-Device-Key", deviceKey)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(badReading)))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.error.code").value("value_out_of_range"));

        // 9. Verify 422 leaves session open
        mockMvc.perform(post("/api/device/poll")
                        .header("X-Device-Id", deviceCode)
                        .header("X-Device-Key", deviceKey))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.session.id").value(sessionId));

        // 10. Valid reading
        ReadingRequest goodReading = new ReadingRequest();
        goodReading.setSessionId(sessionId);
        goodReading.setMoisturePct(13.8);
        goodReading.setZones(new ZonesDto(13.4, 13.9, 14.1));
        goodReading.setSpreadPct(0.7);
        goodReading.setTempC(28.5);
        goodReading.setCalibrationVersion("cal-v1");
        goodReading.setFirmware("fw-1.0.0");

        MvcResult readingRes = mockMvc.perform(post("/api/device/reading")
                        .header("X-Device-Id", deviceCode)
                        .header("X-Device-Key", deviceKey)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(goodReading)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ok").value(true))
                .andExpect(jsonPath("$.reading_id").isNotEmpty())
                .andReturn();

        Map<?, ?> rMap = objectMapper.readValue(readingRes.getResponse().getContentAsString(), Map.class);
        Number rIdNum = (Number) rMap.get("reading_id");

        // 11. Replayed reading -> idempotent, returns same reading_id with duplicate: true
        mockMvc.perform(post("/api/device/reading")
                        .header("X-Device-Id", deviceCode)
                        .header("X-Device-Key", deviceKey)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(goodReading)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ok").value(true))
                .andExpect(jsonPath("$.reading_id").value(rIdNum))
                .andExpect(jsonPath("$.duplicate").value(true));

        // 12. Farmer checks test status: status is "done", reading has "Device reading" label and no leaked internal fields
        mockMvc.perform(get("/api/tests/" + sessionId)
                        .header("Authorization", "Bearer " + farmerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("done"))
                .andExpect(jsonPath("$.reading.moisture_pct").value(13.8))
                .andExpect(jsonPath("$.reading.spread_pct").value(0.7))
                .andExpect(jsonPath("$.reading.temp_c").value(28.5))
                .andExpect(jsonPath("$.reading.label").value("Device reading"))
                .andExpect(jsonPath("$.reading.session_id").doesNotExist())
                .andExpect(jsonPath("$.reading.reading_id").doesNotExist())
                .andExpect(jsonPath("$.reading.firmware").doesNotExist());

        // 13. Device is idle again
        mockMvc.perform(post("/api/device/poll")
                        .header("X-Device-Id", deviceCode)
                        .header("X-Device-Key", deviceKey))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.session").value(nullValue()));
    }

    @Test
    @DisplayName("Device provisioning security, validation, enabling/disabling and persistence")
    void deviceProvisioningAndSecurityLifecycle() throws Exception {
        String adminToken = "dev-admin-token";
        String provDeviceCode = "VM-SEC-" + System.currentTimeMillis();

        // 1. Unauthorized provisioning attempt (no admin token or wrong token)
        mockMvc.perform(post("/api/admin/devices")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new DeviceAdminCreateRequest(provDeviceCode))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error.code").value("bad_admin_token"));

        mockMvc.perform(post("/api/admin/devices")
                        .header("X-Admin-Token", "wrong-admin-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new DeviceAdminCreateRequest(provDeviceCode))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error.code").value("bad_admin_token"));

        // 2. Successful provisioning by authorized administrator
        MvcResult provRes = mockMvc.perform(post("/api/admin/devices")
                        .header("X-Admin-Token", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new DeviceAdminCreateRequest(provDeviceCode))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.device_code").value(provDeviceCode))
                .andExpect(jsonPath("$.secret").isNotEmpty())
                .andExpect(jsonPath("$.warning").isNotEmpty())
                .andReturn();

        Map<?, ?> provMap = objectMapper.readValue(provRes.getResponse().getContentAsString(), Map.class);
        String deviceKey = (String) provMap.get("secret");

        // 3. Duplicate device ID attempt fails with 409 Conflict
        mockMvc.perform(post("/api/admin/devices")
                        .header("X-Admin-Token", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new DeviceAdminCreateRequest(provDeviceCode))))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error.code").value("device_exists"));

        // 4. Unknown device receives 401 bad_device_key
        mockMvc.perform(post("/api/device/poll")
                        .header("X-Device-Id", "VM-NONEXISTENT")
                        .header("X-Device-Key", deviceKey))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error.code").value("bad_device_key"));

        // 5. Incorrect device key receives 401 bad_device_key
        mockMvc.perform(post("/api/device/poll")
                        .header("X-Device-Id", provDeviceCode)
                        .header("X-Device-Key", "definitely-wrong-secret-key"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error.code").value("bad_device_key"));

        // 6. Valid device key authenticates successfully
        mockMvc.perform(post("/api/device/poll")
                        .header("X-Device-Id", provDeviceCode)
                        .header("X-Device-Key", deviceKey))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.session").value(nullValue()));

        // 7. Disable the device
        DeviceAdminStatusRequest disableReq = new DeviceAdminStatusRequest();
        disableReq.setStatus("disabled");

        mockMvc.perform(patch("/api/admin/devices/" + provDeviceCode)
                        .header("X-Admin-Token", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(disableReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.device_code").value(provDeviceCode))
                .andExpect(jsonPath("$.status").value("disabled"));

        // 8. Disabled device receives 403 device_disabled on polling
        mockMvc.perform(post("/api/device/poll")
                        .header("X-Device-Id", provDeviceCode)
                        .header("X-Device-Key", deviceKey))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error.code").value("device_disabled"));

        // 9. Re-enable the device
        DeviceAdminStatusRequest enableReq = new DeviceAdminStatusRequest();
        enableReq.setStatus("active");

        mockMvc.perform(patch("/api/admin/devices/" + provDeviceCode)
                        .header("X-Admin-Token", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(enableReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.device_code").value(provDeviceCode))
                .andExpect(jsonPath("$.status").value("active"));

        // 10. Device can authenticate again
        mockMvc.perform(post("/api/device/poll")
                        .header("X-Device-Id", provDeviceCode)
                        .header("X-Device-Key", deviceKey))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.session").value(nullValue()));
    }
}

