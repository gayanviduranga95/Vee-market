CREATE TABLE mill_profiles (
    id BIGSERIAL PRIMARY KEY,

    user_id BIGINT NOT NULL UNIQUE,

    mill_name VARCHAR(150) NOT NULL,

    location VARCHAR(255),

    registration_number VARCHAR(100) NOT NULL,

    milling_capacity_kg_per_day DECIMAL(12,2),

    verification_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_mill_profile_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_mill_profiles_user_id ON mill_profiles(user_id);
CREATE INDEX idx_mill_profiles_verification_status ON mill_profiles(verification_status);
