package com.veemarket.farm;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class FarmResponse {

    private Long id;
    private Long farmerId;
    private String farmName;
    private String location;
    private BigDecimal landSize;
    private String mainCrop;
    private LocalDateTime createdAt;

    public FarmResponse() {
    }

    public FarmResponse(
            Long id,
            Long farmerId,
            String farmName,
            String location,
            BigDecimal landSize,
            String mainCrop,
            LocalDateTime createdAt
    ) {
        this.id = id;
        this.farmerId = farmerId;
        this.farmName = farmName;
        this.location = location;
        this.landSize = landSize;
        this.mainCrop = mainCrop;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public Long getFarmerId() {
        return farmerId;
    }

    public String getFarmName() {
        return farmName;
    }

    public String getLocation() {
        return location;
    }

    public BigDecimal getLandSize() {
        return landSize;
    }

    public String getMainCrop() {
        return mainCrop;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}