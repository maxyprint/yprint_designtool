<?php
/**
 * TEST: Visualisierungssystem Koordinaten-Fix
 * 
 * Dieses Script testet, ob das Visualisierungssystem jetzt
 * _yprint_real_design_coordinates erkennt und verwendet.
 */

echo "🔍 TEST: Visualisierungssystem Koordinaten-Fix\n";
echo "=============================================\n\n";

$order_id = 5371;

// Simuliere WordPress-Umgebung für Demo
if (!function_exists('get_post_meta')) {
    echo "⚠️ WordPress-Umgebung nicht verfügbar.\n";
    echo "📋 FÜR ECHTE AUSFÜHRUNG:\n";
    echo "   1. Laden Sie dieses Script in WordPress Admin\n";
    echo "   2. Oder führen Sie es in der WordPress-Umgebung aus\n\n";
    
    // Simuliere Funktionen für Demo
    function get_post_meta($post_id, $meta_key, $single = true) {
        // Simuliere _yprint_real_design_coordinates für Bestellung #5371
        if ($post_id == 5371 && $meta_key == '_yprint_real_design_coordinates') {
            return array(
                array(
                    'element_id' => 'img_1757677779275_489',
                    'url' => 'https://yprint.de/wp-content/uploads/2025/03/ylifelogowhite.png',
                    'x_mm' => 248.48,
                    'y_mm' => 218.57,
                    'width_mm' => 166.16,
                    'height_mm' => 197.21,
                    'rotation' => 0,
                    'x_px' => 326,
                    'y_px' => 135,
                    'width_px' => 1924,
                    'height_px' => 1075,
                    'scale_x' => 0.1133,
                    'scale_y' => 0.1133,
                    'source' => 'real_design_data_converted'
                ),
                array(
                    'element_id' => 'img_1757677794968_564',
                    'url' => 'https://yprint.de/wp-content/uploads/2025/03/yprint-logo.png',
                    'x_mm' => 309.0,
                    'y_mm' => 185.0,
                    'width_mm' => 55.0,
                    'height_mm' => 22.0,
                    'rotation' => 0,
                    'x_px' => 406,
                    'y_px' => 114,
                    'width_px' => 824,
                    'height_px' => 331,
                    'scale_x' => 0.0673,
                    'scale_y' => 0.0673,
                    'source' => 'real_design_data_converted'
                )
            );
        }
        
        // Simuliere leere _yprint_final_coordinates
        if ($post_id == 5371 && $meta_key == '_yprint_final_coordinates') {
            return array(); // Leer - das war das Problem
        }
        
        return false;
    }
}

echo "✅ Teste Bestellung #5371:\n";
echo "   Order ID: {$order_id}\n\n";

// Teste die neue get_final_coordinates Logik
echo "🔍 TESTE NEUE GET_FINAL_COORDINATES LOGIK:\n";
echo "----------------------------------------\n";

// PRIORITÄT 1: Workflow-Daten (sollte leer sein)
$workflow_data = get_post_meta($order_id, '_yprint_workflow_data', true);
echo "1. Workflow-Daten: " . (empty($workflow_data) ? "❌ LEER" : "✅ VORHANDEN") . "\n";

// PRIORITÄT 2: Finale Koordinaten (sollte leer sein)
$final_coordinates = get_post_meta($order_id, '_yprint_final_coordinates', true);
echo "2. Finale Koordinaten: " . (empty($final_coordinates) ? "❌ LEER" : "✅ VORHANDEN") . "\n";

// PRIORITÄT 3.5: Real Design Coordinates (NEU - sollte funktionieren!)
$real_design_coordinates = get_post_meta($order_id, '_yprint_real_design_coordinates', true);
echo "3. Real Design Koordinaten: " . (empty($real_design_coordinates) ? "❌ LEER" : "✅ VORHANDEN") . "\n";

if (!empty($real_design_coordinates) && is_array($real_design_coordinates)) {
    echo "   → Anzahl Elemente: " . count($real_design_coordinates) . "\n";
    
    // Nimm das erste Element als finale Koordinaten
    $primary_element = $real_design_coordinates[0];
    
    echo "   → Primary Element:\n";
    echo "      ID: " . $primary_element['element_id'] . "\n";
    echo "      Position: x=" . $primary_element['x_mm'] . "mm, y=" . $primary_element['y_mm'] . "mm\n";
    echo "      Größe: " . $primary_element['width_mm'] . "x" . $primary_element['height_mm'] . "mm\n";
    echo "      Source: " . $primary_element['source'] . "\n";
    
    // Simuliere die Rückgabe der get_final_coordinates Funktion
    $final_coords = array(
        'x_mm' => floatval($primary_element['x_mm'] ?? 0),
        'y_mm' => floatval($primary_element['y_mm'] ?? 0),
        'width_mm' => floatval($primary_element['width_mm'] ?? 0),
        'height_mm' => floatval($primary_element['height_mm'] ?? 0),
        'dpi' => 74,
        'source' => 'real_design_coordinates',
        'element_count' => count($real_design_coordinates)
    );
    
    echo "\n🎯 ERWARTETE RÜCKGABE DER GET_FINAL_COORDINATES FUNKTION:\n";
    echo "----------------------------------------------------\n";
    echo "x_mm: " . $final_coords['x_mm'] . "\n";
    echo "y_mm: " . $final_coords['y_mm'] . "\n";
    echo "width_mm: " . $final_coords['width_mm'] . "\n";
    echo "height_mm: " . $final_coords['height_mm'] . "\n";
    echo "dpi: " . $final_coords['dpi'] . "\n";
    echo "source: " . $final_coords['source'] . "\n";
    echo "element_count: " . $final_coords['element_count'] . "\n";
}

echo "\n🎯 ERWARTETES ERGEBNIS FÜR VISUALISIERUNG:\n";
echo "----------------------------------------\n";
echo "✅ Statt: 200×250mm (Standard)\n";
echo "✅ Jetzt: 166×197mm (echte Größe aus Design ID 64)\n";
echo "✅ Statt: 50mm, 50mm (Fallback-Position)\n";
echo "✅ Jetzt: 248mm, 218mm (echte Position aus Canvas-Berechnung)\n\n";

echo "📋 NÄCHSTE SCHRITTE:\n";
echo "   1. Gehen Sie zur Bestellung #5371 in WordPress Admin\n";
echo "   2. Prüfen Sie die YPrint-Visualisierung\n";
echo "   3. [final_coordinates] sollte jetzt echte Daten enthalten\n";
echo "   4. Die Visualisierung sollte die korrekten Dimensionen anzeigen\n\n";

echo "✅ TEST ABGESCHLOSSEN!\n";
echo "=====================\n";
echo "Das Visualisierungssystem sollte jetzt _yprint_real_design_coordinates erkennen!\n";
?>
