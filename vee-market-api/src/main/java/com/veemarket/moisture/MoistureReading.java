package com.veemarket.moisture;

import com.veemarket.listing.PaddyLot;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "moisture_readings")
public class MoistureReading {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lot_id", nullable = false)
    private PaddyLot lot;

    @Column(name = "device_number", nullable = false, length = 100)
    private String deviceNumber;

    @Column(name = "moisture_percentage", nullable = false, precision = 5, scale = 2)
    private BigDecimal moisturePercentage;

    @Column(name = "measured_at", nullable = false)
    private LocalDateTime measuredAt;

    @Column(name = "source", nullable = false, length = 30)
    private String source = "MANUAL";

    @Column(name = "verification_status", nullable = false, length = 30)
    private String verificationStatus = "UNVERIFIED";

    @Column(name = "device_measurement_id", length = 100)
    private String deviceMeasurementId;

    @Column(name = "raw_payload", columnDefinition = "TEXT")
    private String rawPayload;

    @PrePersist
    protected void onCreate() {
        if (measuredAt == null) {
            measuredAt = LocalDateTime.now();
        }
        if (source == null) {
            source = "MANUAL";
        }
        if (verificationStatus == null) {
            verificationStatus = "UNVERIFIED";
        }
    }

    public Long getId() {
        return id;
    }

    public PaddyLot getLot() {
        return lot;
    }

    public void setLot(PaddyLot lot) {
        this.lot = lot;
    }

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

    public LocalDateTime getMeasuredAt() {
        return measuredAt;
    }

    public void setMeasuredAt(LocalDateTime measuredAt) {
        this.measuredAt = measuredAt;
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

    public String getRawPayload() {
        return rawPayload;
    }

    public void setRawPayload(String rawPayload) {
        this.rawPayload = rawPayload;
    }
}
