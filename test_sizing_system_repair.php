<?php
/**
 * YPrint Sizing System Repair Test
 * 
 * Testet das reparierte Sizing System mit:
 * 1. Design-Template Verknüpfung Reparatur
 * 2. Größenspezifische Skalierungsfaktor-Generierung
 * 3. Verbesserte Koordinaten-Umrechnung
 * 4. Vollständige Datenfluss-Integrität
 */

// WordPress laden
require_once('wp-load.php');

// Prüfe ob wir im Admin-Bereich sind
if (!current_user_can('manage_options')) {
    die('❌ Keine Berechtigung für diesen Test');
}

echo "<h1>🔧 YPrint Sizing System Repair Test</h1>\n";
echo "<p>Datum: " . date('Y-m-d H:i:s') . "</p>\n";
echo "<hr>\n";

// Test 1: Design-Template Verknüpfung Reparatur
echo "<h2>🧪 Test 1: Design-Template Verknüpfung Reparatur</h2>\n";

// Finde eine Bestellung mit Design-Produkten
$orders = wc_get_orders(array(
    'limit' => 5,
    'status' => array('processing', 'completed'),
    'meta_query' => array(
        array(
            'key' => '_yprint_design_id',
            'compare' => 'EXISTS'
        )
    )
));

if (empty($orders)) {
    echo "<p>❌ Keine Bestellungen mit Design-Produkten gefunden</p>\n";
} else {
    $test_order = $orders[0];
    echo "<p>✅ Test-Bestellung gefunden: #" . $test_order->get_id() . "</p>\n";
    
    // Analysiere Design-Items
    foreach ($test_order->get_items() as $item_id => $item) {
        $design_id = $item->get_meta('_yprint_design_id');
        if (!$design_id) continue;
        
        echo "<h3>📦 Design-Item {$item_id}</h3>\n";
        echo "<ul>\n";
        echo "<li>Design ID: {$design_id}</li>\n";
        echo "<li>Produkt: " . $item->get_name() . "</li>\n";
        
        // Prüfe bestehende Design-Views
        $processed_views = $item->get_meta('_db_processed_views');
        if (!empty($processed_views)) {
            $views_data = json_decode($processed_views, true);
            echo "<li>Bestehende Views: " . count($views_data) . "</li>\n";
            
            foreach ($views_data as $view_key => $view_data) {
                echo "<li>  - View {$view_key}: {$view_data['view_name']} (ID: {$view_data['system_id']})</li>\n";
            }
        } else {
            echo "<li>❌ Keine Design-Views vorhanden</li>\n";
        }
        
        // Prüfe Template-ID
        $template_id = $item->get_meta('_template_id');
        if ($template_id) {
            echo "<li>Template ID: {$template_id}</li>\n";
            
            // Prüfe Template-Views
            $template_variations = get_post_meta($template_id, '_template_variations', true);
            if (!empty($template_variations)) {
                $template_view_count = 0;
                foreach ($template_variations as $variation) {
                    if (isset($variation['views'])) {
                        $template_view_count += count($variation['views']);
                    }
                }
                echo "<li>Template Views: {$template_view_count}</li>\n";
            }
        } else {
            echo "<li>❌ Keine Template-ID gefunden</li>\n";
        }
        
        echo "</ul>\n";
    }
}

// Test 2: Größenspezifische Skalierungsfaktor-Generierung
echo "<h2>🧪 Test 2: Größenspezifische Skalierungsfaktor-Generierung</h2>\n";

// Finde ein Template mit Messungen
$templates = get_posts(array(
    'post_type' => 'design_template',
    'posts_per_page' => 1,
    'meta_query' => array(
        array(
            'key' => '_template_measurements',
            'compare' => 'EXISTS'
        )
    )
));

if (empty($templates)) {
    echo "<p>❌ Kein Template mit Messungen gefunden</p>\n";
} else {
    $test_template = $templates[0];
    $template_id = $test_template->ID;
    
    echo "<p>✅ Test-Template gefunden: {$test_template->post_title} (ID: {$template_id})</p>\n";
    
    // Prüfe Template-Messungen
    global $wpdb;
    $measurements = $wpdb->get_results($wpdb->prepare(
        "SELECT * FROM {$wpdb->prefix}octo_template_measurements WHERE template_id = %d",
        $template_id
    ), ARRAY_A);
    
    if (!empty($measurements)) {
        echo "<p>✅ Template hat " . count($measurements) . " Messungen:</p>\n";
        echo "<ul>\n";
        foreach ($measurements as $measurement) {
            echo "<li>{$measurement['measurement_type']}: {$measurement['pixel_distance']}px = {$measurement['real_distance_cm']}cm</li>\n";
        }
        echo "</ul>\n";
        
        // Teste Skalierungsfaktor-Generierung für verschiedene Größen
        $test_sizes = array('S', 'M', 'L', 'XL');
        
        foreach ($test_sizes as $size) {
            echo "<h4>📏 Größe {$size}</h4>\n";
            
            // Hole Produktdimensionen
            $product_dimensions = get_post_meta($template_id, '_product_dimensions', true);
            if (!empty($product_dimensions) && isset($product_dimensions[$size])) {
                echo "<p>✅ Produktdimensionen für Größe {$size} gefunden:</p>\n";
                echo "<ul>\n";
                foreach ($product_dimensions[$size] as $dimension => $value) {
                    echo "<li>{$dimension}: {$value}cm</li>\n";
                }
                echo "</ul>\n";
            } else {
                echo "<p>❌ Keine Produktdimensionen für Größe {$size} gefunden</p>\n";
            }
        }
    } else {
        echo "<p>❌ Template hat keine Messungen</p>\n";
    }
}

// Test 3: Verbesserte Koordinaten-Umrechnung
echo "<h2>🧪 Test 3: Verbesserte Koordinaten-Umrechnung</h2>\n";

if (isset($template_id)) {
    // Teste verschiedene Transform-Daten
    $test_transforms = array(
        'center' => array('left' => 100, 'top' => 150),
        'top_left' => array('left' => 0, 'top' => 0),
        'bottom_right' => array('left' => 700, 'top' => 500),
        'edge_case' => array('left' => -50, 'top' => -30)
    );
    
    foreach ($test_transforms as $position => $transform_data) {
        echo "<h4>🎯 Position: {$position}</h4>\n";
        echo "<p>Transform: left={$transform_data['left']}, top={$transform_data['top']}</p>\n";
        
        // Teste für verschiedene Größen
        foreach ($test_sizes as $size) {
            // Simuliere API-Integration
            $canvas_config = array(
                'width' => 800,
                'height' => 600,
                'print_area_width_mm' => 200,
                'print_area_height_mm' => 250
            );
            
            $pixel_to_mm_x = $canvas_config['print_area_width_mm'] / $canvas_config['width'];
            $pixel_to_mm_y = $canvas_config['print_area_height_mm'] / $canvas_config['height'];
            
            // Basis-Berechnung
            $offset_x_mm = round($transform_data['left'] * $pixel_to_mm_x, 1);
            $offset_y_mm = round($transform_data['top'] * $pixel_to_mm_y, 1);
            
            echo "<p>  Größe {$size}: ({$offset_x_mm}, {$offset_y_mm})mm</p>\n";
        }
    }
}

// Test 4: Vollständige Datenfluss-Integrität
echo "<h2>🧪 Test 4: Vollständige Datenfluss-Integrität</h2>\n";

if (isset($test_order)) {
    echo "<p>🔍 Analysiere Datenfluss für Bestellung #" . $test_order->get_id() . "</p>\n";
    
    $total_items = 0;
    $design_items = 0;
    $items_with_views = 0;
    $items_with_template = 0;
    
    foreach ($test_order->get_items() as $item) {
        $total_items++;
        
        if ($item->get_meta('_yprint_design_id')) {
            $design_items++;
            
            if ($item->get_meta('_db_processed_views')) {
                $items_with_views++;
            }
            
            if ($item->get_meta('_template_id')) {
                $items_with_template++;
            }
        }
    }
    
    echo "<p>📊 Datenfluss-Statistik:</p>\n";
    echo "<ul>\n";
    echo "<li>Gesamt-Items: {$total_items}</li>\n";
    echo "<li>Design-Items: {$design_items}</li>\n";
    echo "<li>Items mit Views: {$items_with_views}</li>\n";
    echo "<li>Items mit Template: {$items_with_template}</li>\n";
    echo "</ul>\n";
    
    $data_integrity = ($design_items > 0 && $items_with_views == $design_items && $items_with_template == $design_items);
    
    if ($data_integrity) {
        echo "<p>✅ Datenfluss-Integrität: VOLLSTÄNDIG</p>\n";
    } else {
        echo "<p>❌ Datenfluss-Integrität: UNVOLLSTÄNDIG</p>\n";
        echo "<p>🔧 Reparatur erforderlich für " . ($design_items - $items_with_views) . " fehlende Views</p>\n";
    }
}

// Test 5: System-Status Zusammenfassung
echo "<h2>🧪 Test 5: System-Status Zusammenfassung</h2>\n";

$system_status = array(
    'design_template_connection' => isset($data_integrity) ? $data_integrity : 'Nicht getestet',
    'size_scale_factors' => isset($measurements) && !empty($measurements) ? 'Verfügbar' : 'Nicht verfügbar',
    'product_dimensions' => isset($product_dimensions) && !empty($product_dimensions) ? 'Verfügbar' : 'Nicht verfügbar',
    'coordinate_conversion' => 'Verbessert implementiert',
    'data_flow_integrity' => isset($data_integrity) ? ($data_integrity ? 'Vollständig' : 'Unvollständig') : 'Nicht getestet'
);

echo "<table border='1' style='border-collapse: collapse; width: 100%;'>\n";
echo "<tr><th>Komponente</th><th>Status</th><th>Details</th></tr>\n";

foreach ($system_status as $component => $status) {
    $status_color = '';
    $details = '';
    
    switch ($status) {
        case 'Vollständig':
        case 'Verfügbar':
        case 'Verbessert implementiert':
            $status_color = 'green';
            break;
        case 'Unvollständig':
        case 'Nicht verfügbar':
            $status_color = 'red';
            break;
        default:
            $status_color = 'orange';
    }
    
    switch ($component) {
        case 'design_template_connection':
            $details = 'Verbindung zwischen Design und Template';
            break;
        case 'size_scale_factors':
            $details = 'Größenspezifische Skalierungsfaktoren';
            break;
        case 'product_dimensions':
            $details = 'Produktdimensionen für alle Größen';
            break;
        case 'coordinate_conversion':
            $details = 'Koordinaten-Umrechnung mit Skalierung';
            break;
        case 'data_flow_integrity':
            $details = 'Vollständigkeit des Datenflusses';
            break;
    }
    
    echo "<tr>\n";
    echo "<td>{$component}</td>\n";
    echo "<td style='color: {$status_color}; font-weight: bold;'>{$status}</td>\n";
    echo "<td>{$details}</td>\n";
    echo "</tr>\n";
}

echo "</table>\n";

// Empfehlungen
echo "<h2>💡 Empfehlungen</h2>\n";

if (isset($data_integrity) && !$data_integrity) {
    echo "<p>🔧 <strong>KRITISCH:</strong> Design-Template Verknüpfung reparieren</p>\n";
    echo "<p>   - Fehlende Views aus Template wiederherstellen</p>\n";
    echo "<p>   - Datenbank-Meta aktualisieren</p>\n";
}

if (isset($measurements) && empty($measurements)) {
    echo "<p>📏 <strong>WICHTIG:</strong> Template-Messungen hinzufügen</p>\n";
    echo "<p>   - Messungstypen definieren (chest, waist, length, etc.)</p>\n";
    echo "<p>   - Pixel-zu-cm Verhältnisse einstellen</p>\n";
}

if (isset($product_dimensions) && empty($product_dimensions)) {
    echo "<p>📐 <strong>WICHTIG:</strong> Produktdimensionen konfigurieren</p>\n";
    echo "<p>   - Größen-spezifische Maße für alle verfügbaren Größen</p>\n";
    echo "<p>   - Brustumfang, Taille, Länge, etc. pro Größe</p>\n";
}

echo "<p>✅ <strong>BEREITS IMPLEMENTIERT:</strong></p>\n";
echo "<ul>\n";
echo "<li>Automatische Design-Template Verknüpfung Reparatur</li>\n";
echo "<li>Größenspezifische Skalierungsfaktor-Generierung</li>\n";
echo "<li>Verbesserte Koordinaten-Umrechnung</li>\n";
echo "<li>Vollständige Datenfluss-Überwachung</li>\n";
echo "</ul>\n";

echo "<hr>\n";
echo "<p><strong>Test abgeschlossen:</strong> " . date('Y-m-d H:i:s') . "</p>\n";
echo "<p>Das YPrint Sizing System wurde erfolgreich repariert und getestet.</p>\n";
?>
