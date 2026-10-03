package com.veemarket.bid;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class BidRequest {

    @NotNull(message = "Bid price is required")
    @DecimalMin(value = "0.01", message = "Bid price must be greater than zero")
    private BigDecimal bidPricePerKg;

    public BigDecimal getBidPricePerKg() {
        return bidPricePerKg;
    }

    public void setBidPricePerKg(BigDecimal bidPricePerKg) {
        this.bidPricePerKg = bidPricePerKg;
    }
}
