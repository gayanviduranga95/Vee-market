package com.veemarket.device.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;

public class ReadingRequest {

    @JsonProperty("session_id")
    @JsonAlias("sessionId")
    private Long sessionId;

    @JsonProperty("moisture_pct")
    @JsonAlias("moisturePct")
    private Double moisturePct;

    private ZonesDto zones;

    @JsonProperty("spread_pct")
    @JsonAlias("spreadPct")
    private Double spreadPct;

    @JsonProperty("temp_c")
    @JsonAlias("tempC")
    private Double tempC;

    @JsonProperty("calibration_version")
    @JsonAlias("calibrationVersion")
    private String calibrationVersion;

    private String firmware;

    public ReadingRequest() {}

    public Long getSessionId() {
        return sessionId;
    }

    public void setSessionId(Long sessionId) {
        this.sessionId = sessionId;
    }

    public Double getMoisturePct() {
        return moisturePct;
    }

    public void setMoisturePct(Double moisturePct) {
        this.moisturePct = moisturePct;
    }

    public ZonesDto getZones() {
        return zones;
    }

    public void setZones(ZonesDto zones) {
        this.zones = zones;
    }

    public Double getSpreadPct() {
        return spreadPct;
    }

    public void setSpreadPct(Double spreadPct) {
        this.spreadPct = spreadPct;
    }

    public Double getTempC() {
        return tempC;
    }

    public void setTempC(Double tempC) {
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
}
