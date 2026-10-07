CREATE TABLE requirement_offers (
    id BIGSERIAL PRIMARY KEY,
    requirement_id BIGINT NOT NULL,
    mill_user_id BIGINT NOT NULL,
    price_per_kg DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_requirement_mill_offer UNIQUE (requirement_id, mill_user_id),
    CONSTRAINT fk_requirement_offer_requirement FOREIGN KEY (requirement_id)
        REFERENCES business_requirements(id) ON DELETE CASCADE,
    CONSTRAINT fk_requirement_offer_mill FOREIGN KEY (mill_user_id)
        REFERENCES users(id) ON DELETE CASCADE
);