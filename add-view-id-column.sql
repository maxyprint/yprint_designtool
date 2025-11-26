-- 🎯 MULTI-VIEW PNG SYSTEM: Add view_id column to yprint_design_pngs table
-- This enables view-specific PNG storage (Front, Back, etc.)

-- Add view_id column to existing table
ALTER TABLE wp_yprint_design_pngs
ADD COLUMN view_id varchar(100) DEFAULT NULL AFTER design_id,
ADD COLUMN view_name varchar(255) DEFAULT NULL AFTER view_id;

-- Add composite index for efficient lookups
ALTER TABLE wp_yprint_design_pngs
ADD INDEX idx_design_view (design_id, view_id),
ADD INDEX idx_view_name (view_name);

-- Update existing records to have NULL view_id (backward compatibility)
-- These will be treated as legacy single-PNG designs

-- 📋 INSTRUCTIONS:
-- 1. Replace 'wp_' with your actual WordPress table prefix
-- 2. Execute this SQL in your WordPress database
-- 3. Existing PNG records will remain unchanged with view_id = NULL
-- 4. New multi-view PNGs will have specific view_id values

-- 🎯 RESULT:
-- - design_id='123', view_id=NULL → Legacy single PNG
-- - design_id='124', view_id='189542', view_name='Front' → Front view PNG
-- - design_id='124', view_id='679311', view_name='Back' → Back view PNG