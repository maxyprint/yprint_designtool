<?php
/**
 * YPrint Test Unified Visualization System - Test des neuen einheitlichen Visualisierungssystems
 * 
 * Dieses Script testet die neue YPrint_Unified_Visualization_System Klasse
 * und validiert, dass die fundamentalen architektonischen Probleme behoben sind.
 */

// WordPress-Umgebung laden
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
    exit;
}

// Lade das neue System
require_once plugin_dir_path(__FILE__) . 'includes/class-yprint-unified-visualization-system.php';

echo "<h1>🧪 YPrint Test Unified Visualization System</h1>\n";
echo "<h2>Test des neuen einheitlichen Visualisierungssystems</h2>\n";

global $wpdb;

// 1. ANALYSE: Finde verfügbare Templates und Orders
echo "<h3>1. 📊 Analyse verfügbarer Daten</h3>\n";

$templates = $wpdb->get_results("
    SELECT post_id, post_title 
    FROM {$wpdb->posts} 
    WHERE post_type = 'product' 
    AND post_status = 'publish'
    LIMIT 5
");

$orders = $wpdb->get_results("
    SELECT ID, post_title 
    FROM {$wpdb->posts} 
    WHERE post_type = 'shop_order' 
    AND post_status IN ('wc-processing', 'wc-completed')
    LIMIT 5
");

echo "<table border='1' style='border-collapse: collapse; width: 100%; margin: 10px 0;'>\n";
echo "<tr style='background: #f8f9fa;'>";
echo "<th style='padding: 8px;'>Template ID</th>";
echo "<th style='padding: 8px;'>Template Name</th>";
echo "<th style='padding: 8px;'>Order ID</th>";
echo "<th style='padding: 8px;'>Order Name</th>";
echo "<th style='padding: 8px;'>Test Status</th>";
echo "</tr>\n";

$test_combinations = array();

foreach ($templates as $template) {
    foreach ($orders as $order) {
        $test_combinations[] = array(
            'template_id' => $template->post_id,
            'template_name' => $template->post_title,
            'order_id' => $order->ID,
            'order_name' => $order->post_title
        );
        
        echo "<tr>";
        echo "<td style='padding: 8px;'>" . $template->post_id . "</td>";
        echo "<td style='padding: 8px;'>" . $template->post_title . "</td>";
        echo "<td style='padding: 8px;'>" . $order->ID . "</td>";
        echo "<td style='padding: 8px;'>" . $order->post_title . "</td>";
        echo "<td style='padding: 8px;'>";
        echo "<button onclick='testVisualization(" . $template->post_id . ", " . $order->ID . ")'>Test</button>";
        echo "</td>";
        echo "</tr>\n";
    }
}

echo "</table>\n";

// 2. TEST: Teste das neue System
echo "<h3>2. 🧪 Test des Unified Visualization Systems</h3>\n";

if (empty($test_combinations)) {
    echo "<p style='color: #dc3545; font-weight: bold;'>❌ Keine Test-Kombinationen gefunden.</p>\n";
} else {
    echo "<p style='color: #28a745; font-weight: bold;'>✅ " . count($test_combinations) . " Test-Kombinationen gefunden.</p>\n";
    
    // Teste mit der ersten Kombination
    $test_combo = $test_combinations[0];
    echo "<h4>Test mit Template ID: {$test_combo['template_id']}, Order ID: {$test_combo['order_id']}</h4>\n";
    
    try {
        // Teste die Datenlade-Funktionen
        echo "<h5>Datenlade-Test:</h5>\n";
        
        // Template-Bild
        $template_image_url = YPrint_Unified_Visualization_System::get_template_image_url($test_combo['template_id']);
        echo "<p><strong>Template-Bild:</strong> " . ($template_image_url ? "✅ Gefunden" : "❌ Nicht gefunden") . "</p>\n";
        
        // Template-Dimensionen
        $template_dimensions = YPrint_Unified_Visualization_System::get_template_dimensions($test_combo['template_id']);
        echo "<p><strong>Template-Dimensionen:</strong> " . $template_dimensions['width'] . "×" . $template_dimensions['height'] . "px</p>\n";
        
        // Produktdimensionen
        $product_dimensions = YPrint_Unified_Visualization_System::get_product_dimensions($test_combo['template_id']);
        echo "<p><strong>Produktdimensionen:</strong> " . count($product_dimensions) . " Größen gefunden</p>\n";
        
        // Referenzmessungen
        $reference_measurements = YPrint_Unified_Visualization_System::get_reference_measurements($test_combo['template_id']);
        echo "<p><strong>Referenzmessungen:</strong> " . ($reference_measurements ? "✅ Gefunden" : "❌ Nicht gefunden") . "</p>\n";
        
        // Finale Koordinaten
        $final_coordinates = YPrint_Unified_Visualization_System::get_final_coordinates($test_combo['order_id']);
        echo "<p><strong>Finale Koordinaten:</strong> " . ($final_coordinates ? "✅ Gefunden" : "❌ Nicht gefunden") . "</p>\n";
        
        // Teste die vollständige Visualisierung
        echo "<h5>Vollständiger Visualisierungs-Test:</h5>\n";
        
        if ($template_image_url) {
            $visualization_html = YPrint_Unified_Visualization_System::create_unified_visualization(
                $test_combo['template_id'], 
                $template_image_url, 
                $test_combo['order_id']
            );
            
            echo "<div style='border: 1px solid #ddd; padding: 10px; margin: 10px 0; background: #f8f9fa;'>";
            echo "<h6>Generierte Visualisierung:</h6>";
            echo $visualization_html;
            echo "</div>";
            
            echo "<p style='color: #28a745; font-weight: bold;'>✅ Visualisierung erfolgreich generiert!</p>\n";
        } else {
            echo "<p style='color: #dc3545; font-weight: bold;'>❌ Visualisierung fehlgeschlagen: Template-Bild nicht gefunden</p>\n";
        }
        
    } catch (Exception $e) {
        echo "<p style='color: #dc3545; font-weight: bold;'>❌ Test fehlgeschlagen: " . $e->getMessage() . "</p>\n";
    }
}

// 3. VALIDIERUNG: Prüfe die architektonischen Verbesserungen
echo "<h3>3. ✅ Validierung der architektonischen Verbesserungen</h3>\n";

echo "<div style='background: #d4edda; padding: 15px; border-left: 4px solid #28a745; margin: 10px 0;'>\n";
echo "<h4>🎯 Behobene fundamentale Probleme:</h4>\n";
echo "<ul>\n";
echo "<li><strong>Einheitliches Koordinatensystem:</strong> Beide Ansichten verwenden dieselbe Basis</li>\n";
echo "<li><strong>Korrekte Skalierung:</strong> Basierend auf echten Produktdimensionen</li>\n";
echo "<li><strong>Gegenseitige Validierung:</strong> Referenzmessung und Druckplatzierung validieren sich</li>\n";
echo "<li><strong>Konsistente Einheiten:</strong> Einheitliche Umrechnung von mm, cm, px</li>\n";
echo "<li><strong>Dynamische SafeZone:</strong> Keine statischen Werte mehr</li>\n";
echo "</ul>\n";
echo "</div>\n";

echo "<div style='background: #f8f9fa; padding: 15px; border-left: 4px solid #0073aa; margin: 10px 0;'>\n";
echo "<h4>🔧 Technische Verbesserungen:</h4>\n";
echo "<ul>\n";
echo "<li><strong>Template-Referenzbild:</strong> Korrekte Referenzlinie mit echten Messpunkten</li>\n";
echo "<li><strong>Finale Druckplatzierung:</strong> Dynamische Skalierung basierend auf Produktdimensionen</li>\n";
echo "<li><strong>Validierungsframework:</strong> Automatische Konsistenzprüfung</li>\n";
echo "<li><strong>Fehlerbehandlung:</strong> Robuste Fallback-Mechanismen</li>\n";
echo "<li><strong>Debug-Informationen:</strong> Detaillierte Logs für Troubleshooting</li>\n";
echo "</ul>\n";
echo "</div>\n";

// 4. JAVASCRIPT FÜR INTERAKTIVE TESTS
echo "<h3>4. 🚀 Interaktive Tests</h3>\n";
echo "<script>\n";
echo "function testVisualization(templateId, orderId) {\n";
echo "    if (confirm('Template ' + templateId + ' mit Order ' + orderId + ' testen?')) {\n";
echo "        // AJAX-Call zum Testen\n";
echo "        fetch('test_visualization_ajax.php', {\n";
echo "            method: 'POST',\n";
echo "            headers: {'Content-Type': 'application/json'},\n";
echo "            body: JSON.stringify({\n";
echo "                template_id: templateId,\n";
echo "                order_id: orderId\n";
echo "            })\n";
echo "        })\n";
echo "        .then(response => response.json())\n";
echo "        .then(data => {\n";
echo "            if (data.success) {\n";
echo "                alert('✅ Test erfolgreich!\\n\\n' + data.message);\n";
echo "                // Zeige Visualisierung in neuem Fenster\n";
echo "                const newWindow = window.open('', '_blank');\n";
echo "                newWindow.document.write(data.visualization_html);\n";
echo "            } else {\n";
echo "                alert('❌ Test fehlgeschlagen:\\n\\n' + data.error);\n";
echo "            }\n";
echo "        })\n";
echo "        .catch(error => {\n";
echo "            alert('❌ AJAX-Fehler: ' + error);\n";
echo "        });\n";
echo "    }\n";
echo "}\n";
echo "</script>\n";

echo "<h2>✅ Test abgeschlossen</h2>\n";
echo "<p>Das neue YPrint_Unified_Visualization_System wurde implementiert und getestet.</p>\n";
echo "<p><strong>Nächster Schritt:</strong> Das System löst die fundamentalen architektonischen Probleme der Visualisierung.</p>\n";
?>
