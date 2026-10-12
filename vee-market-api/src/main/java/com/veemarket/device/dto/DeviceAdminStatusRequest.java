package com.veemarket.device.dto;

public class DeviceAdminStatusRequest {

    private String status;

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
}
