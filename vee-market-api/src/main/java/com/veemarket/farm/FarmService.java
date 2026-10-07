package com.veemarket.farm;

import com.veemarket.farmer.FarmerProfile;
import com.veemarket.farmer.FarmerProfileRepository;
import com.veemarket.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FarmService {

    private final FarmRepository farmRepository;
    private final FarmerProfileRepository farmerProfileRepository;

    public FarmService(
            FarmRepository farmRepository,
            FarmerProfileRepository farmerProfileRepository
    ) {
        this.farmRepository = farmRepository;
        this.farmerProfileRepository = farmerProfileRepository;
    }

    // =========================================================
    // CREATE FARM
    // =========================================================

    @Transactional
    public FarmResponse createFarm(
            User user,
            FarmRequest request
    ) {

        FarmerProfile farmer = getOrCreateFarmerProfile(user);

        Farm farm = new Farm();

        farm.setFarmer(farmer);
        farm.setFarmName(request.getFarmName());
        farm.setLocation(request.getLocation());
        farm.setLandSize(request.getLandSize());
        farm.setMainCrop(request.getMainCrop());

        Farm savedFarm = farmRepository.save(farm);

        return toResponse(savedFarm);
    }

    // =========================================================
    // GET MY FARMS
    // =========================================================

    @Transactional(readOnly = true)
    public List<FarmResponse> getMyFarms(User user) {

        FarmerProfile farmer = getOrCreateFarmerProfile(user);

        return farmRepository
                .findByFarmerId(farmer.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =========================================================
    // ENTITY → RESPONSE
    // =========================================================

        private FarmerProfile getOrCreateFarmerProfile(User user) {
                return farmerProfileRepository
                                .findByUserId(user.getId())
                                .orElseGet(() -> {
                                        FarmerProfile farmer = new FarmerProfile();
                                        farmer.setUser(user);
                                        return farmerProfileRepository.save(farmer);
                                });
        }

    private FarmResponse toResponse(Farm farm) {

        return new FarmResponse(
                farm.getId(),
                farm.getFarmer().getId(),
                farm.getFarmName(),
                farm.getLocation(),
                farm.getLandSize(),
                farm.getMainCrop(),
                farm.getCreatedAt()
        );
    }
}