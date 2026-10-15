package com.veemarket.device;

import com.veemarket.device.dto.*;
import com.veemarket.farm.Farm;
import com.veemarket.farm.FarmRepository;
import com.veemarket.farmer.FarmerProfile;
import com.veemarket.farmer.FarmerProfileRepository;
import com.veemarket.listing.PaddyLot;
import com.veemarket.listing.PaddyLotRepository;
import com.veemarket.moisture.MoistureReading;
import com.veemarket.moisture.MoistureReadingRepository;
import com.veemarket.security.JwtService;
import com.veemarket.user.Role;
import com.veemarket.user.User;
import com.veemarket.user.UserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class DeviceService {

    private final DeviceRepository deviceRepository;
    private final TestSessionRepository testSessionRepository;
    private final ReadingRepository readingRepository;
    private final PaddyLotRepository paddyLotRepository;
    private final UserRepository userRepository;
    private final FarmerProfileRepository farmerProfileRepository;
    private final FarmRepository farmRepository;
    private final MoistureReadingRepository moistureReadingRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public DeviceService(
            DeviceRepository deviceRepository,
            TestSessionRepository testSessionRepository,
            ReadingRepository readingRepository,
            PaddyLotRepository paddyLotRepository,
            UserRepository userRepository,
            FarmerProfileRepository farmerProfileRepository,
            FarmRepository farmRepository,
            MoistureReadingRepository moistureReadingRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.deviceRepository = deviceRepository;
        this.testSessionRepository = testSessionRepository;
        this.readingRepository = readingRepository;
        this.paddyLotRepository = paddyLotRepository;
        this.userRepository = userRepository;
        this.farmerProfileRepository = farmerProfileRepository;
        this.farmRepository = farmRepository;
        this.moistureReadingRepository = moistureReadingRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public void expireDueSessions() {
        testSessionRepository.expireDueSessions(Instant.now());
    }

    public Device authenticateDevice(String deviceCode, String deviceKey) {
        if (deviceCode == null || deviceCode.isBlank() || deviceKey == null || deviceKey.isBlank()) {
            throw new DeviceContractException(HttpStatus.UNAUTHORIZED, "bad_device_key", "Device ID or key is not valid.");
        }

        Device device = deviceRepository.findByDeviceCode(deviceCode.trim()).orElse(null);
        if (device == null || !passwordEncoder.matches(deviceKey.trim(), device.getSecretHash())) {
            throw new DeviceContractException(HttpStatus.UNAUTHORIZED, "bad_device_key", "Device ID or key is not valid.");
        }

        if (!"active".equalsIgnoreCase(device.getStatus())) {
            throw new DeviceContractException(HttpStatus.FORBIDDEN, "device_disabled", "This device is disabled.");
        }

        device.setLastSeenAt(Instant.now());
        deviceRepository.save(device);
        return device;
    }

    @org.springframework.beans.factory.annotation.Value("${vee.admin.token:dev-admin-token}")
    private String configuredAdminToken;

    public void validateAdminToken(String adminToken) {
        validateAdminAccess(null, adminToken);
    }

    public void validateAdminAccess(User user, String adminToken) {
        if (user != null && user.getRole() == Role.ADMIN) {
            return;
        }
        if (adminToken != null && !adminToken.isBlank() && configuredAdminToken != null
                && !configuredAdminToken.isBlank() && configuredAdminToken.equals(adminToken.trim())) {
            return;
        }
        throw new DeviceContractException(HttpStatus.UNAUTHORIZED, "bad_admin_token", "Admin authorization required.");
    }

    @Transactional
    public Map<String, Object> startTest(User farmer, StartTestRequest request) {
        expireDueSessions();

        if (request.getDeviceId() == null || request.getDeviceId().isBlank()) {
            throw new DeviceContractException(HttpStatus.BAD_REQUEST, "invalid_request", "device_id is required.");
        }
        if (request.getLotId() == null) {
            throw new DeviceContractException(HttpStatus.BAD_REQUEST, "invalid_request", "lot_id is required.");
        }

        Device device = deviceRepository.findByDeviceCode(request.getDeviceId().trim())
                .orElseThrow(() -> new DeviceContractException(HttpStatus.NOT_FOUND, "device_unknown", "No device " + request.getDeviceId() + "."));

        if (!"active".equalsIgnoreCase(device.getStatus())) {
            throw new DeviceContractException(HttpStatus.FORBIDDEN, "device_disabled", "This device is disabled.");
        }

        PaddyLot lot = paddyLotRepository.findById(request.getLotId())
                .orElseThrow(() -> new DeviceContractException(HttpStatus.NOT_FOUND, "lot_unknown", "No lot " + request.getLotId() + "."));

        if (lot.getFarm() == null || lot.getFarm().getFarmer() == null || lot.getFarm().getFarmer().getUser() == null
                || !lot.getFarm().getFarmer().getUser().getId().equals(farmer.getId())) {
            throw new DeviceContractException(HttpStatus.FORBIDDEN, "lot_not_yours", "This lot belongs to another farmer.");
        }

        Instant created = Instant.now();
        Instant expires = created.plusSeconds(DeviceContractUtils.SESSION_SECONDS);

        TestSession session = new TestSession();
        session.setFarmer(farmer);
        session.setLot(lot);
        session.setDevice(device);
        session.setStatus("open");
        session.setCreatedAt(created);
        session.setExpiresAt(expires);

        try {
            session = testSessionRepository.saveAndFlush(session);
        } catch (DataIntegrityViolationException ex) {
            throw new DeviceContractException(HttpStatus.CONFLICT, "device_busy", "Device is busy with another test.");
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("session_id", session.getId());
        response.put("status", "open");
        response.put("expires_at", DeviceContractUtils.toLocalIso(expires));
        return response;
    }

    @Transactional
    public Map<String, Object> pollDevice(Device device) {
        expireDueSessions();

        Optional<TestSession> sessionOpt = testSessionRepository.findFirstByDeviceIdAndStatus(device.getId(), "open");
        if (sessionOpt.isEmpty()) {
            return Collections.singletonMap("session", null);
        }

        TestSession session = sessionOpt.get();
        Map<String, Object> sessionData = new LinkedHashMap<>();
        sessionData.put("id", session.getId());
        sessionData.put("farmer_name", session.getFarmer().getName());
        sessionData.put("lot_code", session.getLot().getLotCode());
        sessionData.put("expires_at", DeviceContractUtils.toLocalIso(session.getExpiresAt()));

        return Collections.singletonMap("session", sessionData);
    }

    @Transactional
    public Map<String, Object> submitReading(Device device, ReadingRequest body) {
        if (body.getSessionId() == null) {
            throw new DeviceContractException(HttpStatus.BAD_REQUEST, "invalid_request", "session_id is required.");
        }

        // 1. Replay check FIRST before open session check
        Optional<Reading> existingOpt = readingRepository.findBySessionId(body.getSessionId());
        if (existingOpt.isPresent()) {
            Reading existing = existingOpt.get();
            if (!existing.getDevice().getId().equals(device.getId())) {
                throw new DeviceContractException(HttpStatus.CONFLICT, "session_not_yours", "That session belongs to another device.");
            }
            Map<String, Object> result = new LinkedHashMap<>();
            result.put("ok", true);
            result.put("reading_id", existing.getId());
            result.put("duplicate", true);
            return result;
        }

        expireDueSessions();

        TestSession session = testSessionRepository.findById(body.getSessionId())
                .orElseThrow(() -> new DeviceContractException(HttpStatus.CONFLICT, "no_open_session", "No such session."));

        if (!session.getDevice().getId().equals(device.getId())) {
            throw new DeviceContractException(HttpStatus.CONFLICT, "session_not_yours", "That session belongs to another device.");
        }

        if (!"open".equalsIgnoreCase(session.getStatus())) {
            throw new DeviceContractException(HttpStatus.CONFLICT, "no_open_session", "Session " + body.getSessionId() + " is " + session.getStatus() + ".");
        }

        validateRanges(body);

        Instant received = Instant.now();
        PaddyLot lot = session.getLot();

        Reading reading = new Reading();
        reading.setSession(session);
        reading.setDevice(device);
        reading.setLot(lot);
        reading.setMoisturePct(DeviceContractUtils.round1(body.getMoisturePct()));
        reading.setZoneTop(DeviceContractUtils.round1(body.getZones().getTop()));
        reading.setZoneMiddle(DeviceContractUtils.round1(body.getZones().getMiddle()));
        reading.setZoneBottom(DeviceContractUtils.round1(body.getZones().getBottom()));
        reading.setSpreadPct(DeviceContractUtils.round1(body.getSpreadPct()));
        reading.setTempC(body.getTempC() != null ? DeviceContractUtils.round1(body.getTempC()) : null);
        reading.setCalibrationVersion(body.getCalibrationVersion());
        reading.setFirmware(body.getFirmware());
        reading.setReceivedAt(received);

        Reading saved;
        try {
            saved = readingRepository.saveAndFlush(reading);
            session.setStatus("done");
            session.setDoneAt(received);
            testSessionRepository.save(session);

            lot.setLocked(true);
            paddyLotRepository.save(lot);

            device.setCalibrationVersion(body.getCalibrationVersion());
            if (body.getFirmware() != null) {
                device.setFirmwareVersion(body.getFirmware());
            }
            deviceRepository.save(device);

            // Sync with existing lot moisture reading history
            MoistureReading mr = new MoistureReading();
            mr.setLot(lot);
            mr.setDeviceNumber(device.getDeviceCode());
            mr.setMoisturePercentage(saved.getMoisturePct());
            mr.setMeasuredAt(LocalDateTime.now());
            mr.setSource("IOT_DEVICE");
            mr.setVerificationStatus("DEVICE_REPORTED");
            mr.setDeviceMeasurementId(String.valueOf(saved.getId()));
            mr.setRawPayload("{\"reading_id\":" + saved.getId() + ",\"session_id\":" + session.getId() + ",\"device_code\":\"" + device.getDeviceCode() + "\"}");
            moistureReadingRepository.save(mr);

        } catch (DataIntegrityViolationException ex) {
            Reading duplicate = readingRepository.findBySessionId(body.getSessionId())
                    .orElseThrow(() -> ex);
            Map<String, Object> result = new LinkedHashMap<>();
            result.put("ok", true);
            result.put("reading_id", duplicate.getId());
            result.put("duplicate", true);
            return result;
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("ok", true);
        result.put("reading_id", saved.getId());
        return result;
    }

    private void validateRanges(ReadingRequest body) {
        if (body.getMoisturePct() == null || body.getZones() == null
                || body.getZones().getTop() == null || body.getZones().getMiddle() == null || body.getZones().getBottom() == null
                || body.getSpreadPct() == null || body.getCalibrationVersion() == null) {
            throw new DeviceContractException(HttpStatus.UNPROCESSABLE_ENTITY, "value_out_of_range", "Required measurement fields missing.");
        }

        checkBetween(body.getMoisturePct(), DeviceContractUtils.MOISTURE_MIN, DeviceContractUtils.MOISTURE_MAX, "moisture_pct");
        checkBetween(body.getZones().getTop(), DeviceContractUtils.ZONE_MIN, DeviceContractUtils.ZONE_MAX, "zones.top");
        checkBetween(body.getZones().getMiddle(), DeviceContractUtils.ZONE_MIN, DeviceContractUtils.ZONE_MAX, "zones.middle");
        checkBetween(body.getZones().getBottom(), DeviceContractUtils.ZONE_MIN, DeviceContractUtils.ZONE_MAX, "zones.bottom");
        checkBetween(body.getSpreadPct(), DeviceContractUtils.SPREAD_MIN, DeviceContractUtils.SPREAD_MAX, "spread_pct");
        if (body.getTempC() != null) {
            checkBetween(body.getTempC(), DeviceContractUtils.TEMP_MIN, DeviceContractUtils.TEMP_MAX, "temp_c");
        }
    }

    private void checkBetween(Double value, double low, double high, String name) {
        if (value == null) return;
        if (value < low || value > high) {
            throw new DeviceContractException(HttpStatus.UNPROCESSABLE_ENTITY, "value_out_of_range", name + " " + value + " is outside " + low + "-" + high + ".");
        }
    }

    @Transactional
    public Map<String, Object> getTest(User farmer, Long sessionId) {
        expireDueSessions();

        TestSession session = testSessionRepository.findById(sessionId)
                .orElseThrow(() -> new DeviceContractException(HttpStatus.NOT_FOUND, "session_unknown", "No session " + sessionId + "."));

        if (!session.getFarmer().getId().equals(farmer.getId())) {
            throw new DeviceContractException(HttpStatus.FORBIDDEN, "session_not_yours", "This test belongs to another farmer.");
        }

        Reading reading = readingRepository.findBySessionId(sessionId).orElse(null);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", session.getStatus());
        response.put("expires_at", DeviceContractUtils.toLocalIso(session.getExpiresAt()));
        response.put("reading", reading != null ? formatReadingPayload(reading) : null);
        return response;
    }

    private Map<String, Object> formatReadingPayload(Reading reading) {
        Map<String, Object> zones = new LinkedHashMap<>();
        zones.put("top", reading.getZoneTop().doubleValue());
        zones.put("middle", reading.getZoneMiddle().doubleValue());
        zones.put("bottom", reading.getZoneBottom().doubleValue());

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("moisture_pct", reading.getMoisturePct().doubleValue());
        payload.put("zones", zones);
        payload.put("spread_pct", reading.getSpreadPct().doubleValue());
        payload.put("temp_c", reading.getTempC() != null ? reading.getTempC().doubleValue() : null);
        payload.put("calibration_version", reading.getCalibrationVersion());
        payload.put("received_at", DeviceContractUtils.toLocalIso(reading.getReceivedAt()));
        payload.put("label", DeviceContractUtils.READING_LABEL);
        return payload;
    }

    @Transactional
    public Map<String, Object> cancelTest(User farmer, Long sessionId) {
        expireDueSessions();

        TestSession session = testSessionRepository.findById(sessionId)
                .orElseThrow(() -> new DeviceContractException(HttpStatus.NOT_FOUND, "session_unknown", "No session " + sessionId + "."));

        if (!session.getFarmer().getId().equals(farmer.getId())) {
            throw new DeviceContractException(HttpStatus.FORBIDDEN, "session_not_yours", "This test belongs to another farmer.");
        }

        if (!"open".equalsIgnoreCase(session.getStatus())) {
            throw new DeviceContractException(HttpStatus.CONFLICT, "not_open", "Session is already " + session.getStatus() + ".");
        }

        session.setStatus("cancelled");
        testSessionRepository.save(session);

        return Collections.singletonMap("status", "cancelled");
    }

    // --- Admin Provisioning & Device Management ---
    @Transactional(readOnly = true)
    public List<Map<String, Object>> adminGetDevices(User adminUser, String adminToken) {
        validateAdminAccess(adminUser, adminToken);
        return deviceRepository.findAll().stream()
                .map(this::formatDeviceSummary)
                .toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> adminGetDevice(User adminUser, String adminToken, String deviceCode) {
        validateAdminAccess(adminUser, adminToken);
        Device device = deviceRepository.findByDeviceCode(deviceCode.trim())
                .orElseThrow(() -> new DeviceContractException(HttpStatus.NOT_FOUND, "device_unknown", "No device " + deviceCode + "."));
        return formatDeviceSummary(device);
    }

    private Map<String, Object> formatDeviceSummary(Device device) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", device.getId());
        map.put("device_code", device.getDeviceCode());
        map.put("device_name", device.getDeviceName());
        map.put("notes", device.getNotes());
        map.put("status", device.getStatus());
        map.put("last_seen_at", DeviceContractUtils.toLocalIso(device.getLastSeenAt()));
        map.put("calibration_version", device.getCalibrationVersion());
        map.put("firmware_version", device.getFirmwareVersion());
        map.put("created_at", DeviceContractUtils.toLocalIso(device.getCreatedAt()));
        return map;
    }

    @Transactional
    public Map<String, Object> adminCreateDevice(User adminUser, String adminToken, DeviceAdminCreateRequest body) {
        validateAdminAccess(adminUser, adminToken);

        if (body.getDeviceCode() == null || body.getDeviceCode().isBlank()) {
            throw new DeviceContractException(HttpStatus.BAD_REQUEST, "invalid_request", "device_code is required.");
        }

        String code = body.getDeviceCode().trim();
        if (deviceRepository.existsByDeviceCode(code)) {
            throw new DeviceContractException(HttpStatus.CONFLICT, "device_exists", code + " already exists.");
        }

        byte[] secretBytes = new byte[32];
        new SecureRandom().nextBytes(secretBytes);
        StringBuilder sb = new StringBuilder();
        for (byte b : secretBytes) {
            sb.append(String.format("%02x", b));
        }
        String secret = sb.toString();

        Device device = new Device();
        device.setDeviceCode(code);
        device.setDeviceName(body.getDeviceName() != null ? body.getDeviceName().trim() : null);
        device.setNotes(body.getNotes() != null ? body.getNotes().trim() : null);
        device.setSecretHash(passwordEncoder.encode(secret));
        device.setStatus("active");
        device.setCreatedAt(Instant.now());
        deviceRepository.save(device);

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("device_code", code);
        resp.put("device_name", device.getDeviceName());
        resp.put("secret", secret);
        resp.put("status", device.getStatus());
        resp.put("warning", "Shown once. Only the hash is stored.");
        return resp;
    }

    @Transactional
    public Map<String, Object> adminSetDeviceStatus(User adminUser, String adminToken, String deviceCode, DeviceAdminStatusRequest body) {
        validateAdminAccess(adminUser, adminToken);

        Device device = deviceRepository.findByDeviceCode(deviceCode.trim())
                .orElseThrow(() -> new DeviceContractException(HttpStatus.NOT_FOUND, "device_unknown", "No device " + deviceCode + "."));

        if (body.getStatus() != null) {
            if (!"active".equalsIgnoreCase(body.getStatus()) && !"disabled".equalsIgnoreCase(body.getStatus())) {
                throw new DeviceContractException(HttpStatus.BAD_REQUEST, "invalid_status", "status must be 'active' or 'disabled'.");
            }
            device.setStatus(body.getStatus().toLowerCase());
        }

        if (body.getDeviceName() != null) {
            device.setDeviceName(body.getDeviceName().trim());
        }
        if (body.getNotes() != null) {
            device.setNotes(body.getNotes().trim());
        }

        deviceRepository.save(device);

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("device_code", deviceCode);
        resp.put("device_name", device.getDeviceName());
        resp.put("status", device.getStatus());
        resp.put("notes", device.getNotes());
        return resp;
    }

    @Transactional
    public Map<String, Object> adminRotateDeviceKey(User adminUser, String adminToken, String deviceCode) {
        validateAdminAccess(adminUser, adminToken);

        Device device = deviceRepository.findByDeviceCode(deviceCode.trim())
                .orElseThrow(() -> new DeviceContractException(HttpStatus.NOT_FOUND, "device_unknown", "No device " + deviceCode + "."));

        byte[] secretBytes = new byte[32];
        new SecureRandom().nextBytes(secretBytes);
        StringBuilder sb = new StringBuilder();
        for (byte b : secretBytes) {
            sb.append(String.format("%02x", b));
        }
        String newSecret = sb.toString();

        device.setSecretHash(passwordEncoder.encode(newSecret));
        deviceRepository.save(device);

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("device_code", deviceCode);
        resp.put("secret", newSecret);
        resp.put("warning", "Shown once. The previous device key is now invalidated.");
        return resp;
    }

    @Transactional
    public Map<String, Object> adminCreateFarmer(String adminToken, FarmerAdminCreateRequest body) {
        validateAdminToken(adminToken);

        String email = (body.getName().trim().toLowerCase().replaceAll("\\s+", ".") + "." + (System.currentTimeMillis() % 10000) + "@veemarket.com");
        User user = new User();
        user.setName(body.getName().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode("Secret@123"));
        user.setPhone(body.getPhone());
        user.setRole(Role.FARMER);
        user = userRepository.save(user);

        FarmerProfile fp = new FarmerProfile();
        fp.setUser(user);
        fp = farmerProfileRepository.save(fp);

        Farm farm = new Farm();
        farm.setFarmer(fp);
        farm.setFarmName(user.getName() + "'s Farm");
        farm.setLocation("Polonnaruwa");
        farm.setLandSize(BigDecimal.valueOf(5.0));
        farm.setMainCrop("Paddy");
        farmRepository.save(farm);

        String token = jwtService.generateToken(user);

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("farmer_id", user.getId());
        resp.put("name", user.getName());
        resp.put("token", token);
        return resp;
    }

    // --- Reference Lot Endpoints (for compatibility with contract tests & tools) ---

    @Transactional
    public Map<String, Object> createLot(User farmer, LotCreateRequest body) {
        FarmerProfile fp = farmerProfileRepository.findByUserId(farmer.getId())
                .orElseGet(() -> {
                    FarmerProfile newFp = new FarmerProfile();
                    newFp.setUser(farmer);
                    return farmerProfileRepository.save(newFp);
                });

        Farm farm = farmRepository.findAll().stream()
                .filter(f -> f.getFarmer().getId().equals(fp.getId()))
                .findFirst()
                .orElseGet(() -> {
                    Farm f = new Farm();
                    f.setFarmer(fp);
                    f.setFarmName(farmer.getName() + "'s Farm");
                    f.setLocation("Default");
                    f.setLandSize(BigDecimal.valueOf(5.0));
                    f.setMainCrop("Paddy");
                    return farmRepository.save(f);
                });

        PaddyLot lot = new PaddyLot();
        lot.setFarm(farm);
        lot.setProductType("PADDY");
        lot.setRiceType(body.getVariety() != null ? body.getVariety() : "Nadu");
        lot.setQuantityKg(body.getQuantityKg() != null ? BigDecimal.valueOf(body.getQuantityKg()) : BigDecimal.valueOf(1000.0));
        lot.setAskingPricePerKg(BigDecimal.valueOf(120.0));
        lot.setAvailableDate(java.time.LocalDate.now());
        lot.setStatus("ACTIVE");
        lot.setLocked(false);
        lot.setLotCode(body.getLotCode() != null ? body.getLotCode() : "L" + (System.currentTimeMillis() % 1_000_000));

        PaddyLot saved = paddyLotRepository.save(lot);
        return formatLotPayload(saved);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getLot(User farmer, Long lotId) {
        PaddyLot lot = paddyLotRepository.findById(lotId)
                .orElseThrow(() -> new DeviceContractException(HttpStatus.NOT_FOUND, "lot_unknown", "No lot " + lotId + "."));

        if (!lot.getFarm().getFarmer().getUser().getId().equals(farmer.getId())) {
            throw new DeviceContractException(HttpStatus.FORBIDDEN, "lot_not_yours", "This lot belongs to another farmer.");
        }

        return formatLotPayload(lot);
    }

    @Transactional
    public Map<String, Object> patchLot(User farmer, Long lotId, LotPatchRequest body) {
        PaddyLot lot = paddyLotRepository.findById(lotId)
                .orElseThrow(() -> new DeviceContractException(HttpStatus.NOT_FOUND, "lot_unknown", "No lot " + lotId + "."));

        if (!lot.getFarm().getFarmer().getUser().getId().equals(farmer.getId())) {
            throw new DeviceContractException(HttpStatus.FORBIDDEN, "lot_not_yours", "This lot belongs to another farmer.");
        }

        if (lot.getLocked() != null && lot.getLocked()) {
            throw new DeviceContractException(HttpStatus.CONFLICT, "lot_locked", "This lot has a reading; variety and quantity are locked.");
        }

        if (body.getVariety() != null) {
            lot.setRiceType(body.getVariety());
        }
        if (body.getQuantityKg() != null) {
            lot.setQuantityKg(BigDecimal.valueOf(body.getQuantityKg()));
        }

        PaddyLot saved = paddyLotRepository.save(lot);
        return formatLotPayload(saved);
    }

    private Map<String, Object> formatLotPayload(PaddyLot lot) {
        Reading reading = readingRepository.findFirstByLotIdOrderByIdDesc(lot.getId()).orElse(null);

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("lot_id", lot.getId());
        payload.put("lot_code", lot.getLotCode());
        payload.put("variety", lot.getRiceType());
        payload.put("quantity_kg", lot.getQuantityKg().doubleValue());
        payload.put("locked", lot.getLocked() != null && lot.getLocked());
        payload.put("reading", reading != null ? formatReadingPayload(reading) : null);
        return payload;
    }
}
