package com.veemarket.device.dto;

public class ZonesDto {

    private Double top;
    private Double middle;
    private Double bottom;

    public ZonesDto() {}

    public ZonesDto(Double top, Double middle, Double bottom) {
        this.top = top;
        this.middle = middle;
        this.bottom = bottom;
    }

    public Double getTop() {
        return top;
    }

    public void setTop(Double top) {
        this.top = top;
    }

    public Double getMiddle() {
        return middle;
    }

    public void setMiddle(Double middle) {
        this.middle = middle;
    }

    public Double getBottom() {
        return bottom;
    }

    public void setBottom(Double bottom) {
        this.bottom = bottom;
    }
}
