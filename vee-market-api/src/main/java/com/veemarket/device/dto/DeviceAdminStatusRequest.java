package com.veemarket.device.dto;

public class DeviceAdminStatusRequest {

    private String status;

    @com.fasterxml.jackson.annotation.JsonProperty("device_name")
    @com.fasterxml.jackson.annotation.JsonAlias("deviceName")
    private String deviceName;

    private String notes;

    public DeviceAdminStatusRequest() {}

    public DeviceAdminStatusRequest(String status) {
        this.status = status;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
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
