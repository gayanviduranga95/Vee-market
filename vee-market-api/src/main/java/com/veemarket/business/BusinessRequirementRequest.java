package com.veemarket.business;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class BusinessRequirementRequest {
    @NotBlank
    private String riceType;

    @NotNull
    @DecimalMin("0.01")
    private BigDecimal quantityKg;

    @NotNull
    private RequirementFrequency frequency;

    public String getRiceType() { return riceType; }
    public void setRiceType(String riceType) { this.riceType = riceType; }
    public BigDecimal getQuantityKg() { return quantityKg; }
    public void setQuantityKg(BigDecimal quantityKg) { this.quantityKg = quantityKg; }
    public RequirementFrequency getFrequency() { return frequency; }
    public void setFrequency(RequirementFrequency frequency) { this.frequency = frequency; }
}
