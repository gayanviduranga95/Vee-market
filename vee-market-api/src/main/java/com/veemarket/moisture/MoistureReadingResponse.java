package com.veemarket.moisture;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record MoistureReadingResponse(
        Long id,
        Long lotId,
        String deviceNumber,
        BigDecimal moisturePercentage,
        LocalDateTime measuredAt
) {
}
