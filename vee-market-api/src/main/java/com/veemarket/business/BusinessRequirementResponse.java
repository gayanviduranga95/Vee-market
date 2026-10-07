package com.veemarket.business;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record BusinessRequirementResponse(
        Long id,
        String riceType,
        BigDecimal quantityKg,
        RequirementFrequency frequency,
        String status,
        LocalDateTime createdAt
) {}
