package com.veemarket.device.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;

public class StartTestRequest {

    @JsonProperty("device_id")
    @JsonAlias("deviceId")
    private String deviceId;

    @JsonProperty("lot_id")
    @JsonAlias("lotId")
    private Long lotId;

    public StartTestRequest() {}

    public StartTestRequest(String deviceId, Long lotId) {
        this.deviceId = deviceId;
        this.lotId = lotId;
    }

    public String getDeviceId() {
        return deviceId;
    }

    public void setDeviceId(String deviceId) {
        this.deviceId = deviceId;
    }

    public Long getLotId() {
        return lotId;
    }

    public void setLotId(Long lotId) {
        this.lotId = lotId;
    }
}
