<?php
/**
 * YPrint Database Data Analysis - SQL-Gegenprüfung der Vorschau-Daten
 * 
 * Dieses Script analysiert die tatsächlichen Daten in der WordPress-Datenbank
 * und zeigt, wo die Vorschau-Daten gespeichert sind und wie sie abgerufen werden.
 */

// WordPress-Umgebung laden
// Versuche verschiedene WordPress-Pfade
$wp_paths = [
    '../../../wp-config.php',
    '../../wp-config.php', 
    '../wp-config.php',
    'wp-config.php'
];

$wp_loaded = false;
foreach ($wp_paths as $path) {
    if (file_exists($path)) {
        require_once($path);
        $wp_loaded = true;
        break;
    }
}

if (!$wp_loaded) {
    echo "<h1>❌ WordPress nicht gefunden</h1>\n";
    echo "<p>WordPress wp-config.php konnte nicht gefunden werden.</p>\n";
    echo "<p>Bitte stellen Sie sicher, dass das Script im WordPress-Plugin-Verzeichnis ausgeführt wird.</p>\n";
    exit;
}

echo "<h1>🔍 YPrint Database Data Analysis</h1>\n";
echo "<h2>SQL-Gegenprüfung der Vorschau-Daten</h2>\n";

global $wpdb;

// 1. TEMPLATE-BILDER ANALYSE
echo "<h3>1. 📸 Template-Bilder Analyse</h3>\n";

// Suche nach Template-Variations
$template_variations = $wpdb->get_results("
    SELECT post_id, meta_key, meta_value 
    FROM {$wpdb->postmeta} 
    WHERE meta_key = '_template_variations' 
    ORDER BY post_id DESC 
    LIMIT 5
");

echo "<h4>Template Variations (_template_variations):</h4>\n";
foreach ($template_variations as $row) {
    echo "<strong>Template ID {$row->post_id}:</strong><br>\n";
    $variations = maybe_unserialize($row->meta_value);
    if (is_array($variations)) {
        foreach ($variations as $var_id => $variation) {
            if (isset($variation['views'])) {
                foreach ($variation['views'] as $view_id => $view) {
                    echo "  - Variation {$var_id}, View {$view_id}: ";
                    if (isset($view['image'])) {
                        echo "image = {$view['image']}";
                    } elseif (isset($view['attachment_id'])) {
                        echo "attachment_id = {$view['attachment_id']}";
                    } else {
                        echo "KEIN BILD GEFUNDEN";
                    }
                    echo "<br>\n";
                }
            }
        }
    }
    echo "<br>\n";
}

// 2. REFERENZMESSUNGEN ANALYSE
echo "<h3>2. 📏 Referenzmessungen Analyse</h3>\n";

$reference_measurements = $wpdb->get_results("
    SELECT post_id, meta_key, meta_value 
    FROM {$wpdb->postmeta} 
    WHERE meta_key = '_template_view_print_areas' 
    ORDER BY post_id DESC 
    LIMIT 3
");

echo "<h4>Template View Print Areas (_template_view_print_areas):</h4>\n";
foreach ($reference_measurements as $row) {
    echo "<strong>Template ID {$row->post_id}:</strong><br>\n";
    $print_areas = maybe_unserialize($row->meta_value);
    if (is_array($print_areas)) {
        foreach ($print_areas as $view_id => $view_data) {
            echo "  - View {$view_id}:<br>\n";
            if (isset($view_data['measurements']['reference_measurement'])) {
                $ref = $view_data['measurements']['reference_measurement'];
                echo "    * Type: " . ($ref['measurement_type'] ?? 'unknown') . "<br>\n";
                echo "    * Physical Size: " . ($ref['physical_size_cm'] ?? 'unknown') . " cm<br>\n";
                echo "    * Pixel Distance: " . ($ref['pixel_distance'] ?? 'unknown') . " px<br>\n";
                if (isset($ref['reference_points'])) {
                    echo "    * Reference Points: " . json_encode($ref['reference_points']) . "<br>\n";
                }
            } else {
                echo "    * KEINE REFERENZMESSUNG GEFUNDEN<br>\n";
            }
        }
    }
    echo "<br>\n";
}

// 3. WORKFLOW-DATEN ANALYSE
echo "<h3>3. 🔄 Workflow-Daten Analyse</h3>\n";

$workflow_data = $wpdb->get_results("
    SELECT post_id, meta_key, meta_value 
    FROM {$wpdb->postmeta} 
    WHERE meta_key = '_yprint_workflow_data' 
    ORDER BY post_id DESC 
    LIMIT 3
");

echo "<h4>YPrint Workflow Data (_yprint_workflow_data):</h4>\n";
foreach ($workflow_data as $row) {
    echo "<strong>Order ID {$row->post_id}:</strong><br>\n";
    $workflow = maybe_unserialize($row->meta_value);
    if (is_array($workflow) && isset($workflow['workflow_steps'])) {
        foreach ($workflow['workflow_steps'] as $step => $step_data) {
            echo "  - {$step}: ";
            if (isset($step_data['final_coordinates'])) {
                $coords = $step_data['final_coordinates'];
                echo "final_coordinates gefunden - ";
                echo "x: " . ($coords['x_mm'] ?? 'unknown') . "mm, ";
                echo "y: " . ($coords['y_mm'] ?? 'unknown') . "mm, ";
                echo "w: " . ($coords['width_mm'] ?? 'unknown') . "mm, ";
                echo "h: " . ($coords['height_mm'] ?? 'unknown') . "mm";
            } else {
                echo "KEINE final_coordinates";
            }
            echo "<br>\n";
        }
    } else {
        echo "  - KEINE WORKFLOW_STEPS GEFUNDEN<br>\n";
    }
    echo "<br>\n";
}

// 4. FINALE KOORDINATEN ANALYSE
echo "<h3>4. 🎯 Finale Koordinaten Analyse</h3>\n";

$final_coordinates = $wpdb->get_results("
    SELECT post_id, meta_key, meta_value 
    FROM {$wpdb->postmeta} 
    WHERE meta_key = '_yprint_final_coordinates' 
    ORDER BY post_id DESC 
    LIMIT 5
");

echo "<h4>YPrint Final Coordinates (_yprint_final_coordinates):</h4>\n";
foreach ($final_coordinates as $row) {
    echo "<strong>Order ID {$row->post_id}:</strong><br>\n";
    $coords = maybe_unserialize($row->meta_value);
    if (is_array($coords)) {
        echo "  - x_mm: " . ($coords['x_mm'] ?? 'unknown') . "<br>\n";
        echo "  - y_mm: " . ($coords['y_mm'] ?? 'unknown') . "<br>\n";
        echo "  - width_mm: " . ($coords['width_mm'] ?? 'unknown') . "<br>\n";
        echo "  - height_mm: " . ($coords['height_mm'] ?? 'unknown') . "<br>\n";
        echo "  - dpi: " . ($coords['dpi'] ?? 'unknown') . "<br>\n";
    } else {
        echo "  - KEINE KOORDINATEN GEFUNDEN<br>\n";
    }
    echo "<br>\n";
}

// 5. PRODUKTDIMENSIONEN ANALYSE
echo "<h3>5. 📐 Produktdimensionen Analyse</h3>\n";

$product_dimensions = $wpdb->get_results("
    SELECT post_id, meta_key, meta_value 
    FROM {$wpdb->postmeta} 
    WHERE meta_key IN ('_template_product_dimensions', '_product_dimensions', '_template_measurements_table') 
    ORDER BY post_id DESC 
    LIMIT 5
");

echo "<h4>Produktdimensionen Meta-Felder:</h4>\n";
foreach ($product_dimensions as $row) {
    echo "<strong>Template ID {$row->post_id} - {$row->meta_key}:</strong><br>\n";
    $dimensions = maybe_unserialize($row->meta_value);
    if (is_array($dimensions)) {
        foreach ($dimensions as $size => $size_data) {
            echo "  - Size {$size}: " . json_encode($size_data) . "<br>\n";
        }
    } else {
        echo "  - KEINE DIMENSIONEN GEFUNDEN<br>\n";
    }
    echo "<br>\n";
}

// 6. ORDER-ITEMS ANALYSE
echo "<h3>6. 🛒 Order-Items Analyse</h3>\n";

$order_items = $wpdb->get_results("
    SELECT order_item_id, order_id, meta_key, meta_value 
    FROM {$wpdb->prefix}woocommerce_order_itemmeta 
    WHERE meta_key IN ('_yprint_template_id', '_yprint_final_coordinates', '_print_design') 
    ORDER BY order_id DESC, order_item_id DESC 
    LIMIT 10
");

echo "<h4>WooCommerce Order Item Meta:</h4>\n";
foreach ($order_items as $row) {
    echo "<strong>Order {$row->order_id}, Item {$row->order_item_id} - {$row->meta_key}:</strong><br>\n";
    if ($row->meta_key === '_print_design') {
        echo "  - Design-Daten (serialisiert)<br>\n";
    } else {
        echo "  - " . $row->meta_value . "<br>\n";
    }
    echo "<br>\n";
}

// 7. ATTACHMENT-BILDER ANALYSE
echo "<h3>7. 🖼️ Attachment-Bilder Analyse</h3>\n";

$attachments = $wpdb->get_results("
    SELECT ID, post_title, post_mime_type, guid 
    FROM {$wpdb->posts} 
    WHERE post_type = 'attachment' 
    AND (post_title LIKE '%template%' OR post_title LIKE '%kaan%' OR post_title LIKE '%shirt%') 
    ORDER BY post_date DESC 
    LIMIT 10
");

echo "<h4>Template-Bilder in wp_posts:</h4>\n";
foreach ($attachments as $row) {
    echo "<strong>Attachment ID {$row->ID}:</strong><br>\n";
    echo "  - Title: {$row->post_title}<br>\n";
    echo "  - MIME: {$row->post_mime_type}<br>\n";
    echo "  - URL: {$row->guid}<br>\n";
    echo "<br>\n";
}

echo "<h2>✅ Analyse abgeschlossen</h2>\n";
echo "<p>Diese Analyse zeigt die tatsächlichen Daten in der WordPress-Datenbank und hilft dabei, die korrekten Meta-Felder für die Vorschau zu identifizieren.</p>\n";
?>
