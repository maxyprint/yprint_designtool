-- QUERY 5: Meta-Key Varianten-Suche (Finde Typos und falsche Keys)
-- Zweck: Zeige ALLE Design-bezogenen Meta-Keys (auch Typos wie "design_data" ohne _)
-- Erwartung: Sollte nur "_design_data" (mit Unterstrich) zeigen

SELECT DISTINCT
    'HPOS_META' AS source_table,
    meta_key,
    COUNT(*) AS occurrence_count,
    SUM(LENGTH(meta_value)) AS total_data_size_bytes
FROM deo6_wc_orders_meta
WHERE meta_key LIKE '%design%'
   OR meta_key LIKE '%canvas%'
   OR meta_key LIKE '%mockup%'
   OR meta_key LIKE '%template%'
   OR meta_key LIKE '%processed%'
   OR meta_key LIKE '%yprint%'
GROUP BY meta_key

UNION ALL

SELECT DISTINCT
    'LEGACY_META' AS source_table,
    pm.meta_key,
    COUNT(*) AS occurrence_count,
    SUM(LENGTH(pm.meta_value)) AS total_data_size_bytes
FROM deo6_postmeta pm
INNER JOIN deo6_posts p ON pm.post_id = p.ID
WHERE p.post_type = 'shop_order'
  AND (pm.meta_key LIKE '%design%'
   OR pm.meta_key LIKE '%canvas%'
   OR pm.meta_key LIKE '%mockup%'
   OR pm.meta_key LIKE '%template%'
   OR pm.meta_key LIKE '%processed%'
   OR pm.meta_key LIKE '%yprint%')
GROUP BY pm.meta_key

UNION ALL

SELECT DISTINCT
    'ITEM_META' AS source_table,
    meta_key,
    COUNT(*) AS occurrence_count,
    SUM(LENGTH(meta_value)) AS total_data_size_bytes
FROM deo6_woocommerce_order_itemmeta
WHERE meta_key LIKE '%design%'
   OR meta_key LIKE '%canvas%'
   OR meta_key LIKE '%mockup%'
   OR meta_key LIKE '%template%'
   OR meta_key LIKE '%processed%'
   OR meta_key LIKE '%yprint%'
GROUP BY meta_key

ORDER BY source_table, meta_key;

-- ERWARTETES ERGEBNIS:
-- ✅ Nur "_design_data" (mit Unterstrich) = Korrekt
-- ❌ "design_data" (ohne Unterstrich) = TYPO gefunden!
-- ❌ Unbekannte Keys = Falsche Naming Convention
