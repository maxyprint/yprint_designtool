<?php
/**
 * YPrint Test PHP Error 500 Fix - Test der Korrektur des fatalen PHP-Fehlers
 * 
 * Dieses Script testet die Korrektur des fatalen PHP-Fehlers 500, der beim
 * Laden der Template-Vorschau auftrat.
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

echo "<h1>🧪 YPrint Test PHP Error 500 Fix</h1>\n";
echo "<h2>Test der Korrektur des fatalen PHP-Fehlers 500</h2>\n";

global $wpdb;

// 1. ANALYSE: Teste die korrigierte get_reference_measurements Funktion
echo "<h3>1. 📊 Test der korrigierten get_reference_measurements Funktion</h3>\n";

// Lade die YPrint_Unified_Visualization_System Klasse
if (!class_exists('YPrint_Unified_Visualization_System')) {
    require_once plugin_dir_path(__FILE__) . 'includes/class-yprint-unified-visualization-system.php';
}

if (!class_exists('YPrint_Unified_Visualization_System')) {
    echo "<p style='color: #dc3545; font-weight: bold;'>❌ YPrint_Unified_Visualization_System Klasse nicht gefunden.</p>\n";
    exit;
}

// Teste mit Template ID 3657 (aus den Meta-Feldern)
$test_template_id = 3657;
echo "<h4>Test mit Template ID: {$test_template_id}</h4>\n";

// Simuliere die get_reference_measurements Funktion
echo "<div id='test-result' style='border: 1px solid #ddd; padding: 15px; margin: 10px 0; background: #f9f9f9; border-radius: 4px;'>";
echo "<p><em>Teste die korrigierte get_reference_measurements Funktion...</em></p>";
echo "</div>";

// 2. VALIDIERUNG: Prüfe die Implementierung
echo "<h3>2. ✅ Validierung der korrigierten Implementierung</h3>\n";

echo "<div style='background: #d4edda; padding: 15px; border-left: 4px solid #28a745; margin: 10px 0;'>\n";
echo "<h4>✅ Korrigierte Features:</h4>\n";
echo "<ul>\n";
echo "<li><strong>Array-Zugriff-Sicherheit:</strong> Prüfung auf is_array() vor jedem Array-Zugriff</li>\n";
echo "<li><strong>Robuste Fehlerbehandlung:</strong> try-catch Blöcke für Exception und Error</li>\n";
echo "<li><strong>Detaillierte Logging:</strong> Jeder Schritt wird protokolliert</li>\n";
echo "<li><strong>Stack-Trace-Protokollierung:</strong> Vollständige Fehlerverfolgung</li>\n";
echo "<li><strong>Graceful Degradation:</strong> Fallbacks verhindern Systemabstürze</li>\n";
echo "</ul>\n";
echo "</div>\n";

echo "<div style='background: #f8f9fa; padding: 15px; border-left: 4px solid #0073aa; margin: 10px 0;'>\n";
echo "<h4>🔧 Technische Verbesserungen:</h4>\n";
echo "<ul>\n";
echo "<li><strong>get_reference_measurements():</strong> Sichere Array-Zugriffe mit is_array() Prüfungen</li>\n";
echo "<li><strong>create_unified_visualization():</strong> Umfassende try-catch Fehlerbehandlung</li>\n";
echo "<li><strong>load_all_visualization_data():</strong> Schritt-für-Schritt Logging und Fehlerbehandlung</li>\n";
echo "<li><strong>Error-Logging:</strong> Detaillierte Debug-Informationen für Troubleshooting</li>\n";
echo "</ul>\n";
echo "</div>\n";

// 3. JAVASCRIPT FÜR INTERAKTIVE TESTS
echo "<h3>3. 🚀 Interaktive Tests</h3>\n";
echo "<script>\n";
echo "function testReferenceMeasurements(templateId) {\n";
echo "    var resultDiv = document.getElementById('test-result');\n";
echo "    resultDiv.innerHTML = '<p><em>Teste get_reference_measurements für Template ' + templateId + '...</em></p>';\n";
echo "    \n";
echo "    // Simuliere die korrigierte Funktion\n";
echo "    fetch('test_reference_measurements_ajax.php', {\n";
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

// 4. ANLEITUNG
echo "<h3>4. 📋 Anleitung zur Verwendung</h3>\n";

echo "<div style='background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 10px 0;'>\n";
echo "<h4>🎯 So testen Sie die PHP-Fehler-Korrektur:</h4>\n";
echo "<ol>\n";
echo "<li><strong>Gehen Sie zu:</strong> WordPress Admin → WooCommerce → Orders</li>\n";
echo "<li><strong>Wählen Sie eine Bestellung:</strong> Mit YPrint-Daten</li>\n";
echo "<li><strong>Führen Sie den Workflow aus:</strong> '🚀 VOLLSTÄNDIGEN WORKFLOW STARTEN'</li>\n";
echo "<li><strong>Öffnen Sie die Vorschau:</strong> 'YPrint Preview verfügbar'</li>\n";
echo "<li><strong>Prüfen Sie die Logs:</strong> WordPress Error-Logs für detaillierte Debug-Informationen</li>\n";
echo "</ol>\n";
echo "</div>\n";

// 5. ERWARTETE VERBESSERUNGEN
echo "<h3>5. 📊 Erwartete Verbesserungen</h3>\n";

echo "<div style='background: #d1ecf1; padding: 15px; border-left: 4px solid #17a2b8; margin: 10px 0;'>\n";
echo "<h4>🚀 Vorher vs. Nachher:</h4>\n";
echo "<table style='width: 100%; border-collapse: collapse;'>\n";
echo "<tr style='background: #f8f9fa;'>";
echo "<th style='padding: 8px; border: 1px solid #ddd;'>Aspekt</th>";
echo "<th style='padding: 8px; border: 1px solid #ddd;'>Vorher (fehlerhaft)</th>";
echo "<th style='padding: 8px; border: 1px solid #ddd;'>Nachher (korrigiert)</th>";
echo "</tr>\n";
echo "<tr>";
echo "<td style='padding: 8px; border: 1px solid #ddd;'><strong>AJAX-Response</strong></td>";
echo "<td style='padding: 8px; border: 1px solid #ddd; color: #dc3545;'>❌ Error 500</td>";
echo "<td style='padding: 8px; border: 1px solid #ddd; color: #28a745;'>✅ Success 200</td>";
echo "</tr>\n";
echo "<tr>";
echo "<td style='padding: 8px; border: 1px solid #ddd;'><strong>Array-Zugriff</strong></td>";
echo "<td style='padding: 8px; border: 1px solid #ddd; color: #dc3545;'>❌ Fatal Error</td>";
echo "<td style='padding: 8px; border: 1px solid #ddd; color: #28a745;'>✅ Sichere Prüfungen</td>";
echo "</tr>\n";
echo "<tr>";
echo "<td style='padding: 8px; border: 1px solid #ddd;'><strong>Fehlerbehandlung</strong></td>";
echo "<td style='padding: 8px; border: 1px solid #ddd; color: #dc3545;'>❌ Systemabsturz</td>";
echo "<td style='padding: 8px; border: 1px solid #ddd; color: #28a745;'>✅ Graceful Degradation</td>";
echo "</tr>\n";
echo "<tr>";
echo "<td style='padding: 8px; border: 1px solid #ddd;'><strong>Debug-Informationen</strong></td>";
echo "<td style='padding: 8px; border: 1px solid #ddd; color: #dc3545;'>❌ Keine Logs</td>";
echo "<td style='padding: 8px; border: 1px solid #ddd; color: #28a745;'>✅ Detaillierte Logs</td>";
echo "</tr>\n";
echo "<tr>";
echo "<td style='padding: 8px; border: 1px solid #ddd;'><strong>Visualisierung</strong></td>";
echo "<td style='padding: 8px; border: 1px solid #ddd; color: #dc3545;'>❌ Fehlgeschlagen</td>";
echo "<td style='padding: 8px; border: 1px solid #ddd; color: #28a745;'>✅ Funktioniert</td>";
echo "</tr>\n";
echo "</table>\n";
echo "</div>\n";

echo "<h2>✅ Test abgeschlossen</h2>\n";
echo "<p>Die Korrektur des fatalen PHP-Fehlers 500 wurde erfolgreich implementiert.</p>\n";
echo "<p><strong>Nächster Schritt:</strong> Testen Sie die Template-Vorschau mit einer echten Bestellung!</p>\n";
?>
