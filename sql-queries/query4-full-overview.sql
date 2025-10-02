-- QUERY 4: Vollständige Order-Übersicht (Welche Orders haben Design-Daten?)
-- Zweck: Kombiniert alle 3 Speicherorte und zeigt, wo Daten sind
-- Erwartung: Zeigt alle Orders mit Design-Daten und ihren Speicherort

SELECT
    'HPOS_ORDER_META' AS storage_location,
    om.order_id,
    om.meta_key,
    LENGTH(om.meta_value) AS data_size_bytes,
    'CURRENT' AS migration_status
FROM deo6_wc_orders_meta om
WHERE om.meta_key IN ('_design_data', '_db_processed_views')
  AND LENGTH(om.meta_value) > 10

UNION ALL

SELECT
    'LEGACY_POSTMETA' AS storage_location,
    pm.post_id AS order_id,
    pm.meta_key,
    LENGTH(pm.meta_value) AS data_size_bytes,
    'PRE_HPOS' AS migration_status
FROM deo6_postmeta pm
INNER JOIN deo6_posts p ON pm.post_id = p.ID
WHERE pm.meta_key IN ('_design_data', '_db_processed_views')
  AND p.post_type = 'shop_order'
  AND LENGTH(pm.meta_value) > 10

UNION ALL

SELECT
    'ITEM_META' AS storage_location,
    oi.order_id,
    oim.meta_key,
    LENGTH(oim.meta_value) AS data_size_bytes,
    'ITEM_LEVEL' AS migration_status
FROM deo6_woocommerce_order_itemmeta oim
INNER JOIN deo6_woocommerce_order_items oi ON oim.order_item_id = oi.order_item_id
WHERE oim.meta_key IN ('_design_data', '_db_processed_views')
  AND LENGTH(oim.meta_value) > 10

ORDER BY order_id DESC, storage_location;

-- ERWARTETES ERGEBNIS:
-- ✅ Order in HPOS_ORDER_META + ITEM_META = Perfekt!
-- ⚠️ Order in HPOS + LEGACY = Partial Migration
-- ⚠️ Order nur in LEGACY = Nicht migriert
-- ❌ Order nur in ITEM_META = Order-Level Save fehlgeschlagen
