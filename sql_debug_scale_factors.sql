-- ========================================
-- YPRINT SKALIERUNGSFAKTOREN DEBUG SQL
-- ========================================
-- Analysiert warum Skalierungsfaktoren leer bleiben
-- Template ID: 3657, Größe: s

-- 1. PRÜFE TEMPLATE-EXISTENZ
-- ========================================
SELECT 
    ID as template_id,
    post_title as template_name,
    post_type,
    post_status
FROM wp_posts 
WHERE ID = 3657 
AND post_type = 'design_template';

-- 2. PRÜFE PRODUKTDIMENSIONEN
-- ========================================
SELECT 
    post_id,
    meta_key,
    meta_value,
    LENGTH(meta_value) as value_length
FROM wp_postmeta 
WHERE post_id = 3657 
AND meta_key IN ('_product_dimensions', '_template_product_dimensions')
ORDER BY meta_key;

-- 3. PRÜFE TEMPLATE-VIEW-PRINT-AREAS
-- ========================================
SELECT 
    post_id,
    meta_key,
    meta_value,
    LENGTH(meta_value) as value_length
FROM wp_postmeta 
WHERE post_id = 3657 
AND meta_key = '_template_view_print_areas';

-- 4. DETAILLIERTE ANALYSE DER MESSUNGSDATEN
-- ========================================
SELECT 
    post_id,
    meta_key,
    SUBSTRING(meta_value, 1, 500) as meta_value_preview,
    LENGTH(meta_value) as total_length
FROM wp_postmeta 
WHERE post_id = 3657 
AND meta_key = '_template_view_print_areas';

-- 5. PRÜFE OB MESSUNGEN IN DER STRUKTUR EXISTIEREN
-- ========================================
-- Extrahiere View-IDs und Messungsanzahl
SELECT 
    post_id,
    JSON_EXTRACT(meta_value, '$.189542.measurements') as view_189542_measurements,
    JSON_EXTRACT(meta_value, '$.679311.measurements') as view_679311_measurements
FROM wp_postmeta 
WHERE post_id = 3657 
AND meta_key = '_template_view_print_areas';

-- 6. PRÜFE SPEZIFISCHE MESSUNGSFELDER
-- ========================================
-- Suche nach Messungstypen und Pixel-Distanzen
SELECT 
    post_id,
    JSON_EXTRACT(meta_value, '$.189542.measurements[0].type') as view_189542_type,
    JSON_EXTRACT(meta_value, '$.189542.measurements[0].pixel_distance') as view_189542_pixel_distance,
    JSON_EXTRACT(meta_value, '$.189542.measurements[0].real_distance_cm') as view_189542_real_distance,
    JSON_EXTRACT(meta_value, '$.679311.measurements[0].type') as view_679311_type,
    JSON_EXTRACT(meta_value, '$.679311.measurements[0].pixel_distance') as view_679311_pixel_distance,
    JSON_EXTRACT(meta_value, '$.679311.measurements[0].real_distance_cm') as view_679311_real_distance
FROM wp_postmeta 
WHERE post_id = 3657 
AND meta_key = '_template_view_print_areas';

-- 7. PRÜFE ALTERNATIVE MESSUNGSSTRUKTUREN
-- ========================================
-- Suche nach verschiedenen Feldnamen
SELECT 
    post_id,
    JSON_EXTRACT(meta_value, '$.189542.measurements[0]') as view_189542_full_measurement,
    JSON_EXTRACT(meta_value, '$.679311.measurements[0]') as view_679311_full_measurement
FROM wp_postmeta 
WHERE post_id = 3657 
AND meta_key = '_template_view_print_areas';

-- 8. PRÜFE OB DIE FUNKTION KORREKT AUFGERUFEN WIRD
-- ========================================
-- Suche nach Debug-Logs in der Datenbank (falls vorhanden)
SELECT 
    option_name,
    option_value,
    LENGTH(option_value) as value_length
FROM wp_options 
WHERE option_name LIKE '%scale%' 
OR option_name LIKE '%measurement%'
OR option_name LIKE '%debug%'
ORDER BY option_name;

-- 9. PRÜFE TEMPLATE-MESSUNGEN TABELLE (falls existiert)
-- ========================================
-- Diese Tabelle sollte nicht existieren, aber prüfen wir trotzdem
SHOW TABLES LIKE '%octo_template_measurements%';

-- 10. ZUSAMMENFASSUNG DER DATENSTRUKTUR
-- ========================================
SELECT 
    'Template 3657 Datenstruktur' as info,
    COUNT(*) as total_meta_entries,
    GROUP_CONCAT(meta_key) as available_meta_keys
FROM wp_postmeta 
WHERE post_id = 3657;
