-- 🔍 SQL Queries to get complete measurement data

-- 1. Get the complete meta_value without truncation
SELECT 
    post_id,
    meta_key,
    LENGTH(meta_value) as data_length,
    meta_value
FROM deo6_postmeta 
WHERE post_id = 3657 
AND meta_key = '_template_view_print_areas';

-- 2. Alternative: Export the data in chunks if it's very long
SELECT 
    post_id,
    meta_key,
    SUBSTRING(meta_value, 1, 1000) as data_part_1,
    SUBSTRING(meta_value, 1001, 1000) as data_part_2,
    SUBSTRING(meta_value, 2001, 1000) as data_part_3,
    SUBSTRING(meta_value, 3001, 1000) as data_part_4
FROM deo6_postmeta 
WHERE post_id = 3657 
AND meta_key = '_template_view_print_areas';

-- 3. Check if there are multiple view_print_areas entries
SELECT 
    post_id,
    meta_key,
    meta_id,
    LENGTH(meta_value) as data_length
FROM deo6_postmeta 
WHERE post_id = 3657 
AND meta_key LIKE '%view_print%'
ORDER BY meta_id DESC;

-- 4. Get all template-related meta data for comparison
SELECT 
    meta_key,
    LENGTH(meta_value) as data_length,
    LEFT(meta_value, 200) as preview
FROM deo6_postmeta 
WHERE post_id = 3657 
AND meta_key LIKE '%template%'
ORDER BY meta_key;

-- 5. Check for any recent changes to this template
SELECT 
    meta_id,
    meta_key,
    LENGTH(meta_value) as data_length,
    LEFT(meta_value, 100) as preview
FROM deo6_postmeta 
WHERE post_id = 3657 
ORDER BY meta_id DESC
LIMIT 10; 