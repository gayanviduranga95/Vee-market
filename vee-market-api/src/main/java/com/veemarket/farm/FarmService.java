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

    @Transactional
    public Farm createFarm(User user, FarmRequest request) {

        FarmerProfile farmer = farmerProfileRepository
                .findByUserId(user.getId())
                .orElseGet(() -> {
                    FarmerProfile profile = new FarmerProfile();
                    profile.setUser(user);
                    return farmerProfileRepository.save(profile);
                });

        Farm farm = new Farm();

        farm.setFarmer(farmer);
        farm.setFarmName(request.getFarmName());
        farm.setLocation(request.getLocation());
        farm.setLandSize(request.getLandSize());
        farm.setMainCrop(request.getMainCrop());

        return farmRepository.save(farm);
    }

    @Transactional(readOnly = true)
    public List<Farm> getMyFarms(User user) {

        FarmerProfile farmer = farmerProfileRepository
                .findByUserId(user.getId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Farmer profile not found"
                        )
                );

        return farmRepository.findByFarmerId(farmer.getId());
    }
}
