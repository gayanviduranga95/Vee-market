-- V11: Add device name and notes for administrator device management
ALTER TABLE device
    ADD COLUMN IF NOT EXISTS device_name VARCHAR(150),
    ADD COLUMN IF NOT EXISTS notes TEXT;
