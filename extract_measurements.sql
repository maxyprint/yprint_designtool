-- 🔍 Extract complete measurement data from the serialized array

-- 1. Get the complete data in parts to see all measurements
SELECT 
    'Part 1 (1-1000)' as part,
    SUBSTRING(meta_value, 1, 1000) as data
FROM deo6_postmeta 
WHERE post_id = 3657 
AND meta_key = '_template_view_print_areas'

UNION ALL

SELECT 
    'Part 2 (1001-2000)' as part,
    SUBSTRING(meta_value, 1001, 1000) as data
FROM deo6_postmeta 
WHERE post_id = 3657 
AND meta_key = '_template_view_print_areas'

UNION ALL

SELECT 
    'Part 3 (2001-3000)' as part,
    SUBSTRING(meta_value, 2001, 1000) as data
FROM deo6_postmeta 
WHERE post_id = 3657 
AND meta_key = '_template_view_print_areas'

UNION ALL

SELECT 
    'Part 4 (3001-4226)' as part,
    SUBSTRING(meta_value, 3001, 1226) as data
FROM deo6_postmeta 
WHERE post_id = 3657 
AND meta_key = '_template_view_print_areas';

-- 2. Search for specific measurement types in the data
SELECT 
    'Contains height_from_shoulder' as search,
    CASE 
        WHEN meta_value LIKE '%height_from_shoulder%' THEN 'YES'
        ELSE 'NO'
    END as found
FROM deo6_postmeta 
WHERE post_id = 3657 
AND meta_key = '_template_view_print_areas'

UNION ALL

SELECT 
    'Contains chest' as search,
    CASE 
        WHEN meta_value LIKE '%chest%' THEN 'YES'
        ELSE 'NO'
    END as found
FROM deo6_postmeta 
WHERE post_id = 3657 
AND meta_key = '_template_view_print_areas'

UNION ALL

SELECT 
    'Contains size_scale_factors' as search,
    CASE 
        WHEN meta_value LIKE '%size_scale_factors%' THEN 'YES'
        ELSE 'NO'
    END as found
FROM deo6_postmeta 
WHERE post_id = 3657 
AND meta_key = '_template_view_print_areas'

UNION ALL

SELECT 
    'Contains measurements array' as search,
    CASE 
        WHEN meta_value LIKE '%measurements%' THEN 'YES'
        ELSE 'NO'
    END as found
FROM deo6_postmeta 
WHERE post_id = 3657 
AND meta_key = '_template_view_print_areas';

-- 3. Count how many measurements are stored
SELECT 
    'Measurement count' as info,
    (LENGTH(meta_value) - LENGTH(REPLACE(meta_value, 'measurement_type', ''))) / LENGTH('measurement_type') as count
FROM deo6_postmeta 
WHERE post_id = 3657 
AND meta_key = '_template_view_print_areas';

-- 4. Show the structure around measurements
SELECT 
    'Structure around measurements' as info,
    SUBSTRING(
        meta_value, 
        LOCATE('measurements', meta_value) - 50,
        200
    ) as structure_preview
FROM deo6_postmeta 
WHERE post_id = 3657 
AND meta_key = '_template_view_print_areas'; 