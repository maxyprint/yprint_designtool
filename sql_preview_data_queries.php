<?php
/**
 * YPrint SQL Preview Data Queries - Exakte SQL-Abfragen für Vorschau-Daten
 * 
 * Dieses Script zeigt die exakten SQL-Abfragen, die die Vorschau verwenden sollte,
 * um die korrekten Daten aus der WordPress-Datenbank zu laden.
 */

// WordPress-Umgebung laden
require_once('../../../wp-config.php');

echo "<h1>🔍 YPrint SQL Preview Data Queries</h1>\n";
echo "<h2>Exakte SQL-Abfragen für millimetergenaue Vorschau</h2>\n";

global $wpdb;

// Beispiel-Template-ID und Order-ID (ersetzen Sie diese mit echten Werten)
$template_id = 3657; // Beispiel-Template-ID
$order_id = 123; // Beispiel-Order-ID

echo "<h3>📋 Verwendete Parameter:</h3>\n";
echo "<ul>\n";
echo "<li><strong>Template ID:</strong> {$template_id}</li>\n";
echo "<li><strong>Order ID:</strong> {$order_id}</li>\n";
echo "</ul>\n";

// 1. TEMPLATE-BILD SQL-ABFRAGE
echo "<h3>1. 📸 Template-Bild SQL-Abfrage</h3>\n";

$template_image_sql = "
-- PRIORITÄT 1: Template Variations
SELECT meta_value 
FROM {$wpdb->postmeta} 
WHERE post_id = {$template_id} 
AND meta_key = '_template_variations'
";

echo "<h4>SQL-Abfrage für Template-Bild:</h4>\n";
echo "<pre>" . htmlspecialchars($template_image_sql) . "</pre>\n";

$template_variations_result = $wpdb->get_var($template_image_sql);
if ($template_variations_result) {
    $variations = maybe_unserialize($template_variations_result);
    echo "<h4>Ergebnis:</h4>\n";
    echo "<pre>" . print_r($variations, true) . "</pre>\n";
    
    // Extrahiere Bild-ID aus Variations
    if (is_array($variations)) {
        foreach ($variations as $var_id => $variation) {
            if (isset($variation['views'])) {
                foreach ($variation['views'] as $view_id => $view) {
                    if (isset($view['image']) || isset($view['attachment_id'])) {
                        $image_id = $view['image'] ?? $view['attachment_id'];
                        echo "<p><strong>Gefundene Bild-ID:</strong> {$image_id}</p>\n";
                        
                        // Lade Bild-URL
                        $image_url = wp_get_attachment_url($image_id);
                        echo "<p><strong>Bild-URL:</strong> {$image_url}</p>\n";
                        break 2;
                    }
                }
            }
        }
    }
} else {
    echo "<p><strong>Keine Template-Variations gefunden</strong></p>\n";
}

// 2. REFERENZMESSUNGEN SQL-ABFRAGE
echo "<h3>2. 📏 Referenzmessungen SQL-Abfrage</h3>\n";

$reference_measurements_sql = "
-- Referenzmessungen aus Template View Print Areas
SELECT meta_value 
FROM {$wpdb->postmeta} 
WHERE post_id = {$template_id} 
AND meta_key = '_template_view_print_areas'
";

echo "<h4>SQL-Abfrage für Referenzmessungen:</h4>\n";
echo "<pre>" . htmlspecialchars($reference_measurements_sql) . "</pre>\n";

$reference_result = $wpdb->get_var($reference_measurements_sql);
if ($reference_result) {
    $print_areas = maybe_unserialize($reference_result);
    echo "<h4>Ergebnis:</h4>\n";
    echo "<pre>" . print_r($print_areas, true) . "</pre>\n";
    
    // Extrahiere Referenzmessungen
    if (is_array($print_areas)) {
        foreach ($print_areas as $view_id => $view_data) {
            if (isset($view_data['measurements']['reference_measurement'])) {
                $ref = $view_data['measurements']['reference_measurement'];
                echo "<h5>Referenzmessung für View {$view_id}:</h5>\n";
                echo "<ul>\n";
                echo "<li><strong>Type:</strong> " . ($ref['measurement_type'] ?? 'unknown') . "</li>\n";
                echo "<li><strong>Physical Size:</strong> " . ($ref['physical_size_cm'] ?? 'unknown') . " cm</li>\n";
                echo "<li><strong>Pixel Distance:</strong> " . ($ref['pixel_distance'] ?? 'unknown') . " px</li>\n";
                if (isset($ref['reference_points'])) {
                    echo "<li><strong>Reference Points:</strong> " . json_encode($ref['reference_points']) . "</li>\n";
                }
                echo "</ul>\n";
                break;
            }
        }
    }
} else {
    echo "<p><strong>Keine Referenzmessungen gefunden</strong></p>\n";
}

// 3. WORKFLOW-DATEN SQL-ABFRAGE
echo "<h3>3. 🔄 Workflow-Daten SQL-Abfrage</h3>\n";

$workflow_data_sql = "
-- Workflow-Daten aus Order-Meta
SELECT meta_value 
FROM {$wpdb->postmeta} 
WHERE post_id = {$order_id} 
AND meta_key = '_yprint_workflow_data'
";

echo "<h4>SQL-Abfrage für Workflow-Daten:</h4>\n";
echo "<pre>" . htmlspecialchars($workflow_data_sql) . "</pre>\n";

$workflow_result = $wpdb->get_var($workflow_data_sql);
if ($workflow_result) {
    $workflow = maybe_unserialize($workflow_result);
    echo "<h4>Ergebnis:</h4>\n";
    echo "<pre>" . print_r($workflow, true) . "</pre>\n";
    
    // Extrahiere finale Koordinaten aus Workflow-Schritten
    if (is_array($workflow) && isset($workflow['workflow_steps'])) {
        foreach ($workflow['workflow_steps'] as $step => $step_data) {
            if (isset($step_data['final_coordinates'])) {
                $coords = $step_data['final_coordinates'];
                echo "<h5>Finale Koordinaten aus {$step}:</h5>\n";
                echo "<ul>\n";
                echo "<li><strong>x_mm:</strong> " . ($coords['x_mm'] ?? 'unknown') . "</li>\n";
                echo "<li><strong>y_mm:</strong> " . ($coords['y_mm'] ?? 'unknown') . "</li>\n";
                echo "<li><strong>width_mm:</strong> " . ($coords['width_mm'] ?? 'unknown') . "</li>\n";
                echo "<li><strong>height_mm:</strong> " . ($coords['height_mm'] ?? 'unknown') . "</li>\n";
                echo "<li><strong>dpi:</strong> " . ($coords['dpi'] ?? 'unknown') . "</li>\n";
                echo "</ul>\n";
                break;
            }
        }
    }
} else {
    echo "<p><strong>Keine Workflow-Daten gefunden</strong></p>\n";
}

// 4. FINALE KOORDINATEN SQL-ABFRAGE
echo "<h3>4. 🎯 Finale Koordinaten SQL-Abfrage</h3>\n";

$final_coordinates_sql = "
-- Finale Koordinaten aus Order-Meta
SELECT meta_value 
FROM {$wpdb->postmeta} 
WHERE post_id = {$order_id} 
AND meta_key = '_yprint_final_coordinates'
";

echo "<h4>SQL-Abfrage für finale Koordinaten:</h4>\n";
echo "<pre>" . htmlspecialchars($final_coordinates_sql) . "</pre>\n";

$final_coords_result = $wpdb->get_var($final_coordinates_sql);
if ($final_coords_result) {
    $final_coords = maybe_unserialize($final_coords_result);
    echo "<h4>Ergebnis:</h4>\n";
    echo "<pre>" . print_r($final_coords, true) . "</pre>\n";
} else {
    echo "<p><strong>Keine finalen Koordinaten gefunden</strong></p>\n";
}

// 5. PRODUKTDIMENSIONEN SQL-ABFRAGE
echo "<h3>5. 📐 Produktdimensionen SQL-Abfrage</h3>\n";

$product_dimensions_sql = "
-- Produktdimensionen aus Template-Meta
SELECT meta_key, meta_value 
FROM {$wpdb->postmeta} 
WHERE post_id = {$template_id} 
AND meta_key IN ('_template_product_dimensions', '_product_dimensions', '_template_measurements_table')
";

echo "<h4>SQL-Abfrage für Produktdimensionen:</h4>\n";
echo "<pre>" . htmlspecialchars($product_dimensions_sql) . "</pre>\n";

$product_dimensions_results = $wpdb->get_results($product_dimensions_sql);
if ($product_dimensions_results) {
    echo "<h4>Ergebnis:</h4>\n";
    foreach ($product_dimensions_results as $row) {
        echo "<h5>{$row->meta_key}:</h5>\n";
        $dimensions = maybe_unserialize($row->meta_value);
        echo "<pre>" . print_r($dimensions, true) . "</pre>\n";
    }
} else {
    echo "<p><strong>Keine Produktdimensionen gefunden</strong></p>\n";
}

// 6. ORDER-ITEMS SQL-ABFRAGE
echo "<h3>6. 🛒 Order-Items SQL-Abfrage</h3>\n";

$order_items_sql = "
-- Order-Items mit YPrint-Daten
SELECT order_item_id, meta_key, meta_value 
FROM {$wpdb->prefix}woocommerce_order_itemmeta 
WHERE order_item_id IN (
    SELECT order_item_id 
    FROM {$wpdb->prefix}woocommerce_order_items 
    WHERE order_id = {$order_id}
) 
AND meta_key IN ('_yprint_template_id', '_yprint_final_coordinates', '_print_design')
";

echo "<h4>SQL-Abfrage für Order-Items:</h4>\n";
echo "<pre>" . htmlspecialchars($order_items_sql) . "</pre>\n";

$order_items_results = $wpdb->get_results($order_items_sql);
if ($order_items_results) {
    echo "<h4>Ergebnis:</h4>\n";
    foreach ($order_items_results as $row) {
        echo "<h5>Item {$row->order_item_id} - {$row->meta_key}:</h5>\n";
        if ($row->meta_key === '_print_design') {
            echo "<p>Design-Daten (serialisiert)</p>\n";
        } else {
            echo "<p>{$row->meta_value}</p>\n";
        }
    }
} else {
    echo "<p><strong>Keine Order-Items gefunden</strong></p>\n";
}

echo "<h2>✅ SQL-Abfragen abgeschlossen</h2>\n";
echo "<p>Diese Abfragen zeigen die exakten SQL-Statements, die die Vorschau verwenden sollte, um die korrekten Daten zu laden.</p>\n";
echo "<p><strong>Wichtig:</strong> Ersetzen Sie die Beispiel-IDs ({$template_id}, {$order_id}) mit echten Werten aus Ihrer Datenbank.</p>\n";
?>
