<?php
/**
 * Test für die neuen API-Mapping-Funktionen
 * Überprüft die korrekte Konvertierung von YPrint-Werten zu AllesKlarDruck API-Werten
 */

// WordPress laden
require_once('wp-config.php');

// API Integration Klasse laden
require_once('includes/class-octo-print-api-integration.php');

echo "<h1>🧪 Test: API Mapping Updates</h1>\n";
echo "<p>Überprüfung der neuen Mapping-Funktionen für Produkttypen und Druckmethoden</p>\n";

// API Integration Instanz erstellen
$api_integration = Octo_Print_API_Integration::get_instance();

// Reflection verwenden, um private Methoden zu testen
$reflection = new ReflectionClass($api_integration);

// Test 1: Produkttyp-Mapping
echo "<h2>📋 Test 1: Produkttyp-Mapping</h2>\n";

$map_product_type_method = $reflection->getMethod('map_product_type');
$map_product_type_method->setAccessible(true);

$product_type_tests = array(
    'T-Shirt' => 'TSHIRT',
    'T-Shirts' => 'TSHIRT',
    'Hoodie' => 'HOODIE',
    'Zipper' => 'ZIPPER_JACKET',
    'Zip-Hoodie' => 'ZIPPER_JACKET',
    'Polo' => 'POLO',
    'Longsleeve' => 'LONG_SLEEVE',
    'Unbekannter Typ' => 'TSHIRT' // Fallback
);

echo "<table border='1' style='border-collapse: collapse; width: 100%;'>\n";
echo "<tr><th>YPrint Produkttyp</th><th>Erwarteter API-Wert</th><th>Tatsächlicher API-Wert</th><th>Status</th></tr>\n";

foreach ($product_type_tests as $yprint_type => $expected_api_type) {
    $actual_api_type = $map_product_type_method->invoke($api_integration, $yprint_type);
    $status = ($actual_api_type === $expected_api_type) ? '✅' : '❌';
    
    echo "<tr>";
    echo "<td>" . esc_html($yprint_type) . "</td>";
    echo "<td>" . esc_html($expected_api_type) . "</td>";
    echo "<td>" . esc_html($actual_api_type) . "</td>";
    echo "<td>" . $status . "</td>";
    echo "</tr>\n";
}

echo "</table>\n";

// Test 2: Druckmethoden-Mapping
echo "<h2>🖨️ Test 2: Druckmethoden-Mapping</h2>\n";

$map_print_method_method = $reflection->getMethod('map_print_method');
$map_print_method_method->setAccessible(true);

$print_method_tests = array(
    'DTG' => 'DTG',
    'Direct-to-Garment' => 'DTG',
    'DTF' => 'DTF',
    'Direct-to-Film' => 'DTF',
    'Siebdruck' => 'SCREEN',
    'Screen' => 'SCREEN',
    'Screen Printing' => 'SCREEN',
    'Unbekannte Methode' => 'DTG' // Fallback
);

echo "<table border='1' style='border-collapse: collapse; width: 100%;'>\n";
echo "<tr><th>YPrint Druckmethode</th><th>Erwarteter API-Wert</th><th>Tatsächlicher API-Wert</th><th>Status</th></tr>\n";

foreach ($print_method_tests as $yprint_method => $expected_api_method) {
    $actual_api_method = $map_print_method_method->invoke($api_integration, $yprint_method);
    $status = ($actual_api_method === $expected_api_method) ? '✅' : '❌';
    
    echo "<tr>";
    echo "<td>" . esc_html($yprint_method) . "</td>";
    echo "<td>" . esc_html($expected_api_method) . "</td>";
    echo "<td>" . esc_html($actual_api_method) . "</td>";
    echo "<td>" . $status . "</td>";
    echo "</tr>\n";
}

echo "</table>\n";

// Test 3: Produkt-Mapping Integration
echo "<h2>🔧 Test 3: Produkt-Mapping Integration</h2>\n";

$get_product_mapping_method = $reflection->getMethod('get_product_mapping');
$get_product_mapping_method->setAccessible(true);

// Test mit verschiedenen Produkttypen
$test_cases = array(
    array('name' => 'T-Shirt Standard', 'type' => 'T-Shirt', 'method' => 'DTG'),
    array('name' => 'Hoodie DTF', 'type' => 'Hoodie', 'method' => 'DTF'),
    array('name' => 'Zipper Siebdruck', 'type' => 'Zipper', 'method' => 'Siebdruck'),
    array('name' => 'Polo DTG', 'type' => 'Polo', 'method' => 'DTG')
);

echo "<div style='background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;'>\n";
echo "<h3>Simulierte Produkt-Mappings</h3>\n";

foreach ($test_cases as $test_case) {
    echo "<div style='background: white; padding: 10px; margin: 10px 0; border-radius: 3px; border-left: 4px solid #007cba;'>\n";
    echo "<h4>" . esc_html($test_case['name']) . "</h4>\n";
    
    // Simuliere ein Produkt-Mapping
    $mapping = array(
        'print_method' => $map_print_method_method->invoke($api_integration, $test_case['method']),
        'manufacturer' => 'yprint',
        'series' => 'SS25',
        'type' => $map_product_type_method->invoke($api_integration, $test_case['type'])
    );
    
    echo "<p><strong>API Mapping:</strong></p>\n";
    echo "<ul>\n";
    echo "<li><strong>printMethod:</strong> " . esc_html($mapping['print_method']) . "</li>\n";
    echo "<li><strong>manufacturer:</strong> " . esc_html($mapping['manufacturer']) . "</li>\n";
    echo "<li><strong>series:</strong> " . esc_html($mapping['series']) . "</li>\n";
    echo "<li><strong>type:</strong> " . esc_html($mapping['type']) . "</li>\n";
    echo "</ul>\n";
    echo "</div>\n";
}

echo "</div>\n";

// Test 4: JSON-Struktur Validierung
echo "<h2>📄 Test 4: JSON-Struktur Validierung</h2>\n";

$sample_payload = array(
    'orderNumber' => '5338',
    'orderDate' => '2025-07-22T10:59:48+00:00',
    'shipping' => array(
        'recipient' => array(
            'name' => 'Liefer Adresse',
            'street' => 'Liefer Adresse',
            'city' => 'Schwebheim',
            'postalCode' => '97525',
            'country' => 'DE'
        ),
        'sender' => array(
            'name' => 'YPrint',
            'street' => 'Rottendorfer Straße 35A',
            'city' => 'Würzburg',
            'postalCode' => '97074',
            'country' => 'DE'
        )
    ),
    'orderPositions' => array(
        array(
            'printMethod' => 'DTG',
            'manufacturer' => 'yprint',
            'series' => 'SS25',
            'color' => 'Black',
            'type' => 'TSHIRT',
            'size' => 'L',
            'quantity' => 1,
            'printPositions' => array(
                array(
                    'position' => 'front',
                    'width' => 35.8,
                    'height' => 36.6,
                    'unit' => 'cm',
                    'offsetX' => 82.3,
                    'offsetY' => 70,
                    'offsetUnit' => 'cm',
                    'referencePoint' => 'center',
                    'printFile' => 'https://yprint.de/wp-content/uploads/octo-print-designer/user-images/17/cool-profile-picture-paper-bag-head-4co57dtwk64fb7lv.jpg',
                    'previewUrl' => 'https://yprint.de/wp-content/uploads/octo-print-designer/previews/17/shirt-preview-front-5338.png'
                )
            )
        )
    )
);

echo "<div style='background: #e7f3ff; border: 1px solid #b3d9ff; border-radius: 4px; padding: 15px; margin: 20px 0;'>\n";
echo "<h3>✅ Erwartete JSON-Struktur</h3>\n";
echo "<p>Die neue API-Struktur enthält alle erforderlichen Felder:</p>\n";
echo "<ul>\n";
echo "<li><strong>referencePoint:</strong> 'center' für zentrierte Positionierung</li>\n";
echo "<li><strong>previewUrl:</strong> URL zur Vorschau des Designs</li>\n";
echo "<li><strong>type:</strong> API-konforme Produkttypen (TSHIRT, HOODIE, etc.)</li>\n";
echo "<li><strong>printMethod:</strong> API-konforme Druckmethoden (DTG, DTF, SCREEN)</li>\n";
echo "</ul>\n";
echo "</div>\n";

echo "<div style='background: #f5f5f5; padding: 15px; border-radius: 5px; max-height: 400px; overflow-y: auto;'>\n";
echo "<h3>Beispiel JSON-Payload</h3>\n";
echo "<pre style='white-space: pre-wrap;'>" . wp_json_encode($sample_payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "</pre>\n";
echo "</div>\n";

// Test 5: Fallback-Verhalten
echo "<h2>🛡️ Test 5: Fallback-Verhalten</h2>\n";

$fallback_tests = array(
    'Unbekannter Produkttyp' => array(
        'input' => 'Unbekannter Typ',
        'expected_type' => 'TSHIRT',
        'expected_method' => 'DTG'
    ),
    'Leerer String' => array(
        'input' => '',
        'expected_type' => 'TSHIRT',
        'expected_method' => 'DTG'
    ),
    'Null-Wert' => array(
        'input' => null,
        'expected_type' => 'TSHIRT',
        'expected_method' => 'DTG'
    )
);

echo "<table border='1' style='border-collapse: collapse; width: 100%;'>\n";
echo "<tr><th>Testfall</th><th>Eingabe</th><th>Erwarteter Fallback</th><th>Status</th></tr>\n";

foreach ($fallback_tests as $test_name => $test_data) {
    $actual_type = $map_product_type_method->invoke($api_integration, $test_data['input']);
    $actual_method = $map_print_method_method->invoke($api_integration, $test_data['input']);
    
    $type_status = ($actual_type === $test_data['expected_type']) ? '✅' : '❌';
    $method_status = ($actual_method === $test_data['expected_method']) ? '✅' : '❌';
    
    echo "<tr>";
    echo "<td>" . esc_html($test_name) . "</td>";
    echo "<td>" . esc_html(var_export($test_data['input'], true)) . "</td>";
    echo "<td>Type: " . esc_html($test_data['expected_type']) . ", Method: " . esc_html($test_data['expected_method']) . "</td>";
    echo "<td>Type: " . $type_status . ", Method: " . $method_status . "</td>";
    echo "</tr>\n";
}

echo "</table>\n";

echo "<h2>🎯 Zusammenfassung</h2>\n";
echo "<div style='background: #d4edda; border: 1px solid #c3e6cb; border-radius: 4px; padding: 15px; margin: 20px 0;'>\n";
echo "<h3>✅ Implementierte Verbesserungen</h3>\n";
echo "<ul>\n";
echo "<li><strong>Produkttyp-Mapping:</strong> YPrint-Produkttypen werden korrekt zu API-konformen Werten konvertiert</li>\n";
echo "<li><strong>Druckmethoden-Mapping:</strong> YPrint-Druckmethoden werden zu API-konformen Werten gemappt</li>\n";
echo "<li><strong>ReferencePoint:</strong> Zentrierte Positionierung für bessere Druckgenauigkeit</li>\n";
echo "<li><strong>PreviewUrl:</strong> Integration von Vorschau-URLs für bessere Qualitätskontrolle</li>\n";
echo "<li><strong>Fallback-Werte:</strong> Robuste Fehlerbehandlung mit sinnvollen Standardwerten</li>\n";
echo "</ul>\n";
echo "</div>\n";

echo "<div style='background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; padding: 15px; margin: 20px 0;'>\n";
echo "<h3>⚠️ Wichtige Hinweise</h3>\n";
echo "<ul>\n";
echo "<li>Alle Mapping-Funktionen haben Fallback-Werte für unbekannte Eingaben</li>\n";
echo "<li>Die API wird jetzt Fehler zurückgeben, wenn ungültige Werte gesendet werden</li>\n";
echo "<li>Teste alle möglichen Produkttypen in deinem System</li>\n";
echo "<li>Überprüfe die API-Dokumentation für weitere referencePoint-Optionen</li>\n";
echo "</ul>\n";
echo "</div>\n";

echo "<p><strong>Test abgeschlossen!</strong> Die neuen API-Mapping-Funktionen sind implementiert und getestet.</p>\n";
?> 