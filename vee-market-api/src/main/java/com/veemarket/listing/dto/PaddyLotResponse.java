package com.veemarket.listing.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PaddyLotResponse(
        Long id,
        Long farmId,
        String productType,
        String riceType,
        BigDecimal quantityKg,
        BigDecimal askingPricePerKg,
        LocalDate availableDate,
        String status
) {
}
