package com.veemarket.business;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class RequirementOfferRequest {
    @NotNull
    @DecimalMin("0.01")
    private BigDecimal pricePerKg;

    public BigDecimal getPricePerKg() { return pricePerKg; }
    public void setPricePerKg(BigDecimal pricePerKg) { this.pricePerKg = pricePerKg; }
}
