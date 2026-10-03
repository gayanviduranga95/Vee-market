package com.veemarket.mill;

import com.veemarket.farm.Farm;
import com.veemarket.farm.FarmRepository;
import com.veemarket.farmer.FarmerProfile;
import com.veemarket.farmer.FarmerProfileRepository;
import com.veemarket.listing.PaddyLot;
import com.veemarket.listing.PaddyLotRepository;
import com.veemarket.moisture.MoistureReading;
import com.veemarket.moisture.MoistureReadingRepository;
import com.veemarket.user.Role;
import com.veemarket.user.User;
import com.veemarket.user.UserRepository;
import org.hamcrest.Matchers;
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
class MillControllerIntegrationTest {

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

    private User millUser;
    private User farmerUser;
    private PaddyLot lot;

    @BeforeEach
    void setUp() {
        String suffix = String.valueOf(System.nanoTime());

        millUser = new User();
        millUser.setName("Mill Owner");
        millUser.setEmail("mill." + suffix + "@test.com");
        millUser.setPassword("encoded-password");
        millUser.setRole(Role.MILL);
        millUser = userRepository.save(millUser);

        farmerUser = new User();
        farmerUser.setName("Farmer Owner");
        farmerUser.setEmail("farmer." + suffix + "@test.com");
        farmerUser.setPassword("encoded-password");
        farmerUser.setRole(Role.FARMER);
        farmerUser.setDeviceNumber("DEVICE-TRACE");
        farmerUser = userRepository.save(farmerUser);

        FarmerProfile farmerProfile = new FarmerProfile();
        farmerProfile.setUser(farmerUser);
        farmerProfile = farmerProfileRepository.save(farmerProfile);

        Farm farm = new Farm();
        farm.setFarmer(farmerProfile);
        farm.setFarmName("Trace Farm");
        farm.setLocation("Anuradhapura");
        farm = farmRepository.save(farm);

        lot = new PaddyLot();
        lot.setFarm(farm);
        lot.setProductType("PADDY");
        lot.setRiceType("BG352");
        lot.setQuantityKg(new BigDecimal("1200.00"));
        lot.setAskingPricePerKg(new BigDecimal("38.00"));
        lot.setAvailableDate(LocalDate.now().plusDays(2));
        lot.setStatus("ACTIVE");
        lot = paddyLotRepository.save(lot);

        MoistureReading moistureReading = new MoistureReading();
        moistureReading.setLot(lot);
        moistureReading.setDeviceNumber("DEVICE-TRACE");
        moistureReading.setMoisturePercentage(new BigDecimal("14.20"));
        moistureReadingRepository.save(moistureReading);
    }

    @Test
    void millCanCreateProfileAndBrowseActiveLots() throws Exception {
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        millUser,
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_MILL"))
                );

        String body = "{\"millName\":\"Green Grain\",\"location\":\"Kandy\",\"registrationNumber\":\"REG-7788\",\"millingCapacityKgPerDay\":5000}";

        mockMvc.perform(post("/api/mill/profile")
                        .with(SecurityMockMvcRequestPostProcessors.authentication(authentication))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.millName").value("Green Grain"))
                .andExpect(jsonPath("$.verificationStatus").value("PENDING"));

        mockMvc.perform(get("/api/mill/profile")
                        .with(SecurityMockMvcRequestPostProcessors.authentication(authentication)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.millName").value("Green Grain"));

        mockMvc.perform(get("/api/mill/lots")
                        .with(SecurityMockMvcRequestPostProcessors.authentication(authentication)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].lotId").value(Matchers.hasItem(lot.getId().intValue())));

        mockMvc.perform(get("/api/mill/lots/{lotId}", lot.getId())
                        .with(SecurityMockMvcRequestPostProcessors.authentication(authentication)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lotId").value(lot.getId()))
                .andExpect(jsonPath("$.latestMoisturePercentage").value(14.2));
    }
}
