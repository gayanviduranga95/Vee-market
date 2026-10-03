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
        String requestBody = "{\"deviceNumber\":\"" + uniqueDeviceNumber + "\",\"moisturePercentage\":14.5}";

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
}
