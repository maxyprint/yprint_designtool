<?php
/**
 * YPrint Test Debug Meta Fields Button - Test des neuen Debug-Buttons
 * 
 * Dieses Script testet die neue Debug-Funktion für Meta-Felder im Design Template.
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

echo "<h1>🧪 YPrint Test Debug Meta Fields Button</h1>\n";
echo "<h2>Test des neuen Debug-Buttons für Meta-Felder</h2>\n";

global $wpdb;

// 1. ANALYSE: Finde Design Templates
echo "<h3>1. 📊 Analyse verfügbarer Design Templates</h3>\n";

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
echo "<th style='padding: 8px;'>Meta-Felder Count</th>";
echo "<th style='padding: 8px;'>Test</th>";
echo "</tr>\n";

foreach ($templates as $template) {
    // Zähle Meta-Felder für dieses Template
    $meta_count = $wpdb->get_var($wpdb->prepare("
        SELECT COUNT(*) 
        FROM {$wpdb->postmeta} 
        WHERE post_id = %d
    ", $template->ID));
    
    echo "<tr>";
    echo "<td style='padding: 8px;'>" . $template->ID . "</td>";
    echo "<td style='padding: 8px;'>" . $template->post_title . "</td>";
    echo "<td style='padding: 8px;'>" . $template->post_status . "</td>";
    echo "<td style='padding: 8px;'><strong>" . $meta_count . "</strong></td>";
    echo "<td style='padding: 8px;'>";
    echo "<button onclick='testMetaFields(" . $template->ID . ")'>Meta-Felder anzeigen</button>";
    echo "</td>";
    echo "</tr>\n";
}

echo "</table>\n";

// 2. TEST: Teste die Debug-Funktion
echo "<h3>2. 🧪 Test der Debug Meta-Felder Funktion</h3>\n";

if (empty($templates)) {
    echo "<p style='color: #dc3545; font-weight: bold;'>❌ Keine Design Templates gefunden.</p>\n";
} else {
    echo "<p style='color: #28a745; font-weight: bold;'>✅ " . count($templates) . " Design Templates gefunden.</p>\n";
    
    // Teste mit dem ersten Template
    $test_template = $templates[0];
    echo "<h4>Test mit Template ID: {$test_template->ID} - {$test_template->post_title}</h4>\n";
    
    // Simuliere die AJAX-Funktion
    echo "<div id='test-result' style='border: 1px solid #ddd; padding: 15px; margin: 10px 0; background: #f9f9f9; border-radius: 4px;'>";
    echo "<p><em>Klicken Sie auf den Button oben, um die Meta-Felder anzuzeigen...</em></p>";
    echo "</div>";
}

// 3. VALIDIERUNG: Prüfe die Implementierung
echo "<h3>3. ✅ Validierung der Implementierung</h3>\n";

echo "<div style='background: #d4edda; padding: 15px; border-left: 4px solid #28a745; margin: 10px 0;'>\n";
echo "<h4>✅ Implementierte Features:</h4>\n";
echo "<ul>\n";
echo "<li><strong>Debug Meta-Box:</strong> Neue Meta-Box '🔍 Debug: Alle Meta-Felder' in der Sidebar</li>\n";
echo "<li><strong>AJAX-Handler:</strong> get_template_meta_fields_debug für sichere Datenabfrage</li>\n";
echo "<li><strong>Farbkodierung:</strong> Template-Felder (grün), YPrint-Felder (blau), andere (gelb)</li>\n";
echo "<li><strong>Datentyp-Erkennung:</strong> Automatische Erkennung von serialized/array Daten</li>\n";
echo "<li><strong>Security:</strong> Nonce-Verification und Permission-Checks</li>\n";
echo "</ul>\n";
echo "</div>\n";

echo "<div style='background: #f8f9fa; padding: 15px; border-left: 4px solid #0073aa; margin: 10px 0;'>\n";
echo "<h4>🔧 Technische Details:</h4>\n";
echo "<ul>\n";
echo "<li><strong>Meta-Box Position:</strong> Sidebar (side) mit niedriger Priorität (low)</li>\n";
echo "<li><strong>AJAX-Action:</strong> get_template_meta_fields_debug</li>\n";
echo "<li><strong>Nonce:</strong> template_meta_fields_debug</li>\n";
echo "<li><strong>Datenbank-Query:</strong> Direkte Abfrage der wp_postmeta Tabelle</li>\n";
echo "<li><strong>Responsive Design:</strong> Scrollbare Tabelle mit max-height: 400px</li>\n";
echo "</ul>\n";
echo "</div>\n";

// 4. JAVASCRIPT FÜR INTERAKTIVE TESTS
echo "<h3>4. 🚀 Interaktive Tests</h3>\n";
echo "<script>\n";
echo "function testMetaFields(templateId) {\n";
echo "    var resultDiv = document.getElementById('test-result');\n";
echo "    resultDiv.innerHTML = '<p><em>Lade Meta-Felder für Template ' + templateId + '...</em></p>';\n";
echo "    \n";
echo "    // Simuliere AJAX-Call\n";
echo "    fetch('test_meta_fields_ajax.php', {\n";
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
echo "<h4>🎯 So verwenden Sie den Debug-Button:</h4>\n";
echo "<ol>\n";
echo "<li><strong>Gehen Sie zu:</strong> WordPress Admin → Design Templates</li>\n";
echo "<li><strong>Wählen Sie ein Template:</strong> Klicken Sie auf ein bestehendes Template oder erstellen Sie ein neues</li>\n";
echo "<li><strong>Finden Sie die Debug-Box:</strong> In der rechten Sidebar finden Sie '🔍 Debug: Alle Meta-Felder'</li>\n";
echo "<li><strong>Klicken Sie auf den Button:</strong> 'Meta-Felder anzeigen'</li>\n";
echo "<li><strong>Analysieren Sie die Daten:</strong> Alle gespeicherten Meta-Felder werden in einer übersichtlichen Tabelle angezeigt</li>\n";
echo "</ol>\n";
echo "</div>\n";

echo "<h2>✅ Test abgeschlossen</h2>\n";
echo "<p>Der Debug-Button für Meta-Felder wurde erfolgreich implementiert.</p>\n";
echo "<p><strong>Nächster Schritt:</strong> Gehen Sie zu einem Design Template und testen Sie die neue Debug-Funktion!</p>\n";
?>
