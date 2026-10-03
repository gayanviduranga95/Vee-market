package com.veemarket.bid;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class BidResponse {

    private Long bidId;
    private Long lotId;
    private Long millUserId;
    private BigDecimal bidPricePerKg;
    private BidStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public BidResponse(
            Long bidId,
            Long lotId,
            Long millUserId,
            BigDecimal bidPricePerKg,
            BidStatus status,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {
        this.bidId = bidId;
        this.lotId = lotId;
        this.millUserId = millUserId;
        this.bidPricePerKg = bidPricePerKg;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getBidId() {
        return bidId;
    }

    public Long getLotId() {
        return lotId;
    }

    public Long getMillUserId() {
        return millUserId;
    }

    public BigDecimal getBidPricePerKg() {
        return bidPricePerKg;
    }

    public BidStatus getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
