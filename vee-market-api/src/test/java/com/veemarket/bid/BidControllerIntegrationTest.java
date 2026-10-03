package com.veemarket.bid;

import com.veemarket.farm.Farm;
import com.veemarket.farm.FarmRepository;
import com.veemarket.farmer.FarmerProfile;
import com.veemarket.farmer.FarmerProfileRepository;
import com.veemarket.farmer.VerificationStatus;
import com.veemarket.listing.PaddyLot;
import com.veemarket.listing.PaddyLotRepository;
import com.veemarket.mill.MillProfile;
import com.veemarket.mill.MillProfileRepository;
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
class BidControllerIntegrationTest {

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
    private BidRepository bidRepository;

    @Autowired
    private MillProfileRepository millProfileRepository;

    private User farmerUser;
    private User millUser;
    private PaddyLot lot;

    @BeforeEach
    void setUp() {
        String suffix = String.valueOf(System.nanoTime());

        farmerUser = new User();
        farmerUser.setName("Farmer Bob");
        farmerUser.setEmail("farmer.bid." + suffix + "@test.com");
        farmerUser.setPassword("encoded-password");
        farmerUser.setRole(Role.FARMER);
        farmerUser.setDeviceNumber("DEVICE-BID-" + suffix);
        farmerUser = userRepository.save(farmerUser);

        FarmerProfile farmerProfile = new FarmerProfile();
        farmerProfile.setUser(farmerUser);
        farmerProfile.setVerificationStatus(VerificationStatus.VERIFIED);
        farmerProfileRepository.save(farmerProfile);

        Farm farm = new Farm();
        farm.setFarmer(farmerProfile);
        farm.setFarmName("Bid Farm");
        farm.setLocation("Kegalle");
        farm = farmRepository.save(farm);

        lot = new PaddyLot();
        lot.setFarm(farm);
        lot.setProductType("PADDY");
        lot.setRiceType("BG352");
        lot.setQuantityKg(new BigDecimal("1500.00"));
        lot.setAskingPricePerKg(new BigDecimal("40.00"));
        lot.setAvailableDate(LocalDate.now().plusDays(3));
        lot.setStatus("ACTIVE");
        lot = paddyLotRepository.save(lot);

        millUser = new User();
        millUser.setName("Mill Owner");
        millUser.setEmail("mill.bid." + suffix + "@test.com");
        millUser.setPassword("encoded-password");
        millUser.setRole(Role.MILL);
        millUser = userRepository.save(millUser);

        MillProfile millProfile = new MillProfile();
        millProfile.setUser(millUser);
        millProfile.setMillName("Bid Mill");
        millProfile.setLocation("Galle");
        millProfile.setRegistrationNumber("REG-BID-" + suffix);
        millProfile.setMillingCapacityKgPerDay(new BigDecimal("3000.00"));
        millProfile.setVerificationStatus(VerificationStatus.VERIFIED);
        millProfileRepository.save(millProfile);
    }

    @Test
    void millCanPlaceBidAndFarmerCanAcceptIt() throws Exception {
        UsernamePasswordAuthenticationToken millAuth =
                new UsernamePasswordAuthenticationToken(
                        millUser,
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_MILL"))
                );

        String bidBody = "{\"bidPricePerKg\":41.25}";

        mockMvc.perform(post("/api/mill/lots/{lotId}/bids", lot.getId())
                        .with(SecurityMockMvcRequestPostProcessors.authentication(millAuth))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(bidBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.bidPricePerKg").value(41.25))
                .andExpect(jsonPath("$.status").value("PENDING"));

        Bid bid = bidRepository.findByLotIdOrderByBidPricePerKgDesc(lot.getId()).get(0);

        UsernamePasswordAuthenticationToken farmerAuth =
                new UsernamePasswordAuthenticationToken(
                        farmerUser,
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_FARMER"))
                );

        mockMvc.perform(get("/api/farmer/lots/{lotId}/bids", lot.getId())
                        .with(SecurityMockMvcRequestPostProcessors.authentication(farmerAuth)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].bidId").value(bid.getId().intValue()));

        mockMvc.perform(post("/api/farmer/bids/{bidId}/accept", bid.getId())
                        .with(SecurityMockMvcRequestPostProcessors.authentication(farmerAuth)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACCEPTED"));
    }

    @Test
    void anotherFarmerCannotAcceptSomeoneElsesBid() throws Exception {
        String suffix = String.valueOf(System.nanoTime());

        User otherFarmer = new User();
        otherFarmer.setName("Other Farmer");
        otherFarmer.setEmail("other.farmer." + suffix + "@test.com");
        otherFarmer.setPassword("encoded-password");
        otherFarmer.setRole(Role.FARMER);
        otherFarmer = userRepository.save(otherFarmer);

        FarmerProfile otherProfile = new FarmerProfile();
        otherProfile.setUser(otherFarmer);
        otherProfile.setVerificationStatus(VerificationStatus.VERIFIED);
        otherProfile = farmerProfileRepository.save(otherProfile);

        Farm otherFarm = new Farm();
        otherFarm.setFarmer(otherProfile);
        otherFarm.setFarmName("Other Farm");
        otherFarm.setLocation("Badulla");
        otherFarm = farmRepository.save(otherFarm);

        PaddyLot otherLot = new PaddyLot();
        otherLot.setFarm(otherFarm);
        otherLot.setProductType("PADDY");
        otherLot.setRiceType("AT362");
        otherLot.setQuantityKg(new BigDecimal("2000.00"));
        otherLot.setAskingPricePerKg(new BigDecimal("35.00"));
        otherLot.setAvailableDate(LocalDate.now().plusDays(4));
        otherLot.setStatus("ACTIVE");
        otherLot = paddyLotRepository.save(otherLot);

        User anotherMillUser = new User();
        anotherMillUser.setName("Another Mill");
        anotherMillUser.setEmail("another.mill." + suffix + "@test.com");
        anotherMillUser.setPassword("encoded-password");
        anotherMillUser.setRole(Role.MILL);
        anotherMillUser = userRepository.save(anotherMillUser);

        MillProfile anotherMillProfile = new MillProfile();
        anotherMillProfile.setUser(anotherMillUser);
        anotherMillProfile.setMillName("Another Mill Profile");
        anotherMillProfile.setLocation("Matara");
        anotherMillProfile.setRegistrationNumber("REG-OTHER-" + suffix);
        anotherMillProfile.setMillingCapacityKgPerDay(new BigDecimal("2500.00"));
        anotherMillProfile.setVerificationStatus(VerificationStatus.VERIFIED);
        millProfileRepository.save(anotherMillProfile);

        Bid bid = new Bid();
        bid.setLot(otherLot);
        bid.setMillUser(anotherMillUser);
        bid.setBidPricePerKg(new BigDecimal("36.00"));
        bid.setStatus(BidStatus.PENDING);
        bid = bidRepository.save(bid);

        UsernamePasswordAuthenticationToken anotherFarmerAuth =
                new UsernamePasswordAuthenticationToken(
                        farmerUser,
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_FARMER"))
                );

        mockMvc.perform(post("/api/farmer/bids/{bidId}/accept", bid.getId())
                        .with(SecurityMockMvcRequestPostProcessors.authentication(anotherFarmerAuth)))
                .andExpect(status().isForbidden());
    }
}
