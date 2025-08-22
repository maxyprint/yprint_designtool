-- 🔍 SQL Queries to find measurement data in your database
-- Run these queries in phpMyAdmin to locate the correct table

-- 1. List all tables in your database
SHOW TABLES;

-- 2. Check if any tables contain measurement-related columns
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    DATA_TYPE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'dbs13227305' 
AND (
    COLUMN_NAME LIKE '%measurement%' 
    OR COLUMN_NAME LIKE '%template%' 
    OR COLUMN_NAME LIKE '%product%' 
    OR COLUMN_NAME LIKE '%dimension%' 
    OR COLUMN_NAME LIKE '%view%' 
    OR COLUMN_NAME LIKE '%print%'
);

-- 3. Look for tables that might contain the data
-- Replace 'your_table_name' with actual table names from step 1

-- Check if there's a posts table
SELECT * FROM posts WHERE post_type = 'design_template' LIMIT 5;

-- Check if there's a postmeta table (without wp_ prefix)
SELECT * FROM postmeta WHERE meta_key LIKE '%template%' OR meta_key LIKE '%measurement%' LIMIT 10;

-- Check if there's a templates table
SELECT * FROM templates LIMIT 5;

-- Check if there's a measurements table
SELECT * FROM measurements LIMIT 5;

-- 4. Search for measurement data in all text columns
-- This will search all tables for measurement-related content
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    'Contains measurement data' as NOTE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'dbs13227305' 
AND DATA_TYPE IN ('text', 'longtext', 'mediumtext', 'varchar', 'char')
AND (
    SELECT COUNT(*) 
    FROM (
        SELECT 1 
        FROM `$TABLE_NAME` 
        WHERE `$COLUMN_NAME` LIKE '%measurement%' 
        OR `$COLUMN_NAME` LIKE '%template%' 
        OR `$COLUMN_NAME` LIKE '%product%'
        LIMIT 1
    ) as subquery
) > 0;

-- 5. Alternative: Search for serialized data that might contain measurements
-- Look for data starting with 'a:' (serialized arrays) or '{' (JSON)
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    'Contains serialized data' as NOTE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'dbs13227305' 
AND DATA_TYPE IN ('text', 'longtext', 'mediumtext')
AND (
    SELECT COUNT(*) 
    FROM (
        SELECT 1 
        FROM `$TABLE_NAME` 
        WHERE `$COLUMN_NAME` LIKE 'a:%' 
        OR `$COLUMN_NAME` LIKE '{%'
        LIMIT 1
    ) as subquery
) > 0; 