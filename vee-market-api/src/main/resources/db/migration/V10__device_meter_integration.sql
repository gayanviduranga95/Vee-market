-- V10: Real Hardware Moisture Meter Integration
-- Implements Device, Test Session, and Reading tables as agreed in the hardware team contract.

-- 1. Device Table: Hardware pole registrations with hashed secret keys (BCrypt)
CREATE TABLE IF NOT EXISTS device (
    id BIGSERIAL PRIMARY KEY,
    device_code VARCHAR(100) NOT NULL UNIQUE,
    secret_hash VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
    last_seen_at TIMESTAMP WITH TIME ZONE,
    calibration_version VARCHAR(100),
    firmware_version VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Add locked and lot_code columns to paddy_lots
ALTER TABLE paddy_lots ADD COLUMN IF NOT EXISTS locked BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE paddy_lots ADD COLUMN IF NOT EXISTS lot_code VARCHAR(100);

-- Populate lot_code for any existing lots
UPDATE paddy_lots SET lot_code = CONCAT('L', id) WHERE lot_code IS NULL;

-- 3. Test Session Table: Tracks test lifecycle (open -> done / expired / cancelled)
CREATE TABLE IF NOT EXISTS test_session (
    id BIGSERIAL PRIMARY KEY,
    farmer_id BIGINT NOT NULL REFERENCES users(id),
    lot_id BIGINT NOT NULL REFERENCES paddy_lots(id),
    device_id BIGINT NOT NULL REFERENCES device(id),
    status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'done', 'expired', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    done_at TIMESTAMP WITH TIME ZONE
);

-- Ensure a device has at most ONE open session at any given time
CREATE UNIQUE INDEX IF NOT EXISTS ux_session_one_open_per_device
    ON test_session (device_id) WHERE status = 'open';

CREATE INDEX IF NOT EXISTS ix_session_lot ON test_session (lot_id);

-- 4. Reading Table: Write-once, immutable measurement data
CREATE TABLE IF NOT EXISTS reading (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL UNIQUE REFERENCES test_session(id),
    device_id BIGINT NOT NULL REFERENCES device(id),
    lot_id BIGINT NOT NULL REFERENCES paddy_lots(id),
    moisture_pct NUMERIC(4, 1) NOT NULL,
    zone_top NUMERIC(4, 1) NOT NULL,
    zone_middle NUMERIC(4, 1) NOT NULL,
    zone_bottom NUMERIC(4, 1) NOT NULL,
    spread_pct NUMERIC(4, 1) NOT NULL,
    temp_c NUMERIC(4, 1),
    calibration_version VARCHAR(100) NOT NULL,
    firmware VARCHAR(100),
    received_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ix_reading_lot ON reading (lot_id);
