package com.veemarket.device.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;

public class LotPatchRequest {

    private String variety;

    @JsonProperty("quantity_kg")
    @JsonAlias("quantityKg")
    private Double quantityKg;

    public LotPatchRequest() {}

    public String getVariety() {
        return variety;
    }

    public void setVariety(String variety) {
        this.variety = variety;
    }

    public Double getQuantityKg() {
        return quantityKg;
    }

    public void setQuantityKg(Double quantityKg) {
        this.quantityKg = quantityKg;
    }
}
