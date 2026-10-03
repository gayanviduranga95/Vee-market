package com.veemarket.moisture;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public class MoistureReadingRequest {

    @NotBlank(message = "deviceNumber is required")
    @Size(max = 100, message = "deviceNumber must not exceed 100 characters")
    private String deviceNumber;

    @NotNull(message = "moisturePercentage is required")
    @DecimalMin(value = "0.10", message = "moisturePercentage must be greater than 0")
    @DecimalMax(value = "60.00", message = "moisturePercentage must be realistic for paddy")
    private BigDecimal moisturePercentage;

    public String getDeviceNumber() {
        return deviceNumber;
    }

    public void setDeviceNumber(String deviceNumber) {
        this.deviceNumber = deviceNumber;
    }

    public BigDecimal getMoisturePercentage() {
        return moisturePercentage;
    }

    public void setMoisturePercentage(BigDecimal moisturePercentage) {
        this.moisturePercentage = moisturePercentage;
    }
}
