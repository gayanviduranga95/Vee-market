package com.veemarket.moisture;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record MoistureReadingResponse(
        Long id,
        Long lotId,
        String deviceNumber,
        BigDecimal moisturePercentage,
        LocalDateTime measuredAt,
        String source,
        String verificationStatus,
        String deviceMeasurementId
) {
    public MoistureReadingResponse(
            Long id,
            Long lotId,
            String deviceNumber,
            BigDecimal moisturePercentage,
            LocalDateTime measuredAt
    ) {
        this(id, lotId, deviceNumber, moisturePercentage, measuredAt, "MANUAL", "UNVERIFIED", null);
    }
}
