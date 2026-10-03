-- Rename generic marketplace listings to paddy lots
ALTER TABLE listings
RENAME TO paddy_lots;

-- Rename quantity to make its meaning explicit
ALTER TABLE paddy_lots
RENAME COLUMN quantity TO quantity_kg;

-- Rename price to farmer's asking price
ALTER TABLE paddy_lots
RENAME COLUMN price_per_kg TO asking_price_per_kg;


-- Moisture readings from the supplied device
CREATE TABLE moisture_readings (
    id BIGSERIAL PRIMARY KEY,

    lot_id BIGINT NOT NULL,

    device_number VARCHAR(100) NOT NULL,

    moisture_percentage DECIMAL(5,2) NOT NULL,

    measured_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_moisture_lot
        FOREIGN KEY (lot_id)
        REFERENCES paddy_lots(id)
        ON DELETE CASCADE
);


-- Bids submitted by small mills
CREATE TABLE bids (
    id BIGSERIAL PRIMARY KEY,

    lot_id BIGINT NOT NULL,

    mill_user_id BIGINT NOT NULL,

    bid_price_per_kg DECIMAL(12,2) NOT NULL,

    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_bid_lot
        FOREIGN KEY (lot_id)
        REFERENCES paddy_lots(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_bid_mill
        FOREIGN KEY (mill_user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);