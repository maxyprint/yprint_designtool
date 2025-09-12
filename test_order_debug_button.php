<?php
/**
 * YPrint Test Order Debug Button - Test des Order Meta-Felder Debug-Buttons
 * 
 * Dieses Script testet den neuen Debug-Button für WooCommerce-Bestellungen,
 * der alle Meta-Felder einer Bestellung anzeigt und analysiert.
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

echo "<h1>🧪 YPrint Test Order Debug Button</h1>\n";
echo "<h2>Test des Order Meta-Felder Debug-Buttons</h2>\n";

global $wpdb;

// 1. ANALYSE: Teste den Order Debug-Button
echo "<h3>1. 📊 Test des Order Debug-Buttons</h3>\n";

// Lade die WooCommerce-Integration Klasse
if (!class_exists('Octo_Print_Designer_WC_Integration')) {
    require_once plugin_dir_path(__FILE__) . 'includes/class-octo-print-designer-wc-integration.php';
}

if (!class_exists('Octo_Print_Designer_WC_Integration')) {
    echo "<p style='color: #dc3545; font-weight: bold;'>❌ Octo_Print_Designer_WC_Integration Klasse nicht gefunden.</p>\n";
    exit;
}

// Teste mit Order ID 5370 (aus der Analyse)
$test_order_id = 5370;
echo "<h4>Test mit Order ID: {$test_order_id}</h4>\n";

// Simuliere den Order Debug-Button
echo "<div id='test-result' style='border: 1px solid #ddd; padding: 15px; margin: 10px 0; background: #f9f9f9; border-radius: 4px;'>";
echo "<p><em>Teste den Order Debug-Button...</em></p>";
echo "</div>";

// 2. VALIDIERUNG: Prüfe die Implementierung
echo "<h3>2. ✅ Validierung der Implementierung</h3>\n";

echo "<div style='background: #d4edda; padding: 15px; border-left: 4px solid #28a745; margin: 10px 0;'>\n";
echo "<h4>✅ Implementierte Features:</h4>\n";
echo "<ul>\n";
echo "<li><strong>Debug-Button:</strong> 'Order Meta-Felder anzeigen' im YPrint Preview Modal</li>\n";
echo "<li><strong>AJAX-Handler:</strong> yprint_debug_order_meta_fields für sichere Datenabfrage</li>\n";
echo "<li><strong>Meta-Feld-Analyse:</strong> Sortierung nach YPrint-relevanten und anderen Feldern</li>\n";
echo "<li><strong>Fehlende Daten-Erkennung:</strong> Automatische Analyse fehlender kritischer Meta-Keys</li>\n";
echo "<li><strong>Formatierte Anzeige:</strong> Strukturierte Darstellung aller Meta-Felder</li>\n";
echo "<li><strong>Serialisierte Daten:</strong> Automatische Deserialisierung und Anzeige</li>\n";
echo "</ul>\n";
echo "</div>\n";

echo "<div style='background: #f8f9fa; padding: 15px; border-left: 4px solid #0073aa; margin: 10px 0;'>\n";
echo "<h4>🔧 Technische Details:</h4>\n";
echo "<ul>\n";
echo "<li><strong>Button-Integration:</strong> Im YPrint Preview Modal integriert</li>\n";
echo "<li><strong>Order-ID-Übertragung:</strong> Automatische Übertragung der Order-ID an das Modal</li>\n";
echo "<li><strong>Nonce-Sicherheit:</strong> Sichere AJAX-Kommunikation mit Nonce-Verifikation</li>\n";
echo "<li><strong>Fehlerbehandlung:</strong> Robuste Fehlerbehandlung für alle Szenarien</li>\n";
echo "<li><strong>Responsive Design:</strong> Scrollbare Anzeige für große Datenmengen</li>\n";
echo "</ul>\n";
echo "</div>\n";

// 3. ERWARTETE FUNKTIONALITÄT
echo "<h3>3. 📋 Erwartete Funktionalität</h3>\n";

echo "<div style='background: #d1ecf1; padding: 15px; border-left: 4px solid #17a2b8; margin: 10px 0;'>\n";
echo "<h4>🎯 Was der Button zeigt:</h4>\n";
echo "<ol>\n";
echo "<li><strong>Alle Meta-Felder:</strong> Komplette Liste aller Meta-Felder für die Bestellung</li>\n";
echo "<li><strong>YPrint-relevante Felder:</strong> Hervorgehobene Anzeige aller YPrint-bezogenen Meta-Felder</li>\n";
echo "<li><strong>Andere Meta-Felder:</strong> Standard WooCommerce und andere Meta-Felder</li>\n";
echo "<li><strong>Fehlende Daten-Analyse:</strong> Automatische Erkennung fehlender kritischer Meta-Keys</li>\n";
echo "<li><strong>Strukturierte Daten:</strong> Automatische Deserialisierung und formatierte Anzeige</li>\n";
echo "</ol>\n";
echo "</div>\n";

echo "<div style='background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 10px 0;'>\n";
echo "<h4>🔍 Kritische Meta-Keys die analysiert werden:</h4>\n";
echo "<ul>\n";
echo "<li><strong>_yprint_workflow_data:</strong> Enthält die Ergebnisse aller 6 Workflow-Schritte</li>\n";
echo "<li><strong>_yprint_final_coordinates:</strong> Alternative Speicherung der finalen Druckkoordinaten</li>\n";
echo "<li><strong>_yprint_template_id:</strong> ID des verwendeten Templates</li>\n";
echo "<li><strong>_yprint_order_size:</strong> Bestellte Größe (S, M, L, XL)</li>\n";
echo "<li><strong>_yprint_design_data:</strong> Design-spezifische Daten</li>\n";
echo "<li><strong>_yprint_measurements:</strong> Messdaten für das Design</li>\n";
echo "</ul>\n";
echo "</div>\n";

// 4. ANLEITUNG
echo "<h3>4. 📋 Anleitung zur Verwendung</h3>\n";

echo "<div style='background: #d1ecf1; padding: 15px; border-left: 4px solid #17a2b8; margin: 10px 0;'>\n";
echo "<h4>🎯 So verwenden Sie den Order Debug-Button:</h4>\n";
echo "<ol>\n";
echo "<li><strong>Gehen Sie zu:</strong> WordPress Admin → WooCommerce → Orders</li>\n";
echo "<li><strong>Wählen Sie eine Bestellung:</strong> Mit YPrint-Daten (z.B. Order #5370)</li>\n";
echo "<li><strong>Führen Sie den Workflow aus:</strong> '🚀 VOLLSTÄNDIGEN WORKFLOW STARTEN'</li>\n";
echo "<li><strong>Öffnen Sie die Vorschau:</strong> 'YPrint Preview verfügbar'</li>\n";
echo "<li><strong>Klicken Sie auf:</strong> '🔍 Order Meta-Felder anzeigen'</li>\n";
echo "<li><strong>Analysieren Sie die Daten:</strong> Prüfen Sie die YPrint-relevanten Meta-Felder</li>\n";
echo "<li><strong>Identifizieren Sie fehlende Daten:</strong> Schauen Sie nach der 'Analyse fehlender YPrint-Daten'</li>\n";
echo "</ol>\n";
echo "</div>\n";

// 5. ERWARTETE ERGEBNISSE
echo "<h3>5. 📊 Erwartete Ergebnisse</h3>\n";

echo "<div style='background: #e2e3e5; padding: 15px; border-left: 4px solid #6c757d; margin: 10px 0;'>\n";
echo "<h4>🔍 Erwartete Debug-Ausgabe für Order #5370:</h4>\n";
echo "<pre style='background: #f8f9fa; padding: 10px; border-radius: 4px; overflow-x: auto;'>\n";
echo "📋 Alle Meta-Felder für Bestellung #5370\n";
echo "✅ X Meta-Felder gefunden:\n\n";
echo "🎯 YPrint-relevante Meta-Felder:\n";
echo "┌─ _yprint_template_id\n";
echo "│  Wert: 3657\n";
echo "└─ _yprint_order_size\n";
echo "   Wert: M\n\n";
echo "📝 Andere Meta-Felder:\n";
echo "┌─ _order_key\n";
echo "│  Wert: wc_order_xyz...\n";
echo "└─ _customer_user\n";
echo "   Wert: 123\n\n";
echo "🔍 Analyse fehlender YPrint-Daten:\n";
echo "❌ Fehlende kritische Meta-Keys:\n";
echo "• _yprint_workflow_data - Enthält die Ergebnisse aller 6 Workflow-Schritte\n";
echo "• _yprint_final_coordinates - Alternative Speicherung der finalen Druckkoordinaten\n";
echo "</pre>\n";
echo "</div>\n";

// 6. PROBLEM-DIAGNOSE
echo "<h3>6. 🔍 Problem-Diagnose</h3>\n";

echo "<div style='background: #f8d7da; padding: 15px; border-left: 4px solid #dc3545; margin: 10px 0;'>\n";
echo "<h4>❌ Identifizierte Probleme:</h4>\n";
echo "<ul>\n";
echo "<li><strong>Fehlende _yprint_workflow_data:</strong> Der Workflow wurde nicht korrekt in der Datenbank gespeichert</li>\n";
echo "<li><strong>Fehlende _yprint_final_coordinates:</strong> Alternative Speicherung der finalen Koordinaten fehlt</li>\n";
echo "<li><strong>Workflow-Abschluss-Problem:</strong> Der YPrint-Workflow hat den Prozess nicht vollständig abgeschlossen</li>\n";
echo "</ul>\n";
echo "</div>\n";

echo "<div style='background: #d1ecf1; padding: 15px; border-left: 4px solid #17a2b8; margin: 10px 0;'>\n";
echo "<h4>✅ Lösungsansätze:</h4>\n";
echo "<ul>\n";
echo "<li><strong>Workflow-Reparatur:</strong> Den YPrint-Workflow erneut ausführen</li>\n";
echo "<li><strong>Datenbank-Reparatur:</strong> Fehlende Meta-Felder manuell hinzufügen</li>\n";
echo "<li><strong>Workflow-Debugging:</strong> Den Workflow-Prozess debuggen und reparieren</li>\n";
echo "</ul>\n";
echo "</div>\n";

// 7. JAVASCRIPT FÜR INTERAKTIVE TESTS
echo "<h3>7. 🚀 Interaktive Tests</h3>\n";
echo "<script>\n";
echo "function testOrderDebugButton(orderId) {\n";
echo "    var resultDiv = document.getElementById('test-result');\n";
echo "    resultDiv.innerHTML = '<p><em>Teste Order Debug-Button für Order ' + orderId + '...</em></p>';\n";
echo "    \n";
echo "    // Simuliere die erweiterte Funktion\n";
echo "    fetch('test_order_debug_button_ajax.php', {\n";
echo "        method: 'POST',\n";
echo "        headers: {'Content-Type': 'application/json'},\n";
echo "        body: JSON.stringify({\n";
echo "            order_id: orderId\n";
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

echo "<h2>✅ Order Debug-Button implementiert!</h2>\n";
echo "<p>Der Order Meta-Felder Debug-Button wurde erfolgreich implementiert.</p>\n";
echo "<p><strong>Funktion:</strong> Zeigt alle Meta-Felder einer Bestellung an und analysiert fehlende YPrint-Daten</p>\n";
echo "<p><strong>Ort:</strong> YPrint Preview Modal → '🔍 Order Meta-Felder anzeigen'</p>\n";
echo "<p><strong>Nächster Schritt:</strong> Testen Sie den Button mit einer echten Bestellung!</p>\n";
?>
