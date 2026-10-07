package com.veemarket.business;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class BusinessProfileRequest {
    @NotNull
    private BusinessType businessType;

    @NotBlank
    @Size(max = 150)
    private String businessName;

    @Size(max = 255)
    private String location;

    public BusinessType getBusinessType() { return businessType; }
    public void setBusinessType(BusinessType businessType) { this.businessType = businessType; }
    public String getBusinessName() { return businessName; }
    public void setBusinessName(String businessName) { this.businessName = businessName; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
}
