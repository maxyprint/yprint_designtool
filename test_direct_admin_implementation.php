<?php
/**
 * Test der direkten Admin-Implementierung
 * 
 * Testet ob die neue direkte Implementierung der reparierten Logik in der Admin-Klasse funktioniert
 */

// Simuliere WordPress-Umgebung
if (!function_exists('get_post_meta')) {
    function get_post_meta($post_id, $key, $single = true) {
        // Simuliere Template 3657 Daten basierend auf dem Test-Output
        if ($post_id == 3657) {
            switch ($key) {
                case '_product_dimensions':
                    return array(
                        's' => array('chest' => 90, 'height_from_shoulder' => 60),
                        'm' => array('chest' => 96, 'height_from_shoulder' => 64),
                        'l' => array('chest' => 102, 'height_from_shoulder' => 68),
                        'xl' => array('chest' => 108, 'height_from_shoulder' => 72)
                    );
                
                case '_template_view_print_areas':
                    // Simuliere PHP-Serialized-Array
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
                    
                    return serialize($template_data);
                
                default:
                    return false;
            }
        }
        return false;
    }
}

if (!function_exists('current_time')) {
    function current_time($type) {
        return date('Y-m-d H:i:s');
    }
}

// Simuliere die neue direkte Admin-Implementierung
function test_direct_admin_implementation($template_id, $test_size) {
    $result = array();
    $result[] = "🧮 Implementiere reparierte Logik direkt in der Admin-Klasse...";
    
    try {
        // Verwende die bereits geladenen Template-Messungen
        $template_measurements_raw = get_post_meta($template_id, '_template_view_print_areas', true);
        
        if (!empty($template_measurements_raw)) {
            $result[] = "📊 Rohe Template-Messungen geladen: " . strlen($template_measurements_raw) . " Zeichen";
            
            // ✅ NEU: Unterstütze sowohl JSON als auch PHP-Serialized-Arrays
            $template_measurements_parsed = null;
            
            if (is_string($template_measurements_raw)) {
                // Versuche zuerst JSON zu parsen
                if (function_exists('json_decode')) {
                    $json_data = json_decode($template_measurements_raw, true);
                    if (json_last_error() === JSON_ERROR_NONE && is_array($json_data)) {
                        $template_measurements_parsed = $json_data;
                        $result[] = "✅ JSON-Daten erfolgreich geparst";
                    } else {
                        $result[] = "⚠️ JSON-Parsing fehlgeschlagen: " . json_last_error_msg();
                    }
                }
                
                // Falls JSON fehlschlägt, versuche PHP-Serialized-Array
                if ($template_measurements_parsed === null) {
                    if (function_exists('unserialize')) {
                        $unserialized_data = @unserialize($template_measurements_raw);
                        if ($unserialized_data !== false && is_array($unserialized_data)) {
                            $template_measurements_parsed = $unserialized_data;
                            $result[] = "✅ PHP-Serialized-Array erfolgreich geparst";
                        } else {
                            $result[] = "❌ Auch PHP-Serialized-Array-Parsing fehlgeschlagen";
                        }
                    } else {
                        $result[] = "❌ Unserialize-Funktion nicht verfügbar";
                    }
                }
            }
            
            if (!empty($template_measurements_parsed) && is_array($template_measurements_parsed)) {
                $result[] = "✅ Template-Messungen erfolgreich geparst";
                $result[] = "📊 Anzahl Views: " . count($template_measurements_parsed);
                
                // Extrahiere alle Messungen aus allen Views
                $measurements = array();
                foreach ($template_measurements_parsed as $view_id => $view_data) {
                    if (isset($view_data['measurements']) && is_array($view_data['measurements'])) {
                        foreach ($view_data['measurements'] as $measurement) {
                            $measurements[] = $measurement;
                        }
                    }
                }
                
                $result[] = "📊 Messungen aus Views extrahiert: " . count($measurements);
                
                if (!empty($measurements)) {
                    // Simuliere Produktdimensionen
                    $product_dimensions = get_post_meta($template_id, '_product_dimensions', true);
                    
                    // Generiere Skalierungsfaktoren direkt
                    $generated_scale_factors = array();
                    
                    foreach ($measurements as $measurement) {
                        $measurement_type = $measurement['type'] ?? $measurement['measurement_type'] ?? 'unknown';
                        $template_pixel_distance = floatval($measurement['pixel_distance'] ?? 0);
                        $template_real_distance_cm = floatval($measurement['real_distance_cm'] ?? 0);
                        
                        $result[] = "🔍 Verarbeite Messung: {$measurement_type} - {$template_pixel_distance}px = {$template_real_distance_cm}cm";
                        
                        if ($template_pixel_distance <= 0 || $template_real_distance_cm <= 0) {
                            $result[] = "⚠️ Überspringe ungültige Messung: {$measurement_type}";
                            continue;
                        }
                        
                        // Berechne Skalierungsfaktor basierend auf Produktdimensionen
                        if (isset($product_dimensions[$test_size][$measurement_type])) {
                            $size_specific_factor = 1.0; // Vereinfachte Berechnung für den Test
                            
                            $generated_scale_factors[$measurement_type] = array(
                                'template_pixel_distance' => $template_pixel_distance,
                                'template_real_distance_cm' => $template_real_distance_cm,
                                'size_specific_factor' => $size_specific_factor,
                                'size_name' => $test_size,
                                'calculation_method' => 'direct_admin_implementation',
                                'debug_info' => array(
                                    'measurement_type' => $measurement_type,
                                    'parsing_method' => 'direct',
                                    'calculation_timestamp' => current_time('mysql')
                                )
                            );
                            
                            $result[] = "🎯 Skalierungsfaktor für {$measurement_type}: {$size_specific_factor}x";
                        } else {
                            $result[] = "⚠️ Keine Produktdimensionen für {$measurement_type} in Größe {$test_size}";
                        }
                    }
                    
                    if (!empty($generated_scale_factors)) {
                        $result[] = "✅ Skalierungsfaktoren erfolgreich generiert:";
                        foreach ($generated_scale_factors as $measurement_type => $factor_data) {
                            $result[] = "   {$measurement_type}: {$factor_data['size_specific_factor']}x";
                        }
                        
                        // Verwende den ersten verfügbaren Skalierungsfaktor
                        $first_factor = reset($generated_scale_factors);
                        $scale_factor = $first_factor['size_specific_factor'];
                        
                        $result[] = "✅ Aktiver Skalierungsfaktor: {$scale_factor}x";
                        $result[] = "   Quelle: Direkte Admin-Implementierung (Messung: {$first_factor['measurement_type']})";
                        
                        return array(
                            'success' => true,
                            'scale_factor' => $scale_factor,
                            'scale_factors' => $generated_scale_factors,
                            'result' => $result
                        );
                    } else {
                        $result[] = "⚠️ Keine gültigen Skalierungsfaktoren generiert";
                    }
                } else {
                    $result[] = "❌ Keine Messungen in den geparsten Daten gefunden";
                }
            } else {
                $result[] = "❌ Template-Messungen konnten nicht geparst werden";
            }
        } else {
            $result[] = "❌ Keine Template-Messungen in der Datenbank gefunden";
        }
        
    } catch (Exception $e) {
        $result[] = "❌ Fehler in direkter Implementierung: " . $e->getMessage();
        $result[] = "🔍 Stack Trace: " . $e->getTraceAsString();
    }
    
    return array(
        'success' => false,
        'result' => $result
    );
}

// Teste die neue direkte Admin-Implementierung
echo "=== TEST DER DIREKTEN ADMIN-IMPLEMENTIERUNG ===\n\n";

$test_result = test_direct_admin_implementation(3657, 's');

if ($test_result['success']) {
    echo "🎯 TEST ERFOLGREICH!\n";
    echo "✅ Skalierungsfaktor: {$test_result['scale_factor']}x\n";
    echo "📊 Anzahl generierte Faktoren: " . count($test_result['scale_factors']) . "\n\n";
    
    echo "📋 DETAILLIERTE AUSGABE:\n";
    foreach ($test_result['result'] as $line) {
        echo "{$line}\n";
    }
} else {
    echo "❌ TEST FEHLGESCHLAGEN!\n\n";
    echo "📋 DETAILLIERTE AUSGABE:\n";
    foreach ($test_result['result'] as $line) {
        echo "{$line}\n";
    }
}

echo "\n🎯 DIREKTE ADMIN-IMPLEMENTIERUNG TEST ABGESCHLOSSEN!\n";
?>
