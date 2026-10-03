package com.veemarket.listing;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public class PaddyLotRequest {

    @NotNull
    private Long farmId;

    private String productType;

    private String riceType;

    @NotNull
    @Positive
    private BigDecimal quantityKg;

    @NotNull
    @Positive
    private BigDecimal askingPricePerKg;

    @NotNull
    private LocalDate availableDate;

    public Long getFarmId() {
        return farmId;
    }

    public void setFarmId(Long farmId) {
        this.farmId = farmId;
    }

    public String getProductType() {
        return productType;
    }

    public void setProductType(String productType) {
        this.productType = productType;
    }

    public String getRiceType() {
        return riceType;
    }

    public void setRiceType(String riceType) {
        this.riceType = riceType;
    }

    public BigDecimal getQuantityKg() {
        return quantityKg;
    }

    public void setQuantityKg(BigDecimal quantityKg) {
        this.quantityKg = quantityKg;
    }

    public BigDecimal getAskingPricePerKg() {
        return askingPricePerKg;
    }

    public void setAskingPricePerKg(BigDecimal askingPricePerKg) {
        this.askingPricePerKg = askingPricePerKg;
    }

    public LocalDate getAvailableDate() {
        return availableDate;
    }

    public void setAvailableDate(LocalDate availableDate) {
        this.availableDate = availableDate;
    }
}
