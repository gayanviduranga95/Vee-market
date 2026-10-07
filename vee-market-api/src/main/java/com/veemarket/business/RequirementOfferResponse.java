package com.veemarket.business;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record RequirementOfferResponse(
        Long id,
        Long requirementId,
        String millName,
        BigDecimal pricePerKg,
        RequirementOfferStatus status,
        LocalDateTime createdAt
) {}
