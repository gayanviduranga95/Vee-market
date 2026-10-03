package com.veemarket.moisture;

import com.veemarket.farmer.FarmerProfile;
import com.veemarket.farmer.FarmerProfileRepository;
import com.veemarket.listing.PaddyLot;
import com.veemarket.listing.PaddyLotRepository;
import com.veemarket.user.User;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class MoistureReadingService {

    private static final BigDecimal MIN_MOISTURE = new BigDecimal("0.10");
    private static final BigDecimal MAX_MOISTURE = new BigDecimal("60.00");

    private final MoistureReadingRepository moistureReadingRepository;
    private final PaddyLotRepository paddyLotRepository;
    private final FarmerProfileRepository farmerProfileRepository;

    public MoistureReadingService(
            MoistureReadingRepository moistureReadingRepository,
            PaddyLotRepository paddyLotRepository,
            FarmerProfileRepository farmerProfileRepository
    ) {
        this.moistureReadingRepository = moistureReadingRepository;
        this.paddyLotRepository = paddyLotRepository;
        this.farmerProfileRepository = farmerProfileRepository;
    }

    @Transactional
    public MoistureReadingResponse createReading(
            User user,
            Long lotId,
            MoistureReadingRequest request
    ) {
        PaddyLot lot = paddyLotRepository.findById(lotId)
                .orElseThrow(() -> new EntityNotFoundException("Paddy lot not found"));

        validateOwnership(user, lot);

        String deviceNumber = request.getDeviceNumber() == null
                ? ""
                : request.getDeviceNumber().trim();

        if (deviceNumber.isBlank()) {
            throw new IllegalArgumentException("deviceNumber is required");
        }

        if (request.getMoisturePercentage() == null) {
            throw new IllegalArgumentException("moisturePercentage is required");
        }

        validateMoisture(request.getMoisturePercentage());

        String registeredDevice = user.getDeviceNumber();
        if (registeredDevice != null
                && !registeredDevice.isBlank()
                && !registeredDevice.equalsIgnoreCase(deviceNumber)) {
            throw new IllegalArgumentException(
                    "Device number must match the authenticated farmer device"
            );
        }

        MoistureReading reading = new MoistureReading();
        reading.setLot(lot);
        reading.setDeviceNumber(deviceNumber);
        reading.setMoisturePercentage(request.getMoisturePercentage());

        MoistureReading saved = moistureReadingRepository.save(reading);

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<MoistureReadingResponse> getReadings(User user, Long lotId) {
        PaddyLot lot = paddyLotRepository.findById(lotId)
                .orElseThrow(() -> new EntityNotFoundException("Paddy lot not found"));

        validateOwnership(user, lot);

        return moistureReadingRepository.findByLotIdOrderByMeasuredAtDesc(lotId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public MoistureReadingResponse getLatestReading(User user, Long lotId) {
        PaddyLot lot = paddyLotRepository.findById(lotId)
                .orElseThrow(() -> new EntityNotFoundException("Paddy lot not found"));

        validateOwnership(user, lot);

        MoistureReading reading = moistureReadingRepository
                .findTopByLotIdOrderByMeasuredAtDesc(lotId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "No moisture readings found for this lot"
                ));

        return toResponse(reading);
    }

    private void validateOwnership(User user, PaddyLot lot) {
        FarmerProfile farmerProfile = farmerProfileRepository
                .findByUserId(user.getId())
                .orElseThrow(() -> new AccessDeniedException(
                        "Farmer profile not found"
                ));

        if (lot.getFarm() == null
                || lot.getFarm().getFarmer() == null
                || !lot.getFarm().getFarmer().getId().equals(farmerProfile.getId())) {
            throw new AccessDeniedException(
                    "You can only manage moisture readings on your own lots"
            );
        }
    }

    private void validateMoisture(BigDecimal moisturePercentage) {
        if (moisturePercentage.compareTo(MIN_MOISTURE) < 0
                || moisturePercentage.compareTo(MAX_MOISTURE) > 0) {
            throw new IllegalArgumentException(
                    "moisturePercentage must be between 0.10 and 60.00"
            );
        }
    }

    private MoistureReadingResponse toResponse(MoistureReading reading) {
        return new MoistureReadingResponse(
                reading.getId(),
                reading.getLot().getId(),
                reading.getDeviceNumber(),
                reading.getMoisturePercentage(),
                reading.getMeasuredAt()
        );
    }
}
