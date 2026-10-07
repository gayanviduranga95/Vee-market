package com.veemarket.listing.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record PaddyLotResponse(
        Long id,
        Long farmId,
        String farmName,
        String productType,
        String riceType,
        BigDecimal quantityKg,
        BigDecimal askingPricePerKg,
        LocalDate availableDate,
        String status,
        LocalDateTime createdAt
) {
    public PaddyLotResponse(
            Long id,
            Long farmId,
            String productType,
            String riceType,
            BigDecimal quantityKg,
            BigDecimal askingPricePerKg,
            LocalDate availableDate,
            String status
    ) {
        this(id, farmId, null, productType, riceType, quantityKg, askingPricePerKg, availableDate, status, null);
    }
}
