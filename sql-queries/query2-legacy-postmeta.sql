-- QUERY 2: Legacy Order-Level Meta (Pre-HPOS)
-- Zweck: Prüfe, ob alte Orders noch in deo6_postmeta gespeichert sind
-- Erwartung: Leer (falls HPOS aktiv), oder Daten (falls Pre-HPOS Order)

SELECT
    pm.post_id AS order_id,
    pm.meta_key,
    LENGTH(pm.meta_value) AS data_size_bytes,
    LEFT(pm.meta_value, 200) AS preview_value,
    CASE
        WHEN pm.meta_value LIKE '{%' THEN 'JSON'
        WHEN pm.meta_value LIKE 'a:%' THEN 'SERIALIZED'
        WHEN pm.meta_value LIKE 'http%' THEN 'URL'
        ELSE 'STRING'
    END AS data_format,
    p.post_type,
    p.post_status
FROM deo6_postmeta pm
INNER JOIN deo6_posts p ON pm.post_id = p.ID
WHERE pm.meta_key IN ('_design_data', '_mockup_image_url', '_yprint_template_id', '_db_processed_views')
  AND p.post_type = 'shop_order'
  AND pm.post_id IN (5374, 5375, 5376, 5377, 5378)  -- ANPASSEN: Deine Test-Order IDs
ORDER BY pm.post_id DESC, pm.meta_key;

-- ERWARTETES ERGEBNIS:
-- ✅ Leer = Order ist bereits HPOS-migriert
-- ⚠️ Daten gefunden = Order ist noch PRE-HPOS → Migration empfohlen
