package com.veemarket.mill;

import java.math.BigDecimal;
import java.time.LocalDate;

public record MillLotResponse(
        Long lotId,
        Long farmId,
        String productType,
        String riceType,
        BigDecimal quantityKg,
        BigDecimal askingPricePerKg,
        LocalDate availableDate,
        String status,
        BigDecimal latestMoisturePercentage,
        String latestMoistureDeviceNumber
) {
}
