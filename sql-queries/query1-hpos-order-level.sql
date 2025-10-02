-- QUERY 1: HPOS Order-Level Meta (Primary Storage)
-- Zweck: Prüfe, ob Design-Daten in HPOS-Tabelle deo6_wc_orders_meta vorhanden sind
-- Erwartung: Sollte _design_data für Test-Orders zeigen

SELECT
    om.order_id,
    om.meta_key,
    LENGTH(om.meta_value) AS data_size_bytes,
    LEFT(om.meta_value, 200) AS preview_value,
    CASE
        WHEN om.meta_value LIKE '{%' THEN 'JSON'
        WHEN om.meta_value LIKE 'a:%' THEN 'SERIALIZED'
        WHEN om.meta_value LIKE 'http%' THEN 'URL'
        ELSE 'STRING'
    END AS data_format
FROM deo6_wc_orders_meta om
WHERE om.meta_key IN ('_design_data', '_mockup_image_url', '_yprint_template_id', '_db_processed_views')
  AND om.order_id IN (5374, 5375, 5376, 5377, 5378)  -- ANPASSEN: Deine Test-Order IDs
ORDER BY om.order_id DESC, om.meta_key;

-- ERWARTETES ERGEBNIS:
-- ✅ Mindestens 1 Zeile mit meta_key = '_design_data' und data_size_bytes > 100
-- ❌ Wenn leer → Order ist Pre-HPOS oder Order-Level Save fehlgeschlagen
