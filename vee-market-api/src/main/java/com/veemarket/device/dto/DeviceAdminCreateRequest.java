package com.veemarket.device.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;

public class DeviceAdminCreateRequest {

    @JsonProperty("device_code")
    @JsonAlias("deviceCode")
    private String deviceCode;

    @JsonProperty("device_name")
    @JsonAlias("deviceName")
    private String deviceName;

    private String notes;

    public DeviceAdminCreateRequest() {}

    public DeviceAdminCreateRequest(String deviceCode) {
        this.deviceCode = deviceCode;
    }

    public DeviceAdminCreateRequest(String deviceCode, String deviceName, String notes) {
        this.deviceCode = deviceCode;
        this.deviceName = deviceName;
        this.notes = notes;
    }

    public String getDeviceCode() {
        return deviceCode;
    }

    public void setDeviceCode(String deviceCode) {
        this.deviceCode = deviceCode;
    }

    public String getDeviceName() {
        return deviceName;
    }

    public void setDeviceName(String deviceName) {
        this.deviceName = deviceName;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
