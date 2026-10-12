package com.veemarket.device;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

public class DeviceContractUtils {

    public static final ZoneId LOCAL_ZONE = ZoneId.of("Asia/Colombo");
    public static final int SESSION_SECONDS = 300;
    public static final int DEVICE_POLL_SECONDS = 2;
    public static final int APP_POLL_SECONDS = 2;

    public static final double MOISTURE_MIN = 5.0;
    public static final double MOISTURE_MAX = 40.0;
    public static final double ZONE_MIN = 0.0;
    public static final double ZONE_MAX = 60.0;
    public static final double SPREAD_MIN = 0.0;
    public static final double SPREAD_MAX = 35.0;
    public static final double TEMP_MIN = -10.0;
    public static final double TEMP_MAX = 80.0;

    public static final String READING_LABEL = "Device reading";

    public static String toLocalIso(Instant instant) {
        if (instant == null) {
            return null;
        }
        return instant.atZone(LOCAL_ZONE).format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);
    }

    public static BigDecimal round1(BigDecimal val) {
        if (val == null) {
            return null;
        }
        return val.setScale(1, RoundingMode.HALF_UP);
    }

    public static BigDecimal round1(Double val) {
        if (val == null) {
            return null;
        }
        return BigDecimal.valueOf(val).setScale(1, RoundingMode.HALF_UP);
    }
}
