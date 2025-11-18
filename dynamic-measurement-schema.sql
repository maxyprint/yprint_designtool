-- 🏗️ AGENT 2: Dynamic Measurement Database Schema
-- Agent: DatabaseSchemaArchitect
-- Mission: Schema design with Template Sizes integration

-- =====================================================
-- DYNAMIC MEASUREMENT TABLE WITH TEMPLATE SIZES SYNC
-- =====================================================

CREATE TABLE wp_template_measurements (
    id BIGINT(20) NOT NULL AUTO_INCREMENT,

    -- Template Reference (Foreign Key)
    template_id BIGINT(20) NOT NULL,

    -- DYNAMIC Size Key (from _template_sizes.id)
    -- No longer hardcoded S/M/L/XL - can be any size
    size_key VARCHAR(50) NOT NULL,

    -- Measurement Type (A-J standard clothing measurements)
    measurement_key VARCHAR(50) NOT NULL,
    measurement_label VARCHAR(255) NOT NULL,

    -- Measurement Value in Centimeters (high precision)
    value_cm DECIMAL(10,2) NOT NULL,

    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Primary Key
    PRIMARY KEY (id),

    -- Unique Constraint: One measurement per template/size/type combination
    UNIQUE KEY template_size_measurement (template_id, size_key, measurement_key),

    -- Indexes for Performance
    KEY template_id (template_id),
    KEY size_key (size_key),
    KEY measurement_key (measurement_key),
    KEY template_size_combo (template_id, size_key),

    -- Foreign Key Constraint to Templates
    CONSTRAINT fk_template_measurements_template
        FOREIGN KEY (template_id)
        REFERENCES wp_posts(ID)
        ON DELETE CASCADE ON UPDATE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- DYNAMIC SIZE SYNCHRONIZATION LOGIC
-- =====================================================

-- This table will sync with _template_sizes meta field:
-- _template_sizes structure: [{'id': 'L', 'name': 'Large', 'order': 3}]
-- measurement table uses: size_key = 'L' (matches _template_sizes.id)

-- Benefits:
-- 1. Supports ANY size combinations (XS, S, M, L, XL, XXL, 3XL, Custom1, etc.)
-- 2. Auto-populates when template sizes change
-- 3. Maintains referential integrity
-- 4. Optimized for fast lookups

-- Sample Data Structure:
-- template_id=1, size_key='XS', measurement_key='A', value_cm=58.0
-- template_id=1, size_key='S',  measurement_key='A', value_cm=60.0
-- template_id=1, size_key='M',  measurement_key='A', value_cm=62.0
-- template_id=1, size_key='L',  measurement_key='A', value_cm=64.0
-- template_id=1, size_key='XL', measurement_key='A', value_cm=66.0