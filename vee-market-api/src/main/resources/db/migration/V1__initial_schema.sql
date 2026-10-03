CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,

    name VARCHAR(150) NOT NULL,

    email VARCHAR(255) NOT NULL UNIQUE,

    password VARCHAR(255) NOT NULL,

    phone VARCHAR(30),

    role VARCHAR(30) NOT NULL,

    device_number VARCHAR(100) UNIQUE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE farmer_profiles (
    id BIGSERIAL PRIMARY KEY,

    user_id BIGINT NOT NULL UNIQUE,

    verification_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_farmer_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


CREATE TABLE farms (
    id BIGSERIAL PRIMARY KEY,

    farmer_id BIGINT NOT NULL,

    farm_name VARCHAR(150) NOT NULL,

    location VARCHAR(255),

    land_size DECIMAL(10,2),

    main_crop VARCHAR(100),

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_farm_farmer
        FOREIGN KEY (farmer_id)
        REFERENCES farmer_profiles(id)
        ON DELETE CASCADE
);


CREATE TABLE listings (
    id BIGSERIAL PRIMARY KEY,

    farm_id BIGINT NOT NULL,

    product_type VARCHAR(50) NOT NULL,

    rice_type VARCHAR(100),

    quantity DECIMAL(12,2) NOT NULL,

    price_per_kg DECIMAL(12,2) NOT NULL,

    available_date DATE NOT NULL,

    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_listing_farm
        FOREIGN KEY (farm_id)
        REFERENCES farms(id)
        ON DELETE CASCADE
);