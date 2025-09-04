<?php
/**
 * Test der PHP-Serialized-Array-Unterstützung
 * 
 * Testet ob die reparierte Funktion jetzt sowohl JSON als auch PHP-Serialized-Arrays unterstützt
 */

// Simuliere die reparierte generate_size_scale_factors Funktion
function test_generate_size_scale_factors_with_php_serialized($template_id, $size_name) {
    echo "🧪 Teste generate_size_scale_factors mit PHP-Serialized-Array...\n";
    
    // Simuliere die Daten aus der Datenbank (PHP-Serialized-Array)
    // Erstelle ein gültiges PHP-Serialized-Array
    $template_data = array(
        189542 => array(
            'canvas_width' => 800,
            'canvas_height' => 600,
            'photo_width_px' => 0,
            'photo_height_px' => 0,
            'measurements' => array(
                array(
                    'type' => 'height_from_shoulder',
                    'pixel_distance' => 154.0,
                    'real_distance_cm' => 60.0,
                    'position' => 'front',
                    'size' => 's',
                    'created_at' => '2024-01-15 10:30:00',
                    'updated_at' => '2024-01-15 10:30:00',
                    'status' => 'active',
                    'id' => 1
                )
            )
        ),
        679311 => array(
            'canvas_width' => 800,
            'canvas_height' => 600,
            'photo_width_px' => 0,
            'photo_height_px' => 0,
            'measurements' => array(
                array(
                    'type' => 'chest',
                    'pixel_distance' => 200.0,
                    'real_distance_cm' => 90.0,
                    'position' => 'front',
                    'size' => 's',
                    'created_at' => '2024-01-15 10:30:00',
                    'updated_at' => '2024-01-15 10:30:00',
                    'status' => 'active',
                    'id' => 2
                )
            )
        )
    );
    
    // Serialisiere das Array
    $template_measurements_raw = serialize($template_data);
    
    echo "📊 Rohe Daten geladen: " . strlen($template_measurements_raw) . " Zeichen\n";
    echo "🔍 Preview: " . substr($template_measurements_raw, 0, 100) . "...\n\n";
    
    // ✅ NEU: Unterstütze sowohl JSON als auch PHP-Serialized-Arrays
    $template_measurements = null;
    
    if (is_string($template_measurements_raw)) {
        // Versuche zuerst JSON zu parsen
        if (function_exists('json_decode')) {
            $json_data = json_decode($template_measurements_raw, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($json_data)) {
                $template_measurements = $json_data;
                echo "✅ JSON-Daten erfolgreich geparst\n";
            } else {
                echo "⚠️ JSON-Parsing fehlgeschlagen: " . json_last_error_msg() . "\n";
            }
        }
        
        // Falls JSON fehlschlägt, versuche PHP-Serialized-Array
        if ($template_measurements === null) {
            if (function_exists('unserialize')) {
                $unserialized_data = @unserialize($template_measurements_raw);
                if ($unserialized_data !== false && is_array($unserialized_data)) {
                    $template_measurements = $unserialized_data;
                    echo "✅ PHP-Serialized-Array erfolgreich geparst\n";
                } else {
                    echo "❌ Auch PHP-Serialized-Array-Parsing fehlgeschlagen\n";
                }
            } else {
                echo "❌ Unserialize-Funktion nicht verfügbar\n";
            }
        }
    }
    
    if (empty($template_measurements) || !is_array($template_measurements)) {
        echo "❌ Keine Template-Messungen gefunden oder geparst\n";
        return array();
    }
    
    echo "✅ Template-Messungen erfolgreich geladen\n";
    echo "📊 Anzahl Views: " . count($template_measurements) . "\n";
    
    // Extrahiere alle Messungen aus allen Views
    $measurements = array();
    foreach ($template_measurements as $view_id => $view_data) {
        if (isset($view_data['measurements']) && is_array($view_data['measurements'])) {
            foreach ($view_data['measurements'] as $measurement) {
                $measurements[] = $measurement;
            }
        }
    }
    
    echo "📊 Messungen aus Views extrahiert: " . count($measurements) . "\n\n";
    
    if (empty($measurements)) {
        echo "❌ Keine Messungen in Views gefunden\n";
        return array();
    }
    
    // Simuliere Produktdimensionen
    $product_dimensions = array(
        's' => array('chest' => 90, 'height_from_shoulder' => 60),
        'm' => array('chest' => 96, 'height_from_shoulder' => 64),
        'l' => array('chest' => 102, 'height_from_shoulder' => 68),
        'xl' => array('chest' => 108, 'height_from_shoulder' => 72)
    );
    
    // Generiere Skalierungsfaktoren
    $scale_factors = array();
    foreach ($measurements as $measurement) {
        $measurement_type = $measurement['type'] ?? $measurement['measurement_type'] ?? 'unknown';
        $template_pixel_distance = floatval($measurement['pixel_distance'] ?? 0);
        $template_real_distance_cm = floatval($measurement['real_distance_cm'] ?? 0);
        
        echo "🔍 Verarbeite Messung: {$measurement_type} - {$template_pixel_distance}px = {$template_real_distance_cm}cm\n";
        
        if ($template_pixel_distance <= 0 || $template_real_distance_cm <= 0) {
            echo "⚠️ Überspringe ungültige Messung: {$measurement_type}\n";
            continue;
        }
        
        // Berechne Skalierungsfaktor
        if (isset($product_dimensions[$size_name][$measurement_type])) {
            $size_specific_factor = 1.0; // Vereinfachte Berechnung für den Test
            
            $scale_factors[$measurement_type] = array(
                'template_pixel_distance' => $template_pixel_distance,
                'template_real_distance_cm' => $template_real_distance_cm,
                'size_specific_factor' => $size_specific_factor,
                'size_name' => $size_name,
                'calculation_method' => 'php_serialized_array_support',
                'debug_info' => array(
                    'measurement_type' => $measurement_type,
                    'parsing_method' => 'unserialize',
                    'calculation_timestamp' => date('Y-m-d H:i:s')
                )
            );
            
            echo "🎯 Skalierungsfaktor für {$measurement_type}: {$size_specific_factor}x\n";
        } else {
            echo "⚠️ Keine Produktdimensionen für {$measurement_type} in Größe {$size_name}\n";
        }
    }
    
    echo "\n✅ Erfolgreich " . count($scale_factors) . " Skalierungsfaktoren generiert\n";
    echo "📊 Verfügbare Faktoren: " . implode(', ', array_keys($scale_factors)) . "\n";
    
    return $scale_factors;
}

// Teste die neue Funktionalität
echo "=== TEST DER PHP-SERIALIZED-ARRAY-UNTERSTÜTZUNG ===\n\n";

$scale_factors = test_generate_size_scale_factors_with_php_serialized(3657, 's');

if (!empty($scale_factors)) {
    echo "\n🎯 GENERIERTE SKALIERUNGSFAKTOREN:\n";
    foreach ($scale_factors as $type => $factor_data) {
        echo "   {$type}: {$factor_data['size_specific_factor']}x\n";
        echo "     Pixel-Distanz: {$factor_data['template_pixel_distance']}px\n";
        echo "     Echte Distanz: {$factor_data['template_real_distance_cm']}cm\n";
        echo "     Berechnungsmethode: {$factor_data['calculation_method']}\n";
    }
} else {
    echo "\n❌ Keine Skalierungsfaktoren generiert\n";
}

echo "\n🎯 PHP-SERIALIZED-ARRAY-UNTERSTÜTZUNG TEST ABGESCHLOSSEN!\n";
?>
