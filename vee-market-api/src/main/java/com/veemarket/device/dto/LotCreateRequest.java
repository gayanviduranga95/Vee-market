package com.veemarket.device.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;

public class LotCreateRequest {

    private String variety;

    @JsonProperty("quantity_kg")
    @JsonAlias("quantityKg")
    private Double quantityKg;

    @JsonProperty("lot_code")
    @JsonAlias("lotCode")
    private String lotCode;

    public LotCreateRequest() {}

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

    public String getLotCode() {
        return lotCode;
    }

    public void setLotCode(String lotCode) {
        this.lotCode = lotCode;
    }
}
