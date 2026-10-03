package com.veemarket.mill;

import com.veemarket.farmer.VerificationStatus;

import java.math.BigDecimal;

public record MillProfileResponse(
        Long id,
        String millName,
        String location,
        String registrationNumber,
        BigDecimal millingCapacityKgPerDay,
        VerificationStatus verificationStatus
) {
}
