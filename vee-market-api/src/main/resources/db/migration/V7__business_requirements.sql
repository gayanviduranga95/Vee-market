CREATE TABLE business_requirements (
    id BIGSERIAL PRIMARY KEY,
    business_user_id BIGINT NOT NULL,
    rice_type VARCHAR(100) NOT NULL,
    quantity_kg DECIMAL(12,2) NOT NULL,
    frequency VARCHAR(20) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_business_requirement_user
        FOREIGN KEY (business_user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_business_requirements_user
    ON business_requirements(business_user_id);