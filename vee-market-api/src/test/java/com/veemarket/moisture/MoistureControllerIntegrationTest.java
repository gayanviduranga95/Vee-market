package com.veemarket.moisture;

import com.veemarket.farm.Farm;
import com.veemarket.farm.FarmRepository;
import com.veemarket.farmer.FarmerProfile;
import com.veemarket.farmer.FarmerProfileRepository;
import com.veemarket.listing.PaddyLot;
import com.veemarket.listing.PaddyLotRepository;
import com.veemarket.user.Role;
import com.veemarket.user.User;
import com.veemarket.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class MoistureControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FarmerProfileRepository farmerProfileRepository;

    @Autowired
    private FarmRepository farmRepository;

    @Autowired
    private PaddyLotRepository paddyLotRepository;

    @Autowired
    private MoistureReadingRepository moistureReadingRepository;

    private User farmer;
    private Farm farm;
    private PaddyLot lot;

    @BeforeEach
    void setUp() {
        String uniqueSuffix = String.valueOf(System.nanoTime());
        String uniqueDeviceNumber = "DEVICE-" + uniqueSuffix;

        farmer = new User();
        farmer.setName("Farmer One");
        farmer.setEmail("farmer.moisture." + uniqueSuffix + "@test.com");
        farmer.setPassword("encoded-password");
        farmer.setRole(Role.FARMER);
        farmer.setDeviceNumber(uniqueDeviceNumber);
        farmer = userRepository.save(farmer);

        FarmerProfile profile = new FarmerProfile();
        profile.setUser(farmer);
        profile = farmerProfileRepository.save(profile);

        farm = new Farm();
        farm.setFarmer(profile);
        farm.setFarmName("Alpha Farm");
        farm.setLocation("Kurunegala");
        farm = farmRepository.save(farm);

        lot = new PaddyLot();
        lot.setFarm(farm);
        lot.setProductType("PADDY");
        lot.setRiceType("AT362");
        lot.setQuantityKg(new BigDecimal("2500.00"));
        lot.setAskingPricePerKg(new BigDecimal("42.50"));
        lot.setAvailableDate(LocalDate.now().plusDays(3));
        lot.setStatus("ACTIVE");
        lot = paddyLotRepository.save(lot);
    }

    @Test
    void farmerCanAddAndFetchLatestMoistureReading() throws Exception {
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        farmer,
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_FARMER"))
                );

        String uniqueDeviceNumber = farmer.getDeviceNumber();
        String requestBody = "{\"deviceNumber\":\"" + uniqueDeviceNumber + "\",\"moisturePercentage\":14.5,\"source\":\"IOT_DEVICE\"}";

        mockMvc.perform(post("/api/farmer/lots/{lotId}/moisture", lot.getId())
                        .with(SecurityMockMvcRequestPostProcessors.authentication(authentication))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.deviceNumber").value(uniqueDeviceNumber))
                .andExpect(jsonPath("$.moisturePercentage").value(14.5));

        mockMvc.perform(get("/api/farmer/lots/{lotId}/moisture/latest", lot.getId())
                        .with(SecurityMockMvcRequestPostProcessors.authentication(authentication)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.deviceNumber").value(uniqueDeviceNumber))
                .andExpect(jsonPath("$.moisturePercentage").value(14.5));
    }

    @Test
    void farmerCanConnectAnyDeviceAndAttachVerifiedReading() throws Exception {
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        farmer,
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_FARMER"))
                );

        String guestDevice = "VM-METER-999";
        String requestBody = "{\"deviceNumber\":\"" + guestDevice + "\",\"moisturePercentage\":13.8,\"source\":\"IOT_DEVICE\",\"verificationStatus\":\"DEVICE_REPORTED\",\"deviceMeasurementId\":\"MEAS-101\"}";

        mockMvc.perform(post("/api/farmer/lots/{lotId}/moisture", lot.getId())
                        .with(SecurityMockMvcRequestPostProcessors.authentication(authentication))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.deviceNumber").value(guestDevice))
                .andExpect(jsonPath("$.moisturePercentage").value(13.8))
                .andExpect(jsonPath("$.source").value("IOT_DEVICE"))
                .andExpect(jsonPath("$.verificationStatus").value("DEVICE_REPORTED"))
                .andExpect(jsonPath("$.deviceMeasurementId").value("MEAS-101"));
    }

    @Test
    void duplicateDeviceMeasurementIsRejected() throws Exception {
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        farmer,
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_FARMER"))
                );

        String requestBody = "{\"deviceNumber\":\"VM-METER-001\",\"moisturePercentage\":12.4,\"source\":\"IOT_DEVICE\",\"deviceMeasurementId\":\"UNIQUE-SEQ-123\"}";

        // First attempt succeeds
        mockMvc.perform(post("/api/farmer/lots/{lotId}/moisture", lot.getId())
                        .with(SecurityMockMvcRequestPostProcessors.authentication(authentication))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isCreated());

        // Replay attempt with same device measurement ID is rejected
        mockMvc.perform(post("/api/farmer/lots/{lotId}/moisture", lot.getId())
                        .with(SecurityMockMvcRequestPostProcessors.authentication(authentication))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isBadRequest());
    }

    @Test
    void invalidMoisturePercentageIsRejected() throws Exception {
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        farmer,
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_FARMER"))
                );

        // Less than 0.10 (Bean validation @DecimalMin fails -> 422 Unprocessable Entity)
        String lowBody = "{\"deviceNumber\":\"DEV-1\",\"moisturePercentage\":0.05}";
        mockMvc.perform(post("/api/farmer/lots/{lotId}/moisture", lot.getId())
                        .with(SecurityMockMvcRequestPostProcessors.authentication(authentication))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(lowBody))
                .andExpect(status().isUnprocessableEntity());

        // Greater than 60.00 (Bean validation @DecimalMax fails -> 422 Unprocessable Entity)
        String highBody = "{\"deviceNumber\":\"DEV-1\",\"moisturePercentage\":75.00}";
        mockMvc.perform(post("/api/farmer/lots/{lotId}/moisture", lot.getId())
                        .with(SecurityMockMvcRequestPostProcessors.authentication(authentication))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(highBody))
                .andExpect(status().isUnprocessableEntity());
    }

    @Test
    void unauthorizedFarmerCannotAttachReadingToAnotherFarmersLot() throws Exception {
        // Create second farmer
        User farmerTwo = new User();
        farmerTwo.setName("Farmer Two");
        farmerTwo.setEmail("farmer.two." + System.nanoTime() + "@test.com");
        farmerTwo.setPassword("encoded-password");
        farmerTwo.setRole(Role.FARMER);
        farmerTwo = userRepository.save(farmerTwo);

        FarmerProfile profileTwo = new FarmerProfile();
        profileTwo.setUser(farmerTwo);
        farmerProfileRepository.save(profileTwo);

        UsernamePasswordAuthenticationToken authenticationTwo =
                new UsernamePasswordAuthenticationToken(
                        farmerTwo,
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_FARMER"))
                );

        String requestBody = "{\"deviceNumber\":\"DEV-XYZ\",\"moisturePercentage\":14.0,\"source\":\"IOT_DEVICE\"}";

        mockMvc.perform(post("/api/farmer/lots/{lotId}/moisture", lot.getId())
                        .with(SecurityMockMvcRequestPostProcessors.authentication(authenticationTwo))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isForbidden());
    }

    @Test
    void manualMoistureReadingIsRejected() throws Exception {
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        farmer,
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_FARMER"))
                );

        // Manual source is rejected
        String manualBody = "{\"deviceNumber\":\"MANUAL-01\",\"moisturePercentage\":14.0,\"source\":\"MANUAL\"}";
        mockMvc.perform(post("/api/farmer/lots/{lotId}/moisture", lot.getId())
                        .with(SecurityMockMvcRequestPostProcessors.authentication(authentication))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(manualBody))
                .andExpect(status().isBadRequest());

        // Missing source (defaults to unpermitted manual) is rejected
        String noSourceBody = "{\"deviceNumber\":\"MANUAL-01\",\"moisturePercentage\":14.0}";
        mockMvc.perform(post("/api/farmer/lots/{lotId}/moisture", lot.getId())
                        .with(SecurityMockMvcRequestPostProcessors.authentication(authentication))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(noSourceBody))
                .andExpect(status().isBadRequest());
    }

    @Test
    void farmerCanCreateLotWithoutMoistureReading() throws Exception {
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        farmer,
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_FARMER"))
                );

        String lotRequestBody = "{"
                + "\"farmId\":" + farm.getId() + ","
                + "\"productType\":\"PADDY\","
                + "\"riceType\":\"SAMBA\","
                + "\"quantityKg\":1500.00,"
                + "\"askingPricePerKg\":120.00,"
                + "\"availableDate\":\"" + LocalDate.now().plusDays(5) + "\""
                + "}";

        mockMvc.perform(post("/api/farmer/lots")
                        .with(SecurityMockMvcRequestPostProcessors.authentication(authentication))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(lotRequestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.riceType").value("SAMBA"));
    }

    @Test
    void farmerCanCreateLotWithConnectedMoistureReading() throws Exception {
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        farmer,
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_FARMER"))
                );

        String lotRequestBody = "{"
                + "\"farmId\":" + farm.getId() + ","
                + "\"productType\":\"PADDY\","
                + "\"riceType\":\"KEERI_SAMBA\","
                + "\"quantityKg\":3000.00,"
                + "\"askingPricePerKg\":145.00,"
                + "\"availableDate\":\"" + LocalDate.now().plusDays(2) + "\","
                + "\"moistureReading\":{"
                + "  \"deviceNumber\":\"VM-IOT-404\","
                + "  \"moisturePercentage\":13.20,"
                + "  \"source\":\"IOT_DEVICE\","
                + "  \"verificationStatus\":\"DEVICE_REPORTED\","
                + "  \"deviceMeasurementId\":\"LOT-READING-99\""
                + "}"
                + "}";

        mockMvc.perform(post("/api/farmer/lots")
                        .with(SecurityMockMvcRequestPostProcessors.authentication(authentication))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(lotRequestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists());
    }
}
