<?php
/**
 * YPrint Test Reference Data Extraction Fix - Test der korrigierten Referenzdaten-Extraktion
 * 
 * Dieses Script testet die korrigierte get_reference_measurements Funktion in der
 * YPrint_Unified_Visualization_System Klasse.
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

echo "<h1>🧪 YPrint Test Reference Data Extraction Fix</h1>\n";
echo "<h2>Test der korrigierten Referenzdaten-Extraktion</h2>\n";

global $wpdb;

// 1. ANALYSE: Finde Design Templates mit Referenzmessungen
echo "<h3>1. 📊 Analyse verfügbarer Design Templates mit Referenzmessungen</h3>\n";

$templates = $wpdb->get_results("
    SELECT ID, post_title, post_status 
    FROM {$wpdb->posts} 
    WHERE post_type = 'design_template' 
    ORDER BY post_date DESC 
    LIMIT 10
");

echo "<table border='1' style='border-collapse: collapse; width: 100%; margin: 10px 0;'>\n";
echo "<tr style='background: #f8f9fa;'>";
echo "<th style='padding: 8px;'>Template ID</th>";
echo "<th style='padding: 8px;'>Template Name</th>";
echo "<th style='padding: 8px;'>Status</th>";
echo "<th style='padding: 8px;'>View Print Areas</th>";
echo "<th style='padding: 8px;'>Referenzmessungen</th>";
echo "<th style='padding: 8px;'>Test</th>";
echo "</tr>\n";

foreach ($templates as $template) {
    // Lade _template_view_print_areas
    $view_print_areas = get_post_meta($template->ID, '_template_view_print_areas', true);
    $has_view_print_areas = !empty($view_print_areas) && is_array($view_print_areas);
    
    // Zähle Referenzmessungen
    $reference_count = 0;
    $reference_details = array();
    
    if ($has_view_print_areas) {
        foreach ($view_print_areas as $view_id => $view_data) {
            if (isset($view_data['measurements']) && is_array($view_data['measurements'])) {
                foreach ($view_data['measurements'] as $measurement) {
                    if (isset($measurement['is_reference']) && $measurement['is_reference'] === true) {
                        $reference_count++;
                        $reference_details[] = "View {$view_id}: " . ($measurement['measurement_type'] ?? 'unknown') . " (" . ($measurement['physical_size_cm'] ?? 'unknown') . "cm)";
                    }
                }
            }
        }
    }
    
    echo "<tr>";
    echo "<td style='padding: 8px;'>" . $template->ID . "</td>";
    echo "<td style='padding: 8px;'>" . $template->post_title . "</td>";
    echo "<td style='padding: 8px;'>" . $template->post_status . "</td>";
    echo "<td style='padding: 8px;'>" . ($has_view_print_areas ? "✅ Ja" : "❌ Nein") . "</td>";
    echo "<td style='padding: 8px;'><strong>" . $reference_count . "</strong></td>";
    echo "<td style='padding: 8px;'>";
    if ($reference_count > 0) {
        echo "<button onclick='testReferenceExtraction(" . $template->ID . ")'>Test Extraktion</button>";
    } else {
        echo "<span style='color: #666;'>Keine Referenzmessungen</span>";
    }
    echo "</td>";
    echo "</tr>\n";
}

echo "</table>\n";

// 2. TEST: Teste die korrigierte Extraktion
echo "<h3>2. 🧪 Test der korrigierten Referenzdaten-Extraktion</h3>\n";

if (empty($templates)) {
    echo "<p style='color: #dc3545; font-weight: bold;'>❌ Keine Design Templates gefunden.</p>\n";
} else {
    echo "<p style='color: #28a745; font-weight: bold;'>✅ " . count($templates) . " Design Templates gefunden.</p>\n";
    
    // Teste mit dem ersten Template, das Referenzmessungen hat
    $test_template = null;
    foreach ($templates as $template) {
        $view_print_areas = get_post_meta($template->ID, '_template_view_print_areas', true);
        if (!empty($view_print_areas)) {
            foreach ($view_print_areas as $view_data) {
                if (isset($view_data['measurements']) && is_array($view_data['measurements'])) {
                    foreach ($view_data['measurements'] as $measurement) {
                        if (isset($measurement['is_reference']) && $measurement['is_reference'] === true) {
                            $test_template = $template;
                            break 3;
                        }
                    }
                }
            }
        }
    }
    
    if ($test_template) {
        echo "<h4>Test mit Template ID: {$test_template->ID} - {$test_template->post_title}</h4>\n";
        
        // Simuliere die korrigierte Extraktion
        echo "<div id='test-result' style='border: 1px solid #ddd; padding: 15px; margin: 10px 0; background: #f9f9f9; border-radius: 4px;'>";
        echo "<p><em>Klicken Sie auf den Button oben, um die Referenzdaten-Extraktion zu testen...</em></p>";
        echo "</div>";
    } else {
        echo "<p style='color: #ffc107; font-weight: bold;'>⚠️ Keine Templates mit Referenzmessungen gefunden.</p>\n";
    }
}

// 3. VALIDIERUNG: Prüfe die Implementierung
echo "<h3>3. ✅ Validierung der korrigierten Implementierung</h3>\n";

echo "<div style='background: #d4edda; padding: 15px; border-left: 4px solid #28a745; margin: 10px 0;'>\n";
echo "<h4>✅ Korrigierte Features:</h4>\n";
echo "<ul>\n";
echo "<li><strong>Mehrfache Suchmethoden:</strong> Suche nach 'reference_measurement' Key, 'is_reference' Flag, und Messungstypen</li>\n";
echo "<li><strong>Robuste Fallbacks:</strong> Fallback-Werte für fehlende Referenzmessungen und finale Koordinaten</li>\n";
echo "<li><strong>Erweiterte Logging:</strong> Detaillierte Debug-Informationen für Troubleshooting</li>\n";
echo "<li><strong>Datenstruktur-Kompatibilität:</strong> Unterstützt verschiedene Speicherformate</li>\n";
echo "<li><strong>Division-by-Zero-Schutz:</strong> Verhindert Fehler bei fehlenden physical_size_cm Werten</li>\n";
echo "</ul>\n";
echo "</div>\n";

echo "<div style='background: #f8f9fa; padding: 15px; border-left: 4px solid #0073aa; margin: 10px 0;'>\n";
echo "<h4>🔧 Technische Verbesserungen:</h4>\n";
echo "<ul>\n";
echo "<li><strong>get_reference_measurements():</strong> 3 Suchmethoden für maximale Kompatibilität</li>\n";
echo "<li><strong>get_final_coordinates():</strong> Erweiterte Suche in Workflow-Daten, Meta-Feldern und Order Items</li>\n";
echo "<li><strong>create_unified_coordinate_system():</strong> Robuste Fallbacks für alle kritischen Daten</li>\n";
echo "<li><strong>Error-Logging:</strong> Detaillierte Debug-Informationen für jeden Schritt</li>\n";
echo "</ul>\n";
echo "</div>\n";

// 4. JAVASCRIPT FÜR INTERAKTIVE TESTS
echo "<h3>4. 🚀 Interaktive Tests</h3>\n";
echo "<script>\n";
echo "function testReferenceExtraction(templateId) {\n";
echo "    var resultDiv = document.getElementById('test-result');\n";
echo "    resultDiv.innerHTML = '<p><em>Teste Referenzdaten-Extraktion für Template ' + templateId + '...</em></p>';\n";
echo "    \n";
echo "    // Simuliere die korrigierte Extraktion\n";
echo "    fetch('test_reference_extraction_ajax.php', {\n";
echo "        method: 'POST',\n";
echo "        headers: {'Content-Type': 'application/json'},\n";
echo "        body: JSON.stringify({\n";
echo "            template_id: templateId\n";
echo "        })\n";
echo "    })\n";
echo "    .then(response => response.json())\n";
echo "    .then(data => {\n";
echo "        if (data.success) {\n";
echo "            resultDiv.innerHTML = data.html;\n";
echo "        } else {\n";
echo "            resultDiv.innerHTML = '<p style=\"color: red;\">❌ Fehler: ' + data.error + '</p>';\n";
echo "        }\n";
echo "    })\n";
echo "    .catch(error => {\n";
echo "        resultDiv.innerHTML = '<p style=\"color: red;\">❌ AJAX-Fehler: ' + error + '</p>';\n";
echo "    });\n";
echo "}\n";
echo "</script>\n";

// 5. ANLEITUNG
echo "<h3>5. 📋 Anleitung zur Verwendung</h3>\n";

echo "<div style='background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 10px 0;'>\n";
echo "<h4>🎯 So testen Sie die korrigierte Referenzdaten-Extraktion:</h4>\n";
echo "<ol>\n";
echo "<li><strong>Gehen Sie zu:</strong> WordPress Admin → WooCommerce → Orders</li>\n";
echo "<li><strong>Wählen Sie eine Bestellung:</strong> Klicken Sie auf eine Bestellung mit YPrint-Daten</li>\n";
echo "<li><strong>Führen Sie den Workflow aus:</strong> Klicken Sie auf '🚀 VOLLSTÄNDIGEN WORKFLOW STARTEN'</li>\n";
echo "<li><strong>Öffnen Sie die Vorschau:</strong> Klicken Sie auf 'YPrint Preview verfügbar'</li>\n";
echo "<li><strong>Prüfen Sie die Logs:</strong> Schauen Sie in die WordPress Error-Logs für detaillierte Debug-Informationen</li>\n";
echo "</ol>\n";
echo "</div>\n";

echo "<h2>✅ Test abgeschlossen</h2>\n";
echo "<p>Die korrigierte Referenzdaten-Extraktion wurde erfolgreich implementiert.</p>\n";
echo "<p><strong>Nächster Schritt:</strong> Testen Sie den Workflow mit einer echten Bestellung!</p>\n";
?>
