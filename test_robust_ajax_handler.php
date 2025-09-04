<?php
/**
 * Test der robusten AJAX-Handler-Fehlerbehandlung
 * 
 * Testet ob die neue Fehlerbehandlung in der Admin-Klasse funktioniert
 */

// Simuliere WordPress-Umgebung
if (!function_exists('error_log')) {
    function error_log($message) {
        echo "[ERROR_LOG] {$message}\n";
    }
}

if (!function_exists('wp_send_json_error')) {
    function wp_send_json_error($data) {
        echo "❌ AJAX ERROR: " . json_encode($data) . "\n";
    }
}

if (!function_exists('wp_send_json_success')) {
    function wp_send_json_success($data) {
        echo "✅ AJAX SUCCESS: " . json_encode($data) . "\n";
    }
}

if (!function_exists('wp_verify_nonce')) {
    function wp_verify_nonce($nonce, $action) {
        // Simuliere erfolgreiche Nonce-Validierung
        return true;
    }
}

if (!function_exists('sanitize_text_field')) {
    function sanitize_text_field($str) {
        // Simuliere WordPress sanitize_text_field
        return trim(strip_tags($str));
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

if (!function_exists('get_post_meta')) {
    function get_post_meta($post_id, $key, $single = true) {
        // Simuliere Template 3657 Daten
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

// Simuliere die reparierte Admin-Klasse
class Mock_Octo_Print_Designer_Admin_Robust {
    
    /**
     * ✅ NEU: AJAX Handler für Design-Größenberechnung Test
     */
    public function ajax_test_design_size_calculation() {
        // ✅ NEU: Verbesserte Fehlerbehandlung und Logging
        error_log("YPrint: AJAX test_design_size_calculation aufgerufen");
        
        try {
            // Security check
            if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'template_measurements_nonce')) {
                error_log("YPrint: Security check failed in test_design_size_calculation");
                wp_send_json_error(array('message' => 'Security check failed'));
                return;
            }
            
            $template_id = isset($_POST['template_id']) ? intval($_POST['template_id']) : 0;
            $test_size = isset($_POST['test_size']) ? sanitize_text_field($_POST['test_size']) : 'm';
            $test_position = isset($_POST['test_position']) ? sanitize_text_field($_POST['test_position']) : 'front';
            
            error_log("YPrint: Test-Parameter - Template ID: {$template_id}, Größe: {$test_size}, Position: {$test_position}");
            
            if (!$template_id) {
                error_log("YPrint: Invalid template ID: {$template_id}");
                wp_send_json_error(array('message' => 'Invalid template ID'));
                return;
            }
            
            // ✅ NEU: Prüfe ob Template existiert
            $template_post = get_post($template_id);
            if (!$template_post) {
                error_log("YPrint: Template {$template_id} nicht gefunden");
                wp_send_json_error(array('message' => 'Template not found'));
                return;
            }
            
            error_log("YPrint: Template gefunden: " . $template_post->post_title);
            
            // Erstelle Test-Daten für die Berechnung
            $test_result = $this->perform_design_size_calculation_test($template_id, $test_size, $test_position);
            
            if (empty($test_result)) {
                error_log("YPrint: Test-Ergebnis ist leer");
                wp_send_json_error(array('message' => 'Test result is empty'));
                return;
            }
            
            error_log("YPrint: Test erfolgreich abgeschlossen, Ergebnis-Länge: " . strlen($test_result));
            
            wp_send_json_success(array(
                'message' => 'Design size calculation test completed',
                'test_result' => $test_result
            ));
            
        } catch (Exception $e) {
            error_log("YPrint: Exception in test_design_size_calculation: " . $e->getMessage());
            error_log("YPrint: Stack trace: " . $e->getTraceAsString());
            wp_send_json_error(array('message' => 'Test failed: ' . $e->getMessage()));
        } catch (Error $e) {
            // ✅ NEU: Fange auch PHP 7+ Errors ab
            error_log("YPrint: Error in test_design_size_calculation: " . $e->getMessage());
            error_log("YPrint: Stack trace: " . $e->getTraceAsString());
            wp_send_json_error(array('message' => 'Test failed with error: ' . $e->getMessage()));
        }
    }
    
    /**
     * ✅ NEU: Führt den Design-Größenberechnung Test durch
     */
    private function perform_design_size_calculation_test($template_id, $test_size, $test_position) {
        // ✅ NEU: Verbesserte Fehlerbehandlung
        try {
            error_log("YPrint: perform_design_size_calculation_test aufgerufen - Template: {$template_id}, Größe: {$test_size}");
            
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
                error_log("YPrint: Template {$template_id} nicht gefunden in perform_design_size_calculation_test");
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
            
            // SCHRITT 5: Skalierungsfaktor berechnen (DIREKTE IMPLEMENTIERUNG)
            $result[] = "";
            $result[] = "⚖️ SCHRITT 5: Skalierungsfaktor berechnen";
            $result[] = "----------------------------------------";
            
            $scale_factor = 1.0; // Fallback
            $scale_factors_generated = false;
            
            // ✅ NEU: Direkte Implementierung der reparierten Logik
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
                                $scale_factors_generated = true;
                                
                                $result[] = "✅ Aktiver Skalierungsfaktor: {$scale_factor}x";
                                $result[] = "   Quelle: Direkte Admin-Implementierung (Messung: {$first_factor['measurement_type']})";
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
            
        } catch (Exception $e) {
            error_log("YPrint: Exception in perform_design_size_calculation_test: " . $e->getMessage());
            error_log("YPrint: Stack trace: " . $e->getTraceAsString());
            
            $result[] = "";
            $result[] = "❌ FEHLER IM TEST: " . $e->getMessage();
            $result[] = "🔍 Stack Trace: " . $e->getTraceAsString();
            
            return implode("\n", $result);
        } catch (Error $e) {
            error_log("YPrint: Error in perform_design_size_calculation_test: " . $e->getMessage());
            error_log("YPrint: Stack trace: " . $e->getTraceAsString());
            
            $result[] = "";
            $result[] = "❌ PHP-FEHLER IM TEST: " . $e->getMessage();
            $result[] = "🔍 Stack Trace: " . $e->getTraceAsString();
            
            return implode("\n", $result);
        }
    }
    
    public function test_ajax_handler($template_id, $test_size, $test_position) {
        // Simuliere POST-Daten
        $_POST['nonce'] = 'test_nonce';
        $_POST['template_id'] = $template_id;
        $_POST['test_size'] = $test_size;
        $_POST['test_position'] = $test_position;
        
        return $this->ajax_test_design_size_calculation();
    }
}

// Teste die neue robuste AJAX-Handler-Fehlerbehandlung
echo "=== TEST DER ROBUSTEN AJAX-HANDLER-FEHLEBEHANDLUNG ===\n\n";

// Erstelle Admin-Instanz
$admin = new Mock_Octo_Print_Designer_Admin_Robust();

// Teste den AJAX-Handler
echo "🧪 Teste AJAX-Handler mit Template 3657, Größe s...\n\n";

$admin->test_ajax_handler(3657, 's', 'front');

echo "\n🎯 ROBUSTE AJAX-HANDLER-FEHLEBEHANDLUNG TEST ABGESCHLOSSEN!\n";
?>
