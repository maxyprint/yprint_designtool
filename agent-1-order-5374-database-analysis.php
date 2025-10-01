<?php
/**
 * 🎯 AGENT 1: ORDER 5374 DATABASE META DATA ANALYSIS
 *
 * Mission: Check what design data exists in the database for Order 5374
 * This script analyzes the WordPress/WooCommerce database structure and queries
 * to understand what data is stored and where the AJAX handler looks for it.
 *
 * Run this in WordPress context or use it as a reference for manual queries.
 */

// Ensure this is run in WordPress context
if (!defined('ABSPATH')) {
    // Try to load WordPress
    $wp_load_paths = [
        '../../../wp-load.php',
        '../../wp-load.php',
        '../wp-load.php',
        'wp-load.php'
    ];

    foreach ($wp_load_paths as $path) {
        if (file_exists($path)) {
            require_once($path);
            break;
        }
    }

    if (!defined('ABSPATH')) {
        echo "❌ WordPress not found. This script documents the queries that should be run.\n\n";
        echo "=== MANUAL DATABASE QUERY INSTRUCTIONS ===\n\n";
        displayManualInstructions();
        exit;
    }
}

/**
 * Display manual SQL query instructions for when WordPress is not available
 */
function displayManualInstructions() {
    ?>
=== AGENT 1: ORDER 5374 DATABASE META DATA ANALYSIS ===

These are the SQL queries you should run to analyze Order 5374:

**QUERY 1: Check Order-Level Meta Data**
```sql
-- Check for design data stored at order level (post_id = 5374)
SELECT meta_key,
       LEFT(meta_value, 500) as meta_value_preview,
       LENGTH(meta_value) as data_size
FROM deo6_postmeta
WHERE post_id = 5374
  AND (meta_key LIKE '%design%'
       OR meta_key LIKE '%yprint%'
       OR meta_key LIKE '%mockup%'
       OR meta_key LIKE '%processed_views%'
       OR meta_key LIKE '%canvas%'
       OR meta_key LIKE '%template%');
```

**QUERY 2: Get Order Items**
```sql
-- Get all order items for Order 5374
SELECT order_item_id,
       order_item_name,
       order_item_type
FROM deo6_woocommerce_order_items
WHERE order_id = 5374;
```

**QUERY 3: Check Item-Level Meta Data**
```sql
-- Check for design data stored at item level
SELECT oim.order_item_id,
       oi.order_item_name,
       oim.meta_key,
       LEFT(oim.meta_value, 500) as meta_value_preview,
       LENGTH(oim.meta_value) as data_size
FROM deo6_woocommerce_order_itemmeta oim
INNER JOIN deo6_woocommerce_order_items oi ON oim.order_item_id = oi.order_item_id
WHERE oi.order_id = 5374
  AND (oim.meta_key LIKE '%design%'
       OR oim.meta_key LIKE '%yprint%'
       OR oim.meta_key LIKE '%mockup%'
       OR oim.meta_key LIKE '%processed%'
       OR oim.meta_key LIKE '%canvas%'
       OR oim.meta_key LIKE '%template%'
       OR oim.meta_key LIKE '%db_%');
```

**QUERY 4: Specific Meta Keys Check**
```sql
-- Check for specific meta keys the system looks for
SELECT
    'ORDER_META' as source,
    meta_key,
    CASE
        WHEN meta_value IS NULL THEN 'NULL'
        WHEN meta_value = '' THEN 'EMPTY'
        ELSE CONCAT(LEFT(meta_value, 100), '... (', LENGTH(meta_value), ' bytes)')
    END as value_info
FROM deo6_postmeta
WHERE post_id = 5374
  AND meta_key IN ('_design_data', '_mockup_image_url', '_yprint_template_id')

UNION ALL

SELECT
    CONCAT('ITEM_', oi.order_item_id) as source,
    oim.meta_key,
    CASE
        WHEN oim.meta_value IS NULL THEN 'NULL'
        WHEN oim.meta_value = '' THEN 'EMPTY'
        ELSE CONCAT(LEFT(oim.meta_value, 100), '... (', LENGTH(oim.meta_value), ' bytes)')
    END as value_info
FROM deo6_woocommerce_order_itemmeta oim
INNER JOIN deo6_woocommerce_order_items oi ON oim.order_item_id = oi.order_item_id
WHERE oi.order_id = 5374
  AND oim.meta_key IN ('_db_processed_views', '_yprint_template_id', '_mockup_image_url', 'design_id', 'canvas_data');
```

**EXPECTED META KEYS:**

Based on the code analysis, the system looks for these meta keys in this priority order:

**Order-Level (deo6_postmeta WHERE post_id = 5374):**
1. `_design_data` - Canvas design data (JSON format)
   - Checked first by ajax_load_design_preview() at line 4786
   - Format: JSON with canvas objects, background, etc.

**Item-Level (deo6_woocommerce_order_itemmeta):**
1. `_db_processed_views` - Print database processed views
   - Checked as fallback at line 4836-4845
   - Format: JSON from print database system
   - Will be converted to canvas format if found

2. `_yprint_template_id` - Template ID for mockup retrieval
   - Used to fetch template metadata at line 4874
   - Helps locate mockup image if not in design data

3. `design_id` - Design identifier
   - Used to check if item has design data

4. `_mockup_image_url` - Direct mockup image URL
   - Alternative source for mockup background

**DATA FLOW ANALYSIS:**

```
AJAX Handler: ajax_load_design_preview() (line 4726+)
│
├─► Step 1: Security Check (lines 4742-4780)
│   ├─ Validate order_id
│   ├─ Verify nonce
│   └─ Check user permissions
│
├─► Step 2: Check Order Meta (lines 4786-4832)
│   └─ get_post_meta($order_id, '_design_data', true)
│      └─ If found: Parse JSON and use directly
│
├─► Step 3: Check Item Meta (lines 4834-4846)
│   └─ foreach $order->get_items()
│      └─ $item->get_meta('_db_processed_views')
│         └─ If found: convert_processed_views_to_canvas_data()
│
└─► Step 4: Extract Mockup URL (lines 4858-4876+)
    ├─ Check design_data['background']
    ├─ Check design_data['mockup_url']
    └─ Check template meta from _yprint_template_id
```

**DIAGNOSIS QUESTIONS:**

1. Does Order 5374 have `_design_data` in deo6_postmeta?
   - YES → AJAX should work (primary data source)
   - NO → Check item meta

2. Do Order 5374 items have `_db_processed_views`?
   - YES → AJAX should work (fallback conversion)
   - NO → No preview data available

3. Are the meta values NULL, empty, or contain actual data?
   - NULL/EMPTY → Button shouldn't show (has_design_data returns false)
   - HAS DATA → Button should show and AJAX should work

4. What format is the data in?
   - JSON → Should parse correctly
   - Serialized PHP → Might cause issues
   - Plain text → Wrong format

**WHY AJAX MIGHT FAIL:**

Based on code analysis at lines 4786-4846:

1. ❌ Data exists but is in wrong table/column
   - Code only checks: deo6_postmeta._design_data
   - Code only checks: deo6_woocommerce_order_itemmeta._db_processed_views

2. ❌ Data exists but meta_key name is different
   - Typos: "_design_data" vs "design_data" (underscore matters!)
   - Different naming: "_canvas_data" vs "_design_data"

3. ❌ Data exists but is corrupted/invalid JSON
   - json_decode() fails → error logged at line 4826

4. ❌ Data exists but in wrong format
   - System expects specific JSON structure
   - Missing required fields → conversion fails

5. ❌ Multiple data sources conflict
   - Both _design_data AND _db_processed_views exist
   - System prioritizes _design_data (lines 4812-4832)

**NEXT STEPS:**

Run the queries above and report:
- Which meta keys exist
- What data size (bytes)
- First 100-500 characters of data
- Data format (JSON/Serialized/Other)

This will reveal exactly why the AJAX handler can't find the data.
<?php
}

/**
 * Main analysis function when WordPress is available
 */
function analyzeOrder5374() {
    echo "=== AGENT 1: ORDER 5374 DATABASE ANALYSIS ===\n\n";
    echo "📅 Analysis Time: " . current_time('mysql') . "\n";
    echo "🌐 WordPress Version: " . get_bloginfo('version') . "\n";
    echo "🛒 WooCommerce Version: " . (defined('WC_VERSION') ? WC_VERSION : 'N/A') . "\n\n";

    $order_id = 5374;

    // Check if order exists
    if (!function_exists('wc_get_order')) {
        echo "❌ ERROR: WooCommerce not active\n";
        return;
    }

    $order = wc_get_order($order_id);
    if (!$order) {
        echo "❌ ERROR: Order #{$order_id} not found\n";
        return;
    }

    echo "✅ Order #{$order_id} found\n";
    echo "   Status: " . $order->get_status() . "\n";
    echo "   Items: " . count($order->get_items()) . "\n\n";

    // ===== ORDER META ANALYSIS =====
    echo "━━━ ORDER META (post_id = {$order_id}) ━━━\n\n";

    $order_meta_keys = [
        '_design_data',
        '_mockup_image_url',
        '_yprint_template_id',
        'design_data', // Without underscore
        'canvas_data',
        'mockup_url'
    ];

    $order_meta_found = [];
    foreach ($order_meta_keys as $meta_key) {
        $value = get_post_meta($order_id, $meta_key, true);
        $exists = !empty($value);
        $size = $exists ? strlen($value) : 0;

        echo "📋 {$meta_key}:\n";
        if ($exists) {
            echo "   ✅ EXISTS ({$size} bytes)\n";
            echo "   Preview: " . substr($value, 0, 200) . "...\n";
            echo "   Format: " . detectFormat($value) . "\n";
            $order_meta_found[$meta_key] = [
                'size' => $size,
                'preview' => substr($value, 0, 500),
                'format' => detectFormat($value)
            ];
        } else {
            echo "   ❌ NOT FOUND\n";
        }
        echo "\n";
    }

    // Check for any other design-related meta
    echo "🔍 Searching for other design-related meta...\n";
    global $wpdb;
    $all_meta = $wpdb->get_results($wpdb->prepare("
        SELECT meta_key, LEFT(meta_value, 200) as preview, LENGTH(meta_value) as size
        FROM {$wpdb->postmeta}
        WHERE post_id = %d
          AND (meta_key LIKE '%%design%%'
               OR meta_key LIKE '%%canvas%%'
               OR meta_key LIKE '%%mockup%%'
               OR meta_key LIKE '%%view%%'
               OR meta_key LIKE '%%yprint%%')
    ", $order_id));

    if ($all_meta) {
        foreach ($all_meta as $meta) {
            if (!in_array($meta->meta_key, $order_meta_keys)) {
                echo "   🔹 {$meta->meta_key}: {$meta->size} bytes\n";
                echo "      Preview: {$meta->preview}...\n";
            }
        }
    } else {
        echo "   ℹ️  No additional design-related meta found\n";
    }
    echo "\n";

    // ===== ITEM META ANALYSIS =====
    echo "━━━ ORDER ITEMS META ━━━\n\n";

    foreach ($order->get_items() as $item_id => $item) {
        echo "📦 Item #{$item_id}: {$item->get_name()}\n";

        $item_meta_keys = [
            '_db_processed_views',
            '_yprint_template_id',
            '_mockup_image_url',
            'design_id',
            'canvas_data'
        ];

        $item_has_data = false;
        foreach ($item_meta_keys as $meta_key) {
            $value = $item->get_meta($meta_key);
            $exists = !empty($value);
            $size = $exists ? strlen($value) : 0;

            if ($exists) {
                $item_has_data = true;
                echo "   ✅ {$meta_key}: {$size} bytes\n";
                echo "      Preview: " . substr($value, 0, 200) . "...\n";
                echo "      Format: " . detectFormat($value) . "\n";
            } else {
                echo "   ❌ {$meta_key}: NOT FOUND\n";
            }
        }

        if (!$item_has_data) {
            echo "   ⚠️  NO DESIGN DATA FOUND FOR THIS ITEM\n";
        }
        echo "\n";
    }

    // ===== DATA LOCATION SUMMARY =====
    echo "━━━ DATA LOCATION SUMMARY ━━━\n\n";

    $has_order_design_data = isset($order_meta_found['_design_data']);
    $has_item_processed_views = false;

    foreach ($order->get_items() as $item) {
        if (!empty($item->get_meta('_db_processed_views'))) {
            $has_item_processed_views = true;
            break;
        }
    }

    echo "📍 Primary Data (_design_data): " . ($has_order_design_data ? "✅ FOUND" : "❌ NOT FOUND") . "\n";
    echo "📍 Fallback Data (_db_processed_views): " . ($has_item_processed_views ? "✅ FOUND" : "❌ NOT FOUND") . "\n\n";

    // ===== DIAGNOSIS =====
    echo "━━━ DIAGNOSIS ━━━\n\n";

    if ($has_order_design_data) {
        echo "✅ PRIMARY DATA SOURCE AVAILABLE\n";
        echo "   → AJAX handler should find data at line 4786\n";
        echo "   → get_post_meta({$order_id}, '_design_data', true)\n\n";

        // Validate JSON
        $design_data = $order_meta_found['_design_data']['preview'];
        $json = json_decode($design_data, true);
        if (json_last_error() === JSON_ERROR_NONE) {
            echo "✅ JSON FORMAT VALID\n";
            echo "   → Data should parse correctly\n\n";
        } else {
            echo "❌ JSON FORMAT INVALID\n";
            echo "   → Error: " . json_last_error_msg() . "\n";
            echo "   → This will cause AJAX failure at line 4826\n\n";
        }
    } elseif ($has_item_processed_views) {
        echo "✅ FALLBACK DATA SOURCE AVAILABLE\n";
        echo "   → AJAX handler should find data at line 4836\n";
        echo "   → \$item->get_meta('_db_processed_views')\n";
        echo "   → Data will be converted via convert_processed_views_to_canvas_data()\n\n";
    } else {
        echo "❌ NO DATA SOURCES AVAILABLE\n";
        echo "   → has_design_data() will return FALSE (line 6663)\n";
        echo "   → Button should NOT be displayed (line 3129)\n";
        echo "   → If button IS displayed, there's a logic error\n\n";
    }

    // ===== WHY AJAX MIGHT FAIL =====
    echo "━━━ POTENTIAL FAILURE CAUSES ━━━\n\n";

    if (!$has_order_design_data && !$has_item_processed_views) {
        echo "🔴 PRIMARY ISSUE: No design data in expected locations\n";
        echo "   Checked locations:\n";
        echo "   - deo6_postmeta WHERE post_id = {$order_id} AND meta_key = '_design_data'\n";
        echo "   - deo6_woocommerce_order_itemmeta WHERE meta_key = '_db_processed_views'\n\n";

        echo "   Possible reasons:\n";
        echo "   1. Data stored with different meta_key name\n";
        echo "   2. Data stored in different table\n";
        echo "   3. Data never saved during checkout\n";
        echo "   4. Data deleted or corrupted\n\n";
    }

    if ($has_order_design_data && $order_meta_found['_design_data']['format'] !== 'JSON') {
        echo "🔴 DATA FORMAT ISSUE: _design_data is not valid JSON\n";
        echo "   → json_decode() will fail at line 4821\n";
        echo "   → AJAX will return error\n\n";
    }

    echo "━━━ COMPLETE ━━━\n";
}

/**
 * Detect data format
 */
function detectFormat($data) {
    if (empty($data)) {
        return 'EMPTY';
    }

    // Try JSON
    $json = json_decode($data, true);
    if (json_last_error() === JSON_ERROR_NONE) {
        return 'JSON';
    }

    // Try serialized PHP
    $unserialized = @unserialize($data);
    if ($unserialized !== false) {
        return 'SERIALIZED_PHP';
    }

    // Check if it starts with common markers
    if (substr($data, 0, 1) === '{' || substr($data, 0, 1) === '[') {
        return 'JSON (Invalid)';
    }

    if (substr($data, 0, 2) === 'a:' || substr($data, 0, 2) === 'O:') {
        return 'SERIALIZED (Invalid)';
    }

    return 'UNKNOWN';
}

// Run analysis if WordPress is available
if (defined('ABSPATH')) {
    analyzeOrder5374();
} else {
    displayManualInstructions();
}
