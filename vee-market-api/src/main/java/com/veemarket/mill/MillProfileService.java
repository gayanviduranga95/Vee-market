package com.veemarket.mill;

import com.veemarket.farmer.VerificationStatus;
import com.veemarket.listing.PaddyLot;
import com.veemarket.listing.PaddyLotRepository;
import com.veemarket.moisture.MoistureReading;
import com.veemarket.moisture.MoistureReadingRepository;
import com.veemarket.user.Role;
import com.veemarket.user.User;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class MillProfileService {

    private final MillProfileRepository millProfileRepository;
    private final PaddyLotRepository paddyLotRepository;
    private final MoistureReadingRepository moistureReadingRepository;

    public MillProfileService(
            MillProfileRepository millProfileRepository,
            PaddyLotRepository paddyLotRepository,
            MoistureReadingRepository moistureReadingRepository
    ) {
        this.millProfileRepository = millProfileRepository;
        this.paddyLotRepository = paddyLotRepository;
        this.moistureReadingRepository = moistureReadingRepository;
    }

    @Transactional
    public MillProfileResponse createProfile(User user, MillProfileRequest request) {
        if (user.getRole() != Role.MILL) {
            throw new AccessDeniedException("Only mill users can create a mill profile");
        }

        if (millProfileRepository.findByUserId(user.getId()).isPresent()) {
            throw new IllegalArgumentException("Mill profile already exists");
        }

        MillProfile profile = new MillProfile();
        profile.setUser(user);
        profile.setMillName(request.getMillName().trim());
        profile.setLocation(request.getLocation());
        profile.setRegistrationNumber(request.getRegistrationNumber().trim());
        profile.setMillingCapacityKgPerDay(request.getMillingCapacityKgPerDay());
        profile.setVerificationStatus(VerificationStatus.PENDING);

        return toResponse(millProfileRepository.save(profile));
    }

    @Transactional(readOnly = true)
    public MillProfileResponse getProfile(User user) {
        if (user.getRole() != Role.MILL) {
            throw new AccessDeniedException("Only mill users can access this profile");
        }

        MillProfile profile = millProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new EntityNotFoundException("Mill profile not found"));

        return toResponse(profile);
    }

    @Transactional(readOnly = true)
    public List<MillLotResponse> getAvailableLots() {
        return paddyLotRepository.findByStatus("ACTIVE")
                .stream()
                .map(this::toLotResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public MillLotResponse getLot(Long lotId) {
        PaddyLot lot = paddyLotRepository.findById(lotId)
                .orElseThrow(() -> new EntityNotFoundException("Paddy lot not found"));

        if (!"ACTIVE".equalsIgnoreCase(lot.getStatus())) {
            throw new IllegalArgumentException("Lot is not available for mill browsing");
        }

        return toLotResponse(lot);
    }

    private MillProfileResponse toResponse(MillProfile profile) {
        return new MillProfileResponse(
                profile.getId(),
                profile.getMillName(),
                profile.getLocation(),
                profile.getRegistrationNumber(),
                profile.getMillingCapacityKgPerDay(),
                profile.getVerificationStatus()
        );
    }

    private MillLotResponse toLotResponse(PaddyLot lot) {
        Optional<MoistureReading> latestReading = moistureReadingRepository
                .findTopByLotIdOrderByMeasuredAtDesc(lot.getId());

        return new MillLotResponse(
                lot.getId(),
                lot.getFarm().getId(),
                lot.getProductType(),
                lot.getRiceType(),
                lot.getQuantityKg(),
                lot.getAskingPricePerKg(),
                lot.getAvailableDate(),
                lot.getStatus(),
                latestReading.map(MoistureReading::getMoisturePercentage).orElse(null),
                latestReading.map(MoistureReading::getDeviceNumber).orElse(null)
        );
    }
}
