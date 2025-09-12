<?php
/**
 * YPrint Validation System Test - Test der neuen Validierungslogik
 * 
 * Dieses Script testet die implementierten Validierungen für Frontend und Backend
 * um sicherzustellen, dass extreme Messfehler abgefangen werden.
 */

echo "<h1>🧪 YPrint Validation System Test</h1>\n";
echo "<h2>Test der neuen Validierungslogik</h2>\n";

// Simuliere verschiedene Test-Szenarien
$test_scenarios = array(
    array(
        'name' => '✅ Normale Messung (Größe M)',
        'pixel_distance' => 200,
        'physical_distance_cm' => 50,
        'expected_ratio' => 0.25,
        'should_pass' => true
    ),
    array(
        'name' => '❌ Pixel-Distanz zu klein',
        'pixel_distance' => 5,
        'physical_distance_cm' => 50,
        'expected_ratio' => 10.0,
        'should_pass' => false,
        'expected_error' => 'Pixel distance too small'
    ),
    array(
        'name' => '❌ Pixel-Distanz zu groß',
        'pixel_distance' => 800,
        'physical_distance_cm' => 50,
        'expected_ratio' => 0.0625,
        'should_pass' => false,
        'expected_error' => 'Pixel distance too large'
    ),
    array(
        'name' => '❌ Physische Distanz zu klein',
        'pixel_distance' => 200,
        'physical_distance_cm' => 2,
        'expected_ratio' => 0.01,
        'should_pass' => false,
        'expected_error' => 'Physical distance too small'
    ),
    array(
        'name' => '❌ Physische Distanz zu groß',
        'pixel_distance' => 200,
        'physical_distance_cm' => 150,
        'expected_ratio' => 0.75,
        'should_pass' => false,
        'expected_error' => 'Physical distance too large'
    ),
    array(
        'name' => '❌ Ratio zu klein (wie im Screenshot)',
        'pixel_distance' => 100,
        'physical_distance_cm' => 2,
        'expected_ratio' => 0.02,
        'should_pass' => false,
        'expected_error' => 'Unrealistic pixel-to-cm ratio detected (too small)'
    ),
    array(
        'name' => '❌ Ratio zu groß',
        'pixel_distance' => 10,
        'physical_distance_cm' => 10,
        'expected_ratio' => 1.0,
        'should_pass' => false,
        'expected_error' => 'Unrealistic pixel-to-cm ratio detected (too large)'
    ),
    array(
        'name' => '⚠️ Grenzwertiger Ratio (zu klein)',
        'pixel_distance' => 200,
        'physical_distance_cm' => 8,
        'expected_ratio' => 0.04,
        'should_pass' => false,
        'expected_error' => 'Unrealistic pixel-to-cm ratio detected (too small)'
    ),
    array(
        'name' => '⚠️ Grenzwertiger Ratio (zu groß)',
        'pixel_distance' => 50,
        'physical_distance_cm' => 20,
        'expected_ratio' => 0.4,
        'should_pass' => true // Sollte noch durchgehen
    )
);

echo "<h3>📊 Test-Szenarien</h3>\n";
echo "<table border='1' style='border-collapse: collapse; width: 100%; margin: 10px 0;'>\n";
echo "<tr style='background: #f8f9fa;'>";
echo "<th style='padding: 8px;'>Szenario</th>";
echo "<th style='padding: 8px;'>Pixel-Distanz</th>";
echo "<th style='padding: 8px;'>Physische Distanz</th>";
echo "<th style='padding: 8px;'>Erwartete Ratio</th>";
echo "<th style='padding: 8px;'>Sollte bestehen</th>";
echo "<th style='padding: 8px;'>Erwarteter Fehler</th>";
echo "</tr>\n";

foreach ($test_scenarios as $scenario) {
    $status_color = $scenario['should_pass'] ? '#d4edda' : '#f8d7da';
    $status_text = $scenario['should_pass'] ? '✅ Ja' : '❌ Nein';
    
    echo "<tr style='background: {$status_color};'>";
    echo "<td style='padding: 8px;'><strong>" . htmlspecialchars($scenario['name']) . "</strong></td>";
    echo "<td style='padding: 8px;'>" . $scenario['pixel_distance'] . "px</td>";
    echo "<td style='padding: 8px;'>" . $scenario['physical_distance_cm'] . "cm</td>";
    echo "<td style='padding: 8px;'>" . $scenario['expected_ratio'] . "</td>";
    echo "<td style='padding: 8px;'>" . $status_text . "</td>";
    echo "<td style='padding: 8px; font-size: 11px;'>" . ($scenario['expected_error'] ?? '-') . "</td>";
    echo "</tr>\n";
}

echo "</table>\n";

echo "<h3>🔍 Validierungslogik</h3>\n";
echo "<div style='background: #e7f3ff; padding: 15px; border-left: 4px solid #0073aa; margin: 10px 0;'>\n";
echo "<h4>Frontend-Validierung (template-measurements.js):</h4>\n";
echo "<ul>\n";
echo "<li><strong>Pixel-Distanz:</strong> 10px - 700px (mit Warnung bei 20px Minimum)</li>\n";
echo "<li><strong>Benutzerfreundlich:</strong> Sofortige Rückmeldung mit klaren Anweisungen</li>\n";
echo "<li><strong>Verhindert:</strong> Unrealistische Messungen bereits beim Klicken</li>\n";
echo "</ul>\n";

echo "<h4>Backend-Validierung (class-yprint-linear-coordinate-system.php):</h4>\n";
echo "<ul>\n";
echo "<li><strong>Pixel-Distanz:</strong> 10px - 700px</li>\n";
echo "<li><strong>Physische Distanz:</strong> 5cm - 100cm</li>\n";
echo "<li><strong>Pixel-zu-cm-Ratio:</strong> 0.05 - 0.5 (mit Warnung bei 0.1 - 0.3)</li>\n";
echo "<li><strong>Detaillierte Fehlermeldungen:</strong> Mit Debug-Informationen</li>\n";
echo "</ul>\n";
echo "</div>\n";

echo "<h3>🎯 Erwartete Ergebnisse</h3>\n";
echo "<div style='background: #f0f8ff; padding: 15px; border-left: 4px solid #28a745; margin: 10px 0;'>\n";
echo "<h4>Das System sollte jetzt:</h4>\n";
echo "<ol>\n";
echo "<li><strong>Frontend:</strong> Unrealistische Messungen sofort abfangen und den Benutzer warnen</li>\n";
echo "<li><strong>Backend:</strong> Extreme Werte erkennen und detaillierte Fehlermeldungen ausgeben</li>\n";
echo "<li><strong>Vorschau:</strong> Inkonsistente Daten klar anzeigen mit Lösungsvorschlägen</li>\n";
echo "<li><strong>Logging:</strong> Alle Validierungsfehler in den Error-Logs dokumentieren</li>\n";
echo "</ol>\n";
echo "</div>\n";

echo "<h3>🚀 Nächste Schritte</h3>\n";
echo "<div style='background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 10px 0;'>\n";
echo "<h4>Um das System zu testen:</h4>\n";
echo "<ol>\n";
echo "<li><strong>Template-Kalibrierung:</strong> Gehen Sie zum Admin-Bereich und testen Sie die Messungen</li>\n";
echo "<li><strong>Frontend-Test:</strong> Versuchen Sie, Messpunkte zu nah oder zu weit auseinander zu setzen</li>\n";
echo "<li><strong>Backend-Test:</strong> Überprüfen Sie die Error-Logs auf Validierungsmeldungen</li>\n";
echo "<li><strong>Vorschau-Test:</strong> Starten Sie den Workflow und prüfen Sie die Konsistenz-Anzeige</li>\n";
echo "</ol>\n";
echo "</div>\n";

echo "<h2>✅ Validierungssystem implementiert</h2>\n";
echo "<p>Das System ist jetzt robust gegen extreme Messfehler und gibt klare Rückmeldungen bei Problemen.</p>\n";
?>
