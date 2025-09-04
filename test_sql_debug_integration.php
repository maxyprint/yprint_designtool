<?php
/**
 * Test der SQL-Debug-Integration im Test-Button
 * 
 * Simuliert die neue SQL-Debug-Funktionalität die direkt in den Test-Button eingebaut wurde
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
                    return array(
                        '189542' => array(
                            'measurements' => array(
                                array(
                                    'type' => 'height_from_shoulder',
                                    'pixel_distance' => 154.0,
                                    'real_distance_cm' => 60.0
                                )
                            )
                        ),
                        '679311' => array(
                            'measurements' => array(
                                array(
                                    'type' => 'chest',
                                    'pixel_distance' => 200.0,
                                    'real_distance_cm' => 90.0
                                )
                            )
                        )
                    );
                
                default:
                    return false;
            }
        }
        return false;
    }
}

if (!function_exists('get_post')) {
    function get_post($post_id) {
        if ($post_id == 3657) {
            return (object) array(
                'ID' => 3657,
                'post_title' => 'Shirt SS25',
                'post_type' => 'design_template',
                'post_status' => 'publish'
            );
        }
        return false;
    }
}

// Simuliere die erweiterte Admin-Klasse mit SQL-Debug
class Mock_Octo_Print_Designer_Admin_With_SQL_Debug {
    
    private function perform_design_size_calculation_test($template_id, $test_size, $test_position) {
        $result = array();
        $result[] = "=== YPRINT DESIGN-GRÖSSENBERECHNUNG TEST ===";
        $result[] = "Template ID: {$template_id}";
        $result[] = "Test Größe: {$test_size}";
        $result[] = "Test Position: {$test_position}";
        $result[] = "";
        
        // SCHRITT 1: Template-Daten abrufen
        $result[] = "📋 SCHRITT 1: Template-Daten abrufen";
        $result[] = "----------------------------------------";
        
        $template_post = get_post($template_id);
        if (!$template_post) {
            $result[] = "❌ Template nicht gefunden!";
            return implode("\n", $result);
        }
        
        $result[] = "✅ Template gefunden: " . $template_post->post_title;
        
        // SCHRITT 2: Produktdimensionen abrufen
        $result[] = "";
        $result[] = "📏 SCHRITT 2: Produktdimensionen abrufen";
        $result[] = "----------------------------------------";
        
        $product_dimensions = get_post_meta($template_id, '_product_dimensions', true);
        if (empty($product_dimensions)) {
            $result[] = "❌ Keine Produktdimensionen gefunden!";
            $result[] = "   Fallback: Verwende Standard-Dimensionen";
            $product_dimensions = array(
                's' => array('chest' => 90, 'height_from_shoulder' => 60),
                'm' => array('chest' => 96, 'height_from_shoulder' => 64),
                'l' => array('chest' => 102, 'height_from_shoulder' => 68),
                'xl' => array('chest' => 108, 'height_from_shoulder' => 72)
            );
        }
        
        $result[] = "✅ Produktdimensionen gefunden:";
        foreach ($product_dimensions as $size => $dimensions) {
            $result[] = "   {$size}: " . json_encode($dimensions);
        }
        
        // SCHRITT 3: Template-Messungen abrufen
        $result[] = "";
        $result[] = "🎯 SCHRITT 3: Template-Messungen abrufen";
        $result[] = "----------------------------------------";
        
        $template_measurements = get_post_meta($template_id, '_template_view_print_areas', true);
        if (empty($template_measurements)) {
            $result[] = "❌ Keine Template-Messungen gefunden!";
            $result[] = "   Fallback: Verwende Standard-Skalierungsfaktoren";
        } else {
            $result[] = "✅ Template-Messungen gefunden:";
            foreach ($template_measurements as $view_id => $view_data) {
                if (isset($view_data['measurements'])) {
                    $result[] = "   View {$view_id}: " . count($view_data['measurements']) . " Messungen";
                    foreach ($view_data['measurements'] as $index => $measurement) {
                        $result[] = "     Messung {$index}: " . ($measurement['type'] ?? $measurement['measurement_type'] ?? 'unknown');
                        if (isset($measurement['size_scale_factors'])) {
                            $result[] = "       Skalierungsfaktoren: " . json_encode($measurement['size_scale_factors']);
                        }
                    }
                }
            }
        }
        
        // SCHRITT 3.5: ECHTE DATENBANK-ABFRAGE - SQL-Debug (SIMULIERT)
        $result[] = "";
        $result[] = "🗄️ SCHRITT 3.5: ECHTE DATENBANK-ABFRAGE - SQL-Debug";
        $result[] = "----------------------------------------";
        
        // Simuliere die SQL-Abfrage-Ergebnisse
        $result[] = "📊 Alle Meta-Daten für Template {$template_id}:";
        
        // Simuliere Meta-Daten aus der Datenbank
        $simulated_meta_data = array(
            array(
                'meta_key' => '_product_dimensions',
                'meta_value' => json_encode($product_dimensions),
                'value_length' => strlen(json_encode($product_dimensions))
            ),
            array(
                'meta_key' => '_template_view_print_areas',
                'meta_value' => json_encode($template_measurements),
                'value_length' => strlen(json_encode($template_measurements))
            ),
            array(
                'meta_key' => '_edit_last',
                'meta_value' => '1',
                'value_length' => 1
            )
        );
        
        foreach ($simulated_meta_data as $meta) {
            $meta_key = $meta['meta_key'];
            $meta_value = $meta['meta_value'];
            $value_length = $meta['value_length'];
            
            $result[] = "   Meta-Key: {$meta_key}";
            $result[] = "     Länge: {$value_length} Zeichen";
            
            // Zeige Preview für wichtige Meta-Keys
            if (in_array($meta_key, array('_product_dimensions', '_template_product_dimensions', '_template_view_print_areas'))) {
                if (!empty($meta_value)) {
                    $preview = substr($meta_value, 0, 200);
                    $result[] = "     Preview: {$preview}...";
                    
                    // Prüfe JSON-Validität
                    $json_data = json_decode($meta_value, true);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        $result[] = "     JSON: ✅ Gültig";
                        if (is_array($json_data)) {
                            $result[] = "     Typ: Array mit " . count($json_data) . " Elementen";
                        }
                    } else {
                        $result[] = "     JSON: ❌ Fehler: " . json_last_error_msg();
                    }
                } else {
                    $result[] = "     Wert: Leer";
                }
            }
            $result[] = "";
        }
        
        // 2. Spezifische Analyse der kritischen Meta-Keys
        $result[] = "🔍 Spezifische Analyse der kritischen Meta-Keys:";
        
        // Produktdimensionen
        $product_dimensions_meta = json_encode($product_dimensions);
        if ($product_dimensions_meta) {
            $result[] = "   ✅ _product_dimensions gefunden";
            $result[] = "     Länge: " . strlen($product_dimensions_meta) . " Zeichen";
            $result[] = "     Preview: " . substr($product_dimensions_meta, 0, 150) . "...";
        } else {
            $result[] = "   ❌ _product_dimensions NICHT gefunden";
        }
        
        // Template View Print Areas
        $template_measurements_meta = json_encode($template_measurements);
        if ($template_measurements_meta) {
            $result[] = "   ✅ _template_view_print_areas gefunden";
            $result[] = "     Länge: " . strlen($template_measurements_meta) . " Zeichen";
            $result[] = "     Preview: " . substr($template_measurements_meta, 0, 150) . "...";
            
            // Prüfe JSON-Struktur
            $json_data = json_decode($template_measurements_meta, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($json_data)) {
                $result[] = "     JSON-Struktur: ✅ Gültig";
                $result[] = "     Anzahl Views: " . count($json_data);
                
                foreach ($json_data as $view_id => $view_data) {
                    if (is_array($view_data) && isset($view_data['measurements'])) {
                        $result[] = "       View {$view_id}: " . count($view_data['measurements']) . " Messungen";
                    } else {
                        $result[] = "       View {$view_id}: ❌ Keine Messungen";
                    }
                }
            } else {
                $result[] = "     JSON-Struktur: ❌ Fehler: " . json_last_error_msg();
            }
        } else {
            $result[] = "   ❌ _template_view_print_areas NICHT gefunden";
        }
        
        // 3. Prüfe ob die Daten mit der reparierten Funktion kompatibel sind
        $result[] = "";
        $result[] = "🧪 Kompatibilitäts-Test mit reparierter Funktion:";
        
        if ($template_measurements_meta) {
            $json_data = json_decode($template_measurements_meta, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($json_data)) {
                $result[] = "   ✅ JSON-Daten sind gültig";
                
                // Extrahiere alle Messungen
                $all_measurements = array();
                foreach ($json_data as $view_id => $view_data) {
                    if (is_array($view_data) && isset($view_data['measurements']) && is_array($view_data['measurements'])) {
                        foreach ($view_data['measurements'] as $measurement) {
                            $all_measurements[] = $measurement;
                        }
                    }
                }
                
                $result[] = "   📊 Gesamtanzahl Messungen: " . count($all_measurements);
                
                if (!empty($all_measurements)) {
                    foreach ($all_measurements as $index => $measurement) {
                        $result[] = "     Messung {$index}:";
                        $result[] = "       Verfügbare Felder: " . implode(', ', array_keys($measurement));
                        
                        // Prüfe kritische Felder
                        $type = isset($measurement['type']) ? $measurement['type'] : 'NULL';
                        $pixel_distance = isset($measurement['pixel_distance']) ? $measurement['pixel_distance'] : 'NULL';
                        $real_distance_cm = isset($measurement['real_distance_cm']) ? $measurement['real_distance_cm'] : 'NULL';
                        
                        $result[] = "       type: {$type}";
                        $result[] = "       pixel_distance: {$pixel_distance}";
                        $result[] = "       real_distance_cm: {$real_distance_cm}";
                        
                        // Prüfe ob die Messung für die reparierte Funktion gültig ist
                        $is_valid = ($type !== 'NULL' && $pixel_distance !== 'NULL' && $real_distance_cm !== 'NULL' && 
                                   floatval($pixel_distance) > 0 && floatval($real_distance_cm) > 0);
                        
                        $result[] = "       Gültig für reparierte Funktion: " . ($is_valid ? '✅ Ja' : '❌ Nein');
                    }
                } else {
                    $result[] = "   ❌ Keine Messungen in der JSON-Struktur gefunden";
                }
            } else {
                $result[] = "   ❌ JSON-Daten sind ungültig: " . json_last_error_msg();
            }
        } else {
            $result[] = "   ❌ Kann JSON-Daten nicht analysieren";
        }
        
        // SCHRITT 4: Größenspezifische Messungen berechnen
        $result[] = "";
        $result[] = "🔍 SCHRITT 4: Größenspezifische Messungen für '{$test_size}'";
        $result[] = "----------------------------------------";
        
        $size_measurements = array();
        if (isset($product_dimensions[$test_size])) {
            $size_measurements = $product_dimensions[$test_size];
            $result[] = "✅ Größenspezifische Messungen gefunden:";
            foreach ($size_measurements as $type => $value) {
                $result[] = "   {$type}: {$value} cm";
            }
        } else {
            $result[] = "❌ Keine Messungen für Größe '{$test_size}' gefunden!";
            $size_measurements = reset($product_dimensions) ?: array();
        }
        
        // SCHRITT 5: Skalierungsfaktor berechnen (REPARIERT!)
        $result[] = "";
        $result[] = "⚖️ SCHRITT 5: Skalierungsfaktor berechnen";
        $result[] = "----------------------------------------";
        
        $scale_factor = 1.0; // Fallback
        $scale_factors_generated = false;
        
        // ✅ NEU: Verwende die reparierte generate_size_scale_factors Funktion
        global $octo_print_api_integration;
        
        // ✅ NEU: Lade API-Integration falls nicht verfügbar
        if (!isset($octo_print_api_integration)) {
            if (class_exists('Octo_Print_API_Integration')) {
                $octo_print_api_integration = Octo_Print_API_Integration::get_instance();
                $result[] = "🔧 API-Integration geladen: " . get_class($octo_print_api_integration);
            } else {
                $result[] = "⚠️ Reparierte Funktion nicht verfügbar";
            }
        }
        
        if (isset($octo_print_api_integration) && method_exists($octo_print_api_integration, 'generate_size_scale_factors')) {
            $result[] = "🧮 Verwende reparierte generate_size_scale_factors Funktion...";
            
            try {
                $generated_scale_factors = $octo_print_api_integration->generate_size_scale_factors($template_id, $test_size);
                
                if (!empty($generated_scale_factors)) {
                    $result[] = "✅ Skalierungsfaktoren erfolgreich generiert:";
                    foreach ($generated_scale_factors as $measurement_type => $factor_data) {
                        $result[] = "   {$measurement_type}: {$factor_data['size_specific_factor']}x";
                    }
                    
                    // Verwende den ersten verfügbaren Skalierungsfaktor
                    $first_factor = reset($generated_scale_factors);
                    $scale_factor = $first_factor['size_specific_factor'];
                    $scale_factors_generated = true;
                    
                    $result[] = "✅ Aktiver Skalierungsfaktor: {$scale_factor}x";
                    $result[] = "   Quelle: Reparierte Funktion (Messung: {$first_factor['measurement_type']})";
                } else {
                    $result[] = "⚠️ Reparierte Funktion generierte keine Skalierungsfaktoren";
                }
            } catch (Exception $e) {
                $result[] = "❌ Fehler in reparierter Funktion: " . $e->getMessage();
            }
        } else {
            $result[] = "⚠️ Reparierte Funktion nicht verfügbar";
        }
        
        // Fallback: Versuche gespeicherte Skalierungsfaktoren zu lesen
        if (!$scale_factors_generated && !empty($template_measurements)) {
            $result[] = "🔄 Fallback: Versuche gespeicherte Skalierungsfaktoren zu lesen...";
            
            foreach ($template_measurements as $view_id => $view_data) {
                if (isset($view_data['measurements'])) {
                    foreach ($view_data['measurements'] as $measurement) {
                        if (isset($measurement['size_scale_factors']) && isset($measurement['size_scale_factors'][$test_size])) {
                            $scale_factor = floatval($measurement['size_scale_factors'][$test_size]);
                            $result[] = "✅ Skalierungsfaktor aus gespeicherten Daten: {$scale_factor}";
                            $result[] = "   Quelle: Messung '{$measurement['measurement_type']}' in View '{$view_id}'";
                            break 2;
                        }
                    }
                }
            }
        }
        
        if ($scale_factor == 1.0 && !$scale_factors_generated) {
            $result[] = "⚠️ Kein spezifischer Skalierungsfaktor gefunden, verwende Fallback: {$scale_factor}";
        }
        
        // SCHRITT 6: Physische Dimensionen berechnen
        $result[] = "";
        $result[] = "📐 SCHRITT 6: Physische Dimensionen berechnen";
        $result[] = "----------------------------------------";
        
        $physical_width_cm = $size_measurements['chest'] ?? 30;
        $physical_height_cm = $size_measurements['height_from_shoulder'] ?? 40;
        
        $result[] = "✅ Physische Dimensionen:";
        $result[] = "   Breite: {$physical_width_cm} cm";
        $result[] = "   Höhe: {$physical_height_cm} cm";
        
        // SCHRITT 7: Test-Koordinaten umrechnen
        $result[] = "";
        $result[] = "🎨 SCHRITT 7: Test-Koordinaten umrechnen";
        $result[] = "----------------------------------------";
        
        $test_canvas_x = 100;
        $test_canvas_y = 150;
        
        $canvas_config = array(
            'width' => 800,
            'height' => 600,
            'print_area_width_mm' => 200,
            'print_area_height_mm' => 250
        );
        
        $pixel_to_mm_x = $canvas_config['print_area_width_mm'] / $canvas_config['width'];
        $pixel_to_mm_y = $canvas_config['print_area_height_mm'] / $canvas_config['height'];
        
        $offset_x_mm = round($test_canvas_x * $pixel_to_mm_x * $scale_factor, 1);
        $offset_y_mm = round($test_canvas_y * $pixel_to_mm_y * $scale_factor, 1);
        
        $result[] = "✅ Koordinaten-Umrechnung:";
        $result[] = "   Canvas: ({$test_canvas_x}, {$test_canvas_y}) px";
        $result[] = "   Print: ({$offset_x_mm}, {$offset_y_mm}) mm";
        $result[] = "   Skalierungsfaktor: {$scale_factor}";
        
        // ENDERGEBNIS
        $result[] = "";
        $result[] = "🎯 ENDERGEBNIS";
        $result[] = "----------------------------------------";
        $result[] = "Template: " . $template_post->post_title;
        $result[] = "Größe: {$test_size}";
        $result[] = "Position: {$test_position}";
        $result[] = "Physische Dimensionen: {$physical_width_cm} x {$physical_height_cm} cm";
        $result[] = "Skalierungsfaktor: {$scale_factor}";
        $result[] = "Test-Koordinaten: ({$offset_x_mm}, {$offset_y_mm}) mm";
        $result[] = "";
        $result[] = "✅ Test erfolgreich abgeschlossen!";
        
        return implode("\n", $result);
    }
    
    public function test_integration($template_id, $test_size, $test_position) {
        return $this->perform_design_size_calculation_test($template_id, $test_size, $test_position);
    }
}

// Teste die SQL-Debug-Integration
echo "=== TEST DER SQL-DEBUG-INTEGRATION IM TEST-BUTTON ===\n\n";

// Erstelle Admin-Instanz und teste
$admin = new Mock_Octo_Print_Designer_Admin_With_SQL_Debug();
$test_result = $admin->test_integration(3657, 's', 'front');

echo $test_result;

echo "\n🎯 SQL-DEBUG-INTEGRATION TEST ABGESCHLOSSEN!\n";
?>
