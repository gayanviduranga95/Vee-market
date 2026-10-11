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

    private String source;

    private String verificationStatus;

    @Size(max = 100, message = "deviceMeasurementId must not exceed 100 characters")
    private String deviceMeasurementId;

    private java.time.LocalDateTime measuredAt;

    private String rawPayload;

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

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getVerificationStatus() {
        return verificationStatus;
    }

    public void setVerificationStatus(String verificationStatus) {
        this.verificationStatus = verificationStatus;
    }

    public String getDeviceMeasurementId() {
        return deviceMeasurementId;
    }

    public void setDeviceMeasurementId(String deviceMeasurementId) {
        this.deviceMeasurementId = deviceMeasurementId;
    }

    public java.time.LocalDateTime getMeasuredAt() {
        return measuredAt;
    }

    public void setMeasuredAt(java.time.LocalDateTime measuredAt) {
        this.measuredAt = measuredAt;
    }

    public String getRawPayload() {
        return rawPayload;
    }

    public void setRawPayload(String rawPayload) {
        this.rawPayload = rawPayload;
    }
}
