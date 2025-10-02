-- QUERY 3: Item-Level Meta (Order Line Items)
-- Zweck: Prüfe, ob Design-Daten auf Item-Ebene gespeichert sind
-- Erwartung: Sollte _design_data UND/ODER _db_processed_views zeigen

SELECT
    oi.order_id,
    oi.order_item_id,
    oi.order_item_name AS product_name,
    oim.meta_key,
    LENGTH(oim.meta_value) AS data_size_bytes,
    LEFT(oim.meta_value, 200) AS preview_value,
    CASE
        WHEN oim.meta_value LIKE '{%' THEN 'JSON'
        WHEN oim.meta_value LIKE 'a:%' THEN 'SERIALIZED'
        WHEN oim.meta_value LIKE 'http%' THEN 'URL'
        ELSE 'STRING'
    END AS data_format
FROM deo6_woocommerce_order_itemmeta oim
INNER JOIN deo6_woocommerce_order_items oi ON oim.order_item_id = oi.order_item_id
WHERE oim.meta_key IN ('_design_data', '_db_processed_views', '_yprint_template_id', '_mockup_image_url', 'design_id', 'canvas_data')
  AND oi.order_id IN (5374, 5375, 5376, 5377, 5378)  -- ANPASSEN: Deine Test-Order IDs
ORDER BY oi.order_id DESC, oi.order_item_id, oim.meta_key;

-- ERWARTETES ERGEBNIS:
-- ✅ Daten gefunden = Item-Level Speicherung funktioniert
-- ❌ Leer = Keine Design-Produkte in Order ODER Cart-Integration fehlerhaft
