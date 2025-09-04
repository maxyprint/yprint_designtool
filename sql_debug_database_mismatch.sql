-- ========================================
-- YPRINT DATENBANK-ABSTIMMUNG DEBUG SQL
-- ========================================
-- Analysiert warum die reparierte Funktion keine Daten findet
-- Template ID: 3657, Größe: s

-- 1. PRÜFE TEMPLATE-EXISTENZ UND POST-TYPE
-- ========================================
SELECT 
    ID as template_id,
    post_title as template_name,
    post_type,
    post_status,
    post_name as slug
FROM wp_posts 
WHERE ID = 3657;

-- 2. PRÜFE ALLE META-DATEN FÜR TEMPLATE 3657
-- ========================================
SELECT 
    post_id,
    meta_key,
    meta_value,
    LENGTH(meta_value) as value_length,
    CASE 
        WHEN meta_value IS NULL THEN 'NULL'
        WHEN meta_value = '' THEN 'EMPTY_STRING'
        WHEN meta_value = '[]' THEN 'EMPTY_ARRAY'
        WHEN meta_value = '{}' THEN 'EMPTY_OBJECT'
        WHEN LENGTH(meta_value) < 50 THEN 'SHORT_VALUE'
        ELSE 'LONG_VALUE'
    END as value_type
FROM wp_postmeta 
WHERE post_id = 3657
ORDER BY meta_key;

-- 3. DETAILLIERTE ANALYSE DER PRODUKTDIMENSIONEN
-- ========================================
-- Prüfe beide möglichen Meta-Keys
SELECT 
    post_id,
    meta_key,
    CASE 
        WHEN meta_value IS NULL THEN 'NULL'
        WHEN meta_value = '' THEN 'EMPTY_STRING'
        WHEN meta_value = '[]' THEN 'EMPTY_ARRAY'
        WHEN meta_value = '{}' THEN 'EMPTY_OBJECT'
        ELSE 'HAS_VALUE'
    END as value_status,
    SUBSTRING(meta_value, 1, 200) as value_preview,
    LENGTH(meta_value) as total_length
FROM wp_postmeta 
WHERE post_id = 3657 
AND meta_key IN ('_product_dimensions', '_template_product_dimensions')
ORDER BY meta_key;

-- 4. DETAILLIERTE ANALYSE DER TEMPLATE-MESSUNGEN
-- ========================================
-- Prüfe _template_view_print_areas
SELECT 
    post_id,
    meta_key,
    CASE 
        WHEN meta_value IS NULL THEN 'NULL'
        WHEN meta_value = '' THEN 'EMPTY_STRING'
        WHEN meta_value = '[]' THEN 'EMPTY_ARRAY'
        WHEN meta_value = '{}' THEN 'EMPTY_OBJECT'
        ELSE 'HAS_VALUE'
    END as value_status,
    SUBSTRING(meta_value, 1, 300) as value_preview,
    LENGTH(meta_value) as total_length
FROM wp_postmeta 
WHERE post_id = 3657 
AND meta_key = '_template_view_print_areas';

-- 5. JSON-STRUKTUR VALIDIERUNG
-- ========================================
-- Prüfe ob die JSON-Struktur gültig ist
SELECT 
    post_id,
    meta_key,
    JSON_VALID(meta_value) as is_valid_json,
    JSON_TYPE(meta_value) as json_type,
    JSON_LENGTH(meta_value) as json_length
FROM wp_postmeta 
WHERE post_id = 3657 
AND meta_key IN ('_product_dimensions', '_template_product_dimensions', '_template_view_print_areas')
AND meta_value IS NOT NULL 
AND meta_value != '';

-- 6. SPEZIFISCHE VIEW-ANALYSE
-- ========================================
-- Extrahiere View-IDs und Messungsanzahl
SELECT 
    post_id,
    meta_key,
    JSON_EXTRACT(meta_value, '$.189542') as view_189542_data,
    JSON_EXTRACT(meta_value, '$.679311') as view_679311_data,
    JSON_EXTRACT(meta_value, '$.189542.measurements') as view_189542_measurements,
    JSON_EXTRACT(meta_value, '$.679311.measurements') as view_679311_measurements
FROM wp_postmeta 
WHERE post_id = 3657 
AND meta_key = '_template_view_print_areas'
AND JSON_VALID(meta_value) = 1;

-- 7. MESSUNGSFELDER ANALYSE
-- ========================================
-- Prüfe die spezifischen Felder in den Messungen
SELECT 
    post_id,
    JSON_EXTRACT(meta_value, '$.189542.measurements[0].type') as view_189542_type,
    JSON_EXTRACT(meta_value, '$.189542.measurements[0].measurement_type') as view_189542_measurement_type,
    JSON_EXTRACT(meta_value, '$.189542.measurements[0].pixel_distance') as view_189542_pixel_distance,
    JSON_EXTRACT(meta_value, '$.189542.measurements[0].real_distance_cm') as view_189542_real_distance,
    JSON_EXTRACT(meta_value, '$.679311.measurements[0].type') as view_679311_type,
    JSON_EXTRACT(meta_value, '$.679311.measurements[0].measurement_type') as view_679311_measurement_type,
    JSON_EXTRACT(meta_value, '$.679311.measurements[0].pixel_distance') as view_679311_pixel_distance,
    JSON_EXTRACT(meta_value, '$.679311.measurements[0].real_distance_cm') as view_679311_real_distance
FROM wp_postmeta 
WHERE post_id = 3657 
AND meta_key = '_template_view_print_areas'
AND JSON_VALID(meta_value) = 1;

-- 8. ALTERNATIVE MESSUNGSSTRUKTUREN
-- ========================================
-- Suche nach verschiedenen möglichen Feldnamen
SELECT 
    post_id,
    JSON_EXTRACT(meta_value, '$.189542.measurements[0]') as view_189542_full_measurement,
    JSON_EXTRACT(meta_value, '$.679311.measurements[0]') as view_679311_full_measurement
FROM wp_postmeta 
WHERE post_id = 3657 
AND meta_key = '_template_view_print_areas'
AND JSON_VALID(meta_value) = 1;

-- 9. PRODUKTDIMENSIONEN-STRUKTUR
-- ========================================
-- Analysiere die Produktdimensionen-Struktur
SELECT 
    post_id,
    meta_key,
    JSON_EXTRACT(meta_value, '$.s') as size_s_data,
    JSON_EXTRACT(meta_value, '$.m') as size_m_data,
    JSON_EXTRACT(meta_value, '$.l') as size_l_data,
    JSON_EXTRACT(meta_value, '$.xl') as size_xl_data
FROM wp_postmeta 
WHERE post_id = 3657 
AND meta_key IN ('_product_dimensions', '_template_product_dimensions')
AND JSON_VALID(meta_value) = 1;

-- 10. ZUSAMMENFASSUNG DER DATENBANK-STRUKTUR
-- ========================================
-- Zeige alle verfügbaren Meta-Keys und deren Status
SELECT 
    'Template 3657 Meta-Daten Übersicht' as info,
    COUNT(*) as total_meta_entries,
    GROUP_CONCAT(
        CONCAT(meta_key, ':', 
            CASE 
                WHEN meta_value IS NULL THEN 'NULL'
                WHEN meta_value = '' THEN 'EMPTY'
                WHEN meta_value = '[]' THEN 'EMPTY_ARRAY'
                WHEN meta_value = '{}' THEN 'EMPTY_OBJECT'
                WHEN LENGTH(meta_value) < 50 THEN 'SHORT'
                ELSE 'LONG'
            END
        ) ORDER BY meta_key SEPARATOR ', '
    ) as meta_keys_status
FROM wp_postmeta 
WHERE post_id = 3657;

-- 11. FEHLENDE DATEN IDENTIFIZIEREN
-- ========================================
-- Prüfe welche Daten die reparierte Funktion erwartet vs. was vorhanden ist
SELECT 
    'Erwartete vs. Vorhandene Daten' as analysis,
    CASE 
        WHEN EXISTS(SELECT 1 FROM wp_postmeta WHERE post_id = 3657 AND meta_key = '_product_dimensions' AND meta_value != '' AND meta_value != '[]' AND meta_value != '{}') 
        THEN '✅ _product_dimensions vorhanden' 
        ELSE '❌ _product_dimensions fehlt oder leer' 
    END as product_dimensions_status,
    CASE 
        WHEN EXISTS(SELECT 1 FROM wp_postmeta WHERE post_id = 3657 AND meta_key = '_template_view_print_areas' AND meta_value != '' AND meta_value != '[]' AND meta_value != '{}') 
        THEN '✅ _template_view_print_areas vorhanden' 
        ELSE '❌ _template_view_print_areas fehlt oder leer' 
    END as template_measurements_status,
    CASE 
        WHEN EXISTS(SELECT 1 FROM wp_postmeta WHERE post_id = 3657 AND meta_key = '_template_view_print_areas' AND JSON_VALID(meta_value) = 1 AND JSON_EXTRACT(meta_value, '$.189542.measurements') IS NOT NULL) 
        THEN '✅ View 189542 Messungen vorhanden' 
        ELSE '❌ View 189542 Messungen fehlen' 
    END as view_189542_status,
    CASE 
        WHEN EXISTS(SELECT 1 FROM wp_postmeta WHERE post_id = 3657 AND meta_key = '_template_view_print_areas' AND JSON_VALID(meta_value) = 1 AND JSON_EXTRACT(meta_value, '$.679311.measurements') IS NOT NULL) 
        THEN '✅ View 679311 Messungen vorhanden' 
        ELSE '❌ View 679311 Messungen fehlen' 
    END as view_679311_status;
