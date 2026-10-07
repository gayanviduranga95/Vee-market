package com.veemarket.listing;

import com.veemarket.farm.Farm;
import com.veemarket.farm.FarmRepository;
import com.veemarket.farmer.FarmerProfile;
import com.veemarket.farmer.FarmerProfileRepository;
import com.veemarket.listing.dto.PaddyLotResponse;
import com.veemarket.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PaddyLotService {

    private final PaddyLotRepository paddyLotRepository;
    private final FarmRepository farmRepository;
    private final FarmerProfileRepository farmerProfileRepository;

    public PaddyLotService(
            PaddyLotRepository paddyLotRepository,
            FarmRepository farmRepository,
            FarmerProfileRepository farmerProfileRepository
    ) {
        this.paddyLotRepository = paddyLotRepository;
        this.farmRepository = farmRepository;
        this.farmerProfileRepository = farmerProfileRepository;
    }

    @Transactional
    public PaddyLotResponse createLot(
            User user,
            PaddyLotRequest request
    ) {

        FarmerProfile farmer = farmerProfileRepository
                .findByUserId(user.getId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Farmer profile not found"
                        )
                );

        Farm farm = farmRepository
                .findById(request.getFarmId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Farm not found"
                        )
                );

        if (!farm.getFarmer().getId().equals(farmer.getId())) {
            throw new IllegalArgumentException(
                    "You can only create lots for your own farm"
            );
        }

        PaddyLot lot = new PaddyLot();

        lot.setFarm(farm);
        lot.setProductType(
                request.getProductType() == null
                        ? "PADDY"
                        : request.getProductType()
        );
        lot.setRiceType(request.getRiceType());
        lot.setQuantityKg(request.getQuantityKg());
        lot.setAskingPricePerKg(request.getAskingPricePerKg());
        lot.setAvailableDate(request.getAvailableDate());
        lot.setStatus("ACTIVE");

        PaddyLot savedLot = paddyLotRepository.save(lot);

        return toResponse(savedLot);
    }

    @Transactional(readOnly = true)
    public List<PaddyLotResponse> getMyLots(User user) {

        FarmerProfile farmer = farmerProfileRepository
                .findByUserId(user.getId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Farmer profile not found"
                        )
                );

        return paddyLotRepository.findAll()
                .stream()
                .filter(lot ->
                        lot.getFarm()
                                .getFarmer()
                                .getId()
                                .equals(farmer.getId())
                )
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PaddyLotResponse getLot(User user, Long lotId) {

        FarmerProfile farmer = farmerProfileRepository
                .findByUserId(user.getId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Farmer profile not found"
                        )
                );

        PaddyLot lot = paddyLotRepository.findById(lotId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Paddy lot not found"
                        )
                );

        if (!lot.getFarm().getFarmer().getId().equals(farmer.getId())) {
            throw new IllegalArgumentException(
                    "You can only view your own lots"
            );
        }

        return toResponse(lot);
    }

    private PaddyLotResponse toResponse(PaddyLot lot) {

        return new PaddyLotResponse(
                lot.getId(),
                lot.getFarm() != null ? lot.getFarm().getId() : null,
                lot.getFarm() != null ? lot.getFarm().getFarmName() : null,
                lot.getProductType(),
                lot.getRiceType(),
                lot.getQuantityKg(),
                lot.getAskingPricePerKg(),
                lot.getAvailableDate(),
                lot.getStatus(),
                lot.getCreatedAt()
        );
    }
}