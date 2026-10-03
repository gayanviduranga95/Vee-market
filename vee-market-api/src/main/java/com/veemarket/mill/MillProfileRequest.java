package com.veemarket.mill;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public class MillProfileRequest {

    @NotBlank(message = "millName is required")
    @Size(max = 150, message = "millName must not exceed 150 characters")
    private String millName;

    @Size(max = 255, message = "location must not exceed 255 characters")
    private String location;

    @NotBlank(message = "registrationNumber is required")
    @Size(max = 100, message = "registrationNumber must not exceed 100 characters")
    private String registrationNumber;

    @NotNull(message = "millingCapacityKgPerDay is required")
    @DecimalMin(value = "0.01", message = "millingCapacityKgPerDay must be positive")
    private BigDecimal millingCapacityKgPerDay;

    public String getMillName() {
        return millName;
    }

    public void setMillName(String millName) {
        this.millName = millName;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getRegistrationNumber() {
        return registrationNumber;
    }

    public void setRegistrationNumber(String registrationNumber) {
        this.registrationNumber = registrationNumber;
    }

    public BigDecimal getMillingCapacityKgPerDay() {
        return millingCapacityKgPerDay;
    }

    public void setMillingCapacityKgPerDay(BigDecimal millingCapacityKgPerDay) {
        this.millingCapacityKgPerDay = millingCapacityKgPerDay;
    }
}
