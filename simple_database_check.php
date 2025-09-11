<?php
/**
 * YPrint Simple Database Check - Einfache Datenbank-Überprüfung
 * 
 * Dieses Script überprüft die wichtigsten Meta-Felder in der WordPress-Datenbank
 * ohne komplexe WordPress-Abhängigkeiten.
 */

echo "<h1>🔍 YPrint Simple Database Check</h1>\n";
echo "<h2>Überprüfung der wichtigsten Meta-Felder</h2>\n";

// Versuche WordPress zu laden
$wp_config_found = false;
$wp_paths = [
    '../../../wp-config.php',
    '../../wp-config.php', 
    '../wp-config.php',
    'wp-config.php'
];

foreach ($wp_paths as $path) {
    if (file_exists($path)) {
        require_once($path);
        $wp_config_found = true;
        echo "<p>✅ WordPress geladen von: {$path}</p>\n";
        break;
    }
}

if (!$wp_config_found) {
    echo "<h2>❌ WordPress nicht gefunden</h2>\n";
    echo "<p>WordPress wp-config.php konnte nicht gefunden werden.</p>\n";
    echo "<p>Verfügbare Pfade:</p>\n";
    echo "<ul>\n";
    foreach ($wp_paths as $path) {
        $exists = file_exists($path) ? "✅" : "❌";
        echo "<li>{$exists} {$path}</li>\n";
    }
    echo "</ul>\n";
    echo "<p>Bitte stellen Sie sicher, dass das Script im WordPress-Plugin-Verzeichnis ausgeführt wird.</p>\n";
    exit;
}

global $wpdb;

echo "<h3>📊 Datenbank-Verbindung</h3>\n";
echo "<p><strong>Datenbank:</strong> " . DB_NAME . "</p>\n";
echo "<p><strong>Host:</strong> " . DB_HOST . "</p>\n";
echo "<p><strong>Tabellen-Präfix:</strong> " . $wpdb->prefix . "</p>\n";

// 1. TEMPLATE-VARIATIONS CHECK
echo "<h3>1. 📸 Template Variations Check</h3>\n";

$template_variations_count = $wpdb->get_var("
    SELECT COUNT(*) 
    FROM {$wpdb->postmeta} 
    WHERE meta_key = '_template_variations'
");

echo "<p><strong>Anzahl Template Variations:</strong> {$template_variations_count}</p>\n";

if ($template_variations_count > 0) {
    $sample_variations = $wpdb->get_results("
        SELECT post_id, meta_value 
        FROM {$wpdb->postmeta} 
        WHERE meta_key = '_template_variations' 
        LIMIT 3
    ");
    
    echo "<h4>Beispiel Template Variations:</h4>\n";
    foreach ($sample_variations as $row) {
        echo "<p><strong>Template ID {$row->post_id}:</strong></p>\n";
        $variations = maybe_unserialize($row->meta_value);
        if (is_array($variations)) {
            echo "<pre>" . print_r($variations, true) . "</pre>\n";
        } else {
            echo "<p>Keine gültigen Variations-Daten</p>\n";
        }
    }
}

// 2. REFERENZMESSUNGEN CHECK
echo "<h3>2. 📏 Referenzmessungen Check</h3>\n";

$reference_measurements_count = $wpdb->get_var("
    SELECT COUNT(*) 
    FROM {$wpdb->postmeta} 
    WHERE meta_key = '_template_view_print_areas'
");

echo "<p><strong>Anzahl Referenzmessungen:</strong> {$reference_measurements_count}</p>\n";

if ($reference_measurements_count > 0) {
    $sample_references = $wpdb->get_results("
        SELECT post_id, meta_value 
        FROM {$wpdb->postmeta} 
        WHERE meta_key = '_template_view_print_areas' 
        LIMIT 2
    ");
    
    echo "<h4>Beispiel Referenzmessungen:</h4>\n";
    foreach ($sample_references as $row) {
        echo "<p><strong>Template ID {$row->post_id}:</strong></p>\n";
        $print_areas = maybe_unserialize($row->meta_value);
        if (is_array($print_areas)) {
            echo "<pre>" . print_r($print_areas, true) . "</pre>\n";
        } else {
            echo "<p>Keine gültigen Referenzmessungs-Daten</p>\n";
        }
    }
}

// 3. WORKFLOW-DATEN CHECK
echo "<h3>3. 🔄 Workflow-Daten Check</h3>\n";

$workflow_data_count = $wpdb->get_var("
    SELECT COUNT(*) 
    FROM {$wpdb->postmeta} 
    WHERE meta_key = '_yprint_workflow_data'
");

echo "<p><strong>Anzahl Workflow-Daten:</strong> {$workflow_data_count}</p>\n";

if ($workflow_data_count > 0) {
    $sample_workflow = $wpdb->get_results("
        SELECT post_id, meta_value 
        FROM {$wpdb->postmeta} 
        WHERE meta_key = '_yprint_workflow_data' 
        LIMIT 2
    ");
    
    echo "<h4>Beispiel Workflow-Daten:</h4>\n";
    foreach ($sample_workflow as $row) {
        echo "<p><strong>Order ID {$row->post_id}:</strong></p>\n";
        $workflow = maybe_unserialize($row->meta_value);
        if (is_array($workflow)) {
            echo "<pre>" . print_r($workflow, true) . "</pre>\n";
        } else {
            echo "<p>Keine gültigen Workflow-Daten</p>\n";
        }
    }
}

// 4. FINALE KOORDINATEN CHECK
echo "<h3>4. 🎯 Finale Koordinaten Check</h3>\n";

$final_coordinates_count = $wpdb->get_var("
    SELECT COUNT(*) 
    FROM {$wpdb->postmeta} 
    WHERE meta_key = '_yprint_final_coordinates'
");

echo "<p><strong>Anzahl finale Koordinaten:</strong> {$final_coordinates_count}</p>\n";

if ($final_coordinates_count > 0) {
    $sample_coordinates = $wpdb->get_results("
        SELECT post_id, meta_value 
        FROM {$wpdb->postmeta} 
        WHERE meta_key = '_yprint_final_coordinates' 
        LIMIT 3
    ");
    
    echo "<h4>Beispiel finale Koordinaten:</h4>\n";
    foreach ($sample_coordinates as $row) {
        echo "<p><strong>Order ID {$row->post_id}:</strong></p>\n";
        $coords = maybe_unserialize($row->meta_value);
        if (is_array($coords)) {
            echo "<pre>" . print_r($coords, true) . "</pre>\n";
        } else {
            echo "<p>Keine gültigen Koordinaten-Daten</p>\n";
        }
    }
}

// 5. PRODUKTDIMENSIONEN CHECK
echo "<h3>5. 📐 Produktdimensionen Check</h3>\n";

$product_dimensions_count = $wpdb->get_var("
    SELECT COUNT(*) 
    FROM {$wpdb->postmeta} 
    WHERE meta_key IN ('_template_product_dimensions', '_product_dimensions', '_template_measurements_table')
");

echo "<p><strong>Anzahl Produktdimensionen:</strong> {$product_dimensions_count}</p>\n";

if ($product_dimensions_count > 0) {
    $sample_dimensions = $wpdb->get_results("
        SELECT post_id, meta_key, meta_value 
        FROM {$wpdb->postmeta} 
        WHERE meta_key IN ('_template_product_dimensions', '_product_dimensions', '_template_measurements_table')
        LIMIT 3
    ");
    
    echo "<h4>Beispiel Produktdimensionen:</h4>\n";
    foreach ($sample_dimensions as $row) {
        echo "<p><strong>Template ID {$row->post_id} - {$row->meta_key}:</strong></p>\n";
        $dimensions = maybe_unserialize($row->meta_value);
        if (is_array($dimensions)) {
            echo "<pre>" . print_r($dimensions, true) . "</pre>\n";
        } else {
            echo "<p>Keine gültigen Produktdimensionen-Daten</p>\n";
        }
    }
}

// 6. ORDER-ITEMS CHECK
echo "<h3>6. 🛒 Order-Items Check</h3>\n";

$order_items_count = $wpdb->get_var("
    SELECT COUNT(*) 
    FROM {$wpdb->prefix}woocommerce_order_itemmeta 
    WHERE meta_key LIKE '%yprint%'
");

echo "<p><strong>Anzahl YPrint Order-Items:</strong> {$order_items_count}</p>\n";

if ($order_items_count > 0) {
    $sample_order_items = $wpdb->get_results("
        SELECT order_item_id, order_id, meta_key, meta_value 
        FROM {$wpdb->prefix}woocommerce_order_itemmeta 
        WHERE meta_key LIKE '%yprint%'
        LIMIT 5
    ");
    
    echo "<h4>Beispiel YPrint Order-Items:</h4>\n";
    foreach ($sample_order_items as $row) {
        echo "<p><strong>Order {$row->order_id}, Item {$row->order_item_id} - {$row->meta_key}:</strong> {$row->meta_value}</p>\n";
    }
}

echo "<h2>✅ Datenbank-Check abgeschlossen</h2>\n";
echo "<p>Diese Analyse zeigt die verfügbaren Daten in der WordPress-Datenbank für die YPrint-Vorschau.</p>\n";
?>
