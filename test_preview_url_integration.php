<?php
/**
 * Test-Skript für Preview-URL Integration in der API
 * 
 * Dieses Skript testet, ob die Preview-URL korrekt in die API-Payload integriert wird.
 */

// WordPress laden
require_once('wp-load.php');

// Sicherheitscheck
if (!current_user_can('manage_options')) {
    wp_die('Nicht autorisiert');
}

echo "<h1>🧪 Test: Preview-URL Integration in API</h1>\n";

// API Integration Klasse laden
$api_integration = Octo_Print_API_Integration::get_instance();

// Test-Order finden (letzte Bestellung mit Design)
$orders = wc_get_orders(array(
    'limit' => 5,
    'orderby' => 'date',
    'order' => 'DESC',
    'status' => array('processing', 'completed')
));

$test_order = null;
foreach ($orders as $order) {
    foreach ($order->get_items() as $item) {
        if ($item->get_meta('_yprint_design_id') || $item->get_meta('_design_data')) {
            $test_order = $order;
            break 2;
        }
    }
}

if (!$test_order) {
    echo "<p style='color: red;'>❌ Keine Test-Bestellung mit Design gefunden!</p>\n";
    echo "<p>Bitte erstelle eine Bestellung mit einem Design und versuche es erneut.</p>\n";
    exit;
}

echo "<h2>📦 Test-Bestellung gefunden</h2>\n";
echo "<p><strong>Bestellnummer:</strong> #" . $test_order->get_order_number() . "</p>\n";
echo "<p><strong>Datum:</strong> " . $test_order->get_date_created()->format('d.m.Y H:i') . "</p>\n";

// API Payload generieren
echo "<h2>🔧 API Payload generieren</h2>\n";

try {
    $payload = $api_integration->build_api_payload($test_order);
    
    if (is_wp_error($payload)) {
        echo "<p style='color: red;'>❌ Fehler beim Generieren der API Payload:</p>\n";
        echo "<pre>" . $payload->get_error_message() . "</pre>\n";
        exit;
    }
    
    echo "<p style='color: green;'>✅ API Payload erfolgreich generiert!</p>\n";
    
    // Preview-URLs in der Payload suchen
    echo "<h2>🔍 Preview-URLs in der Payload suchen</h2>\n";
    
    $preview_urls_found = 0;
    $total_positions = 0;
    
    if (isset($payload['orderPositions'])) {
        foreach ($payload['orderPositions'] as $position) {
            if (isset($position['printPositions'])) {
                foreach ($position['printPositions'] as $print_position) {
                    $total_positions++;
                    
                    if (isset($print_position['previewUrl']) && !empty($print_position['previewUrl'])) {
                        $preview_urls_found++;
                        echo "<div style='background: #e8f5e8; padding: 10px; margin: 10px 0; border-radius: 5px;'>\n";
                        echo "<p><strong>✅ Preview-URL gefunden:</strong></p>\n";
                        echo "<p><strong>Position:</strong> " . esc_html($print_position['position']) . "</p>\n";
                        echo "<p><strong>Print File:</strong> " . esc_html($print_position['printFile']) . "</p>\n";
                        echo "<p><strong>Preview URL:</strong> <a href='" . esc_url($print_position['previewUrl']) . "' target='_blank'>" . esc_html($print_position['previewUrl']) . "</a></p>\n";
                        echo "</div>\n";
                    } else {
                        echo "<div style='background: #fff3cd; padding: 10px; margin: 10px 0; border-radius: 5px;'>\n";
                        echo "<p><strong>⚠️ Keine Preview-URL für Position:</strong> " . esc_html($print_position['position']) . "</p>\n";
                        echo "<p><strong>Print File:</strong> " . esc_html($print_position['printFile']) . "</p>\n";
                        echo "</div>\n";
                    }
                }
            }
        }
    }
    
    echo "<h2>📊 Zusammenfassung</h2>\n";
    echo "<p><strong>Gesamte Print-Positionen:</strong> " . $total_positions . "</p>\n";
    echo "<p><strong>Preview-URLs gefunden:</strong> " . $preview_urls_found . "</p>\n";
    
    if ($preview_urls_found > 0) {
        echo "<p style='color: green;'>✅ Preview-URL Integration funktioniert!</p>\n";
    } else {
        echo "<p style='color: orange;'>⚠️ Keine Preview-URLs gefunden. Möglicherweise sind keine Preview-URLs in den Order-Meta-Daten gespeichert.</p>\n";
    }
    
    // Vollständige Payload anzeigen (optional)
    echo "<h2>📋 Vollständige API Payload</h2>\n";
    echo "<details>\n";
    echo "<summary>JSON Payload anzeigen</summary>\n";
    echo "<pre style='background: #f8f9fa; padding: 15px; border-radius: 5px; overflow-x: auto;'>" . json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "</pre>\n";
    echo "</details>\n";
    
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ Exception beim Testen:</p>\n";
    echo "<pre>" . $e->getMessage() . "</pre>\n";
}

echo "<h2>🎯 Nächste Schritte</h2>\n";
echo "<p>1. Überprüfe, ob Preview-URLs in den Order-Meta-Daten gespeichert sind</p>\n";
echo "<p>2. Teste die API-Übertragung an den Print Provider</p>\n";
echo "<p>3. Überprüfe, ob der Print Provider die Preview-URLs korrekt erhält</p>\n";
?> 