package com.veemarket.device.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;

public class DeviceAdminCreateRequest {

    @JsonProperty("device_code")
    @JsonAlias("deviceCode")
    private String deviceCode;

    public DeviceAdminCreateRequest() {}

    public DeviceAdminCreateRequest(String deviceCode) {
        this.deviceCode = deviceCode;
    }

    public String getDeviceCode() {
        return deviceCode;
    }

    public void setDeviceCode(String deviceCode) {
        this.deviceCode = deviceCode;
    }
}
