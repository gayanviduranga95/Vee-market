package com.veemarket.device;

import com.veemarket.listing.PaddyLot;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "reading")
public class Reading {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "session_id", nullable = false, unique = true)
    private TestSession session;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "device_id", nullable = false)
    private Device device;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lot_id", nullable = false)
    private PaddyLot lot;

    @Column(name = "moisture_pct", nullable = false, precision = 4, scale = 1)
    private BigDecimal moisturePct;

    @Column(name = "zone_top", nullable = false, precision = 4, scale = 1)
    private BigDecimal zoneTop;

    @Column(name = "zone_middle", nullable = false, precision = 4, scale = 1)
    private BigDecimal zoneMiddle;

    @Column(name = "zone_bottom", nullable = false, precision = 4, scale = 1)
    private BigDecimal zoneBottom;

    @Column(name = "spread_pct", nullable = false, precision = 4, scale = 1)
    private BigDecimal spreadPct;

    @Column(name = "temp_c", precision = 4, scale = 1)
    private BigDecimal tempC;

    @Column(name = "calibration_version", nullable = false, length = 100)
    private String calibrationVersion;

    @Column(name = "firmware", length = 100)
    private String firmware;

    @Column(name = "received_at", nullable = false)
    private Instant receivedAt;

    @PrePersist
    protected void onCreate() {
        if (receivedAt == null) {
            receivedAt = Instant.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public TestSession getSession() {
        return session;
    }

    public void setSession(TestSession session) {
        this.session = session;
    }

    public Device getDevice() {
        return device;
    }

    public void setDevice(Device device) {
        this.device = device;
    }

    public PaddyLot getLot() {
        return lot;
    }

    public void setLot(PaddyLot lot) {
        this.lot = lot;
    }

    public BigDecimal getMoisturePct() {
        return moisturePct;
    }

    public void setMoisturePct(BigDecimal moisturePct) {
        this.moisturePct = moisturePct;
    }

    public BigDecimal getZoneTop() {
        return zoneTop;
    }

    public void setZoneTop(BigDecimal zoneTop) {
        this.zoneTop = zoneTop;
    }

    public BigDecimal getZoneMiddle() {
        return zoneMiddle;
    }

    public void setZoneMiddle(BigDecimal zoneMiddle) {
        this.zoneMiddle = zoneMiddle;
    }

    public BigDecimal getZoneBottom() {
        return zoneBottom;
    }

    public void setZoneBottom(BigDecimal zoneBottom) {
        this.zoneBottom = zoneBottom;
    }

    public BigDecimal getSpreadPct() {
        return spreadPct;
    }

    public void setSpreadPct(BigDecimal spreadPct) {
        this.spreadPct = spreadPct;
    }

    public BigDecimal getTempC() {
        return tempC;
    }

    public void setTempC(BigDecimal tempC) {
        this.tempC = tempC;
    }

    public String getCalibrationVersion() {
        return calibrationVersion;
    }

    public void setCalibrationVersion(String calibrationVersion) {
        this.calibrationVersion = calibrationVersion;
    }

    public String getFirmware() {
        return firmware;
    }

    public void setFirmware(String firmware) {
        this.firmware = firmware;
    }

    public Instant getReceivedAt() {
        return receivedAt;
    }

    public void setReceivedAt(Instant receivedAt) {
        this.receivedAt = receivedAt;
    }
}
