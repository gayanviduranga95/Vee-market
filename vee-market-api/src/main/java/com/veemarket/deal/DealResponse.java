package com.veemarket.deal;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record DealResponse(
        Long dealId,
        Long bidId,
        Long lotId,
        Long farmerUserId,
        Long millUserId,
        BigDecimal agreedPricePerKg,
        BigDecimal quantityKg,
        DealStatus status,
        PaymentStatus paymentStatus,
        DeliveryStatus deliveryStatus,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
