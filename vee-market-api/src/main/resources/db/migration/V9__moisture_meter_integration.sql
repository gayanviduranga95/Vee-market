-- V9: Enhance moisture readings for Wi-Fi IoT moisture meters and decouple device_number uniqueness on users
-- 1. Remove unique constraint on users(device_number) if it exists, so devices can be shared and not tied to user accounts
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_device_number_key;

-- 2. Add verification, measurement metadata, and raw payload fields to moisture_readings
ALTER TABLE moisture_readings
    ADD COLUMN IF NOT EXISTS source VARCHAR(30) NOT NULL DEFAULT 'MANUAL',
    ADD COLUMN IF NOT EXISTS verification_status VARCHAR(30) NOT NULL DEFAULT 'UNVERIFIED',
    ADD COLUMN IF NOT EXISTS device_measurement_id VARCHAR(100),
    ADD COLUMN IF NOT EXISTS raw_payload TEXT;

-- 3. Add index for faster query by lot and device measurement deduplication
CREATE INDEX IF NOT EXISTS idx_moisture_readings_lot_measured ON moisture_readings(lot_id, measured_at DESC);
CREATE INDEX IF NOT EXISTS idx_moisture_readings_device_measurement ON moisture_readings(device_number, device_measurement_id);
