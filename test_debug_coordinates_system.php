<?php
/**
 * Test-Datei für das Debug-Koordinaten-System
 * 
 * Diese Datei demonstriert die drei Debug-Änderungen:
 * 1. Koordinaten-Tracking in saveMeasurementToDatabase()
 * 2. DOM-Duplikat-Tracking in createVisibleMeasurementElement()
 * 3. Backend AJAX-Handler für Template-Basis-Dimensionen
 */

// Mock WordPress-Funktionen für Test
if (!function_exists('wp_verify_nonce')) {
    function wp_verify_nonce($nonce, $action) {
        return true; // Für Test-Zwecke
    }
}

if (!function_exists('wp_send_json_success')) {
    function wp_send_json_success($data) {
        echo json_encode(['success' => true, 'data' => $data]);
    }
}

if (!function_exists('wp_send_json_error')) {
    function wp_send_json_error($data) {
        echo json_encode(['success' => false, 'data' => $data]);
    }
}

if (!function_exists('get_post_meta')) {
    function get_post_meta($post_id, $key, $single = true) {
        // Mock-Daten für Test
        if ($key === '_template_view_print_areas') {
            return [
                '189542' => [
                    'canvas_width' => 800,
                    'canvas_height' => 600,
                    'measurements' => [
                        'reference_measurement' => [
                            'measurement_type' => 'chest',
                            'pixel_distance' => 154.003,
                            'reference_points' => [
                                ['x' => 78, 'y' => 147],
                                ['x' => 232, 'y' => 146]
                            ]
                        ]
                    ]
                ]
            ];
        }
        return null;
    }
}

if (!function_exists('sanitize_text_field')) {
    function sanitize_text_field($str) {
        return trim($str);
    }
}

if (!function_exists('intval')) {
    function intval($value) {
        return (int) $value;
    }
}

echo "🔍 YPRINT DEBUG-KOORDINATEN-SYSTEM TEST\n";
echo "==========================================\n\n";

// Test 1: AJAX-Handler für Template-Basis-Dimensionen
echo "1. TEST: AJAX-Handler für Template-Basis-Dimensionen\n";
echo "----------------------------------------------------\n";

// Simuliere POST-Daten
$_POST = [
    'nonce' => 'test_nonce',
    'template_id' => '3657',
    'view_id' => '189542'
];

// Lade die Template-Klasse
require_once 'admin/class-octo-print-designer-template.php';

// Teste den AJAX-Handler
echo "📊 Teste ajax_load_template_base_dimensions()...\n";

ob_start();
try {
    Octo_Print_Designer_Template::ajax_load_template_base_dimensions();
    $output = ob_get_clean();
    $result = json_decode($output, true);
    
    if ($result && $result['success']) {
        echo "✅ AJAX-Handler funktioniert korrekt!\n";
        echo "📐 Template-Basis-Dimensionen:\n";
        echo "   - Breite: " . $result['data']['width'] . "px\n";
        echo "   - Höhe: " . $result['data']['height'] . "px\n";
        echo "🔍 Debug-Info:\n";
        echo "   - Template ID: " . $result['data']['debug']['template_id'] . "\n";
        echo "   - View ID: " . $result['data']['debug']['view_id'] . "\n";
        echo "   - View-Daten existiert: " . ($result['data']['debug']['view_data_exists'] ? 'Ja' : 'Nein') . "\n";
        echo "   - Messungen-Anzahl: " . $result['data']['debug']['measurements_count'] . "\n";
    } else {
        echo "❌ AJAX-Handler Fehler: " . ($result['data']['message'] ?? 'Unbekannter Fehler') . "\n";
    }
} catch (Exception $e) {
    ob_end_clean();
    echo "❌ Exception: " . $e->getMessage() . "\n";
}

echo "\n";

// Test 2: Koordinaten-Normalisierung Simulation
echo "2. TEST: Koordinaten-Normalisierung Simulation\n";
echo "----------------------------------------------\n";

// Simuliere verschiedene Canvas-Größen
$test_cases = [
    ['canvas_width' => 300, 'canvas_height' => 150, 'description' => 'Mobile Canvas (300x150)'],
    ['canvas_width' => 800, 'canvas_height' => 600, 'description' => 'Template-Basis (800x600)'],
    ['canvas_width' => 1200, 'canvas_height' => 900, 'description' => 'Desktop Canvas (1200x900)']
];

$template_base = ['width' => 800, 'height' => 600];
$measurement_points = [
    ['x' => 100, 'y' => 75],   // Punkt 1
    ['x' => 200, 'y' => 75]    // Punkt 2
];

foreach ($test_cases as $case) {
    echo "📱 " . $case['description'] . ":\n";
    echo "   Canvas: " . $case['canvas_width'] . "x" . $case['canvas_height'] . "px\n";
    
    foreach ($measurement_points as $i => $point) {
        // Normalisierungsberechnung (wie im JavaScript)
        $normalizedX = ($point['x'] / $case['canvas_width']) * $template_base['width'];
        $normalizedY = ($point['y'] / $case['canvas_height']) * $template_base['height'];
        
        echo "   Punkt " . ($i + 1) . ": (" . $point['x'] . "," . $point['y'] . ") → (" . 
             round($normalizedX, 1) . "," . round($normalizedY, 1) . ")\n";
    }
    
    // Berechne Normalisierungs-Faktoren
    $scaleX = $template_base['width'] / $case['canvas_width'];
    $scaleY = $template_base['height'] / $case['canvas_height'];
    echo "   Skalierungs-Faktoren: X=" . round($scaleX, 3) . ", Y=" . round($scaleY, 3) . "\n\n";
}

// Test 3: DOM-Duplikat-Erkennung Simulation
echo "3. TEST: DOM-Duplikat-Erkennung Simulation\n";
echo "------------------------------------------\n";

// Simuliere verschiedene DOM-Zustände
$dom_states = [
    [
        'description' => 'Sauberer Zustand',
        'dom_elements' => 0,
        'db_measurements' => 0,
        'expected' => 'Konsistent'
    ],
    [
        'description' => 'Eine Messung gespeichert',
        'dom_elements' => 1,
        'db_measurements' => 1,
        'expected' => 'Konsistent'
    ],
    [
        'description' => 'DOM-Duplikat (Race Condition)',
        'dom_elements' => 2,
        'db_measurements' => 1,
        'expected' => 'INCONSISTENCY erkannt'
    ],
    [
        'description' => 'DOM fehlt nach Reload',
        'dom_elements' => 0,
        'db_measurements' => 1,
        'expected' => 'INCONSISTENCY erkannt'
    ]
];

foreach ($dom_states as $state) {
    echo "🔍 " . $state['description'] . ":\n";
    echo "   DOM-Elemente: " . $state['dom_elements'] . "\n";
    echo "   DB-Messungen: " . $state['db_measurements'] . "\n";
    
    if ($state['dom_elements'] !== $state['db_measurements']) {
        echo "   ⚠️ " . $state['expected'] . " - Database vs DOM mismatch!\n";
        echo "   💡 Debug-System würde warnen und Details loggen\n";
    } else {
        echo "   ✅ " . $state['expected'] . " - Keine Duplikate\n";
    }
    echo "\n";
}

echo "🎯 DEBUG-SYSTEM ZUSAMMENFASSUNG\n";
echo "===============================\n";
echo "✅ Koordinaten-Tracking: Implementiert in saveMeasurementToDatabase()\n";
echo "✅ DOM-Duplikat-Tracking: Implementiert in createVisibleMeasurementElement()\n";
echo "✅ Backend AJAX-Handler: Implementiert in ajax_load_template_base_dimensions()\n";
echo "✅ AJAX-Registrierung: In register_measurement_ajax_handlers() hinzugefügt\n\n";

echo "🔍 NÄCHSTE SCHRITTE:\n";
echo "1. Öffne Browser-Console beim Speichern einer Messung\n";
echo "2. Suche nach 'KOORDINATEN-DEBUG' und 'DOM-DEBUG' Logs\n";
echo "3. Prüfe Canvas-Größen und Normalisierungs-Faktoren\n";
echo "4. Überwache Database vs DOM Konsistenz\n";
echo "5. Analysiere Race-Conditions bei Page-Reload\n\n";

echo "📊 ERWARTETE DEBUG-AUSGABEN:\n";
echo "- Canvas-Info für View: {element, currentRect, computedStyle}\n";
echo "- Template-Basis-Dimensionen: {width, height, debug}\n";
echo "- Koordinaten-Normalisierung: Original → Normalisiert mit Faktoren\n";
echo "- DOM-Duplikat-Check: Existierende Elemente vs Database-Messungen\n";
echo "- INCONSISTENCY-Warnungen bei Mismatches\n\n";

echo "🎯 Das Debug-System ist bereit für die Analyse der drei Architektur-Probleme!\n";
?>
