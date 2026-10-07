CREATE TABLE business_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    business_type VARCHAR(20) NOT NULL,
    business_name VARCHAR(150) NOT NULL,
    location VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_business_profile_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_business_profiles_type ON business_profiles(business_type);
