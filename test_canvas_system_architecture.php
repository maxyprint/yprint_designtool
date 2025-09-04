<?php
/**
 * YPrint Canvas-System Architektur Test
 * 
 * Testet die neue Canvas-Kontextualisierung und relative Koordinaten-System
 * 
 * @since 1.0.0
 */

// WordPress Umgebung laden
require_once(dirname(__FILE__) . '/../../../wp-config.php');

class YPrint_Canvas_System_Test {
    
    private $test_template_id = 3657;
    private $api_integration;
    
    public function __construct() {
        global $octo_print_api_integration;
        $this->api_integration = $octo_print_api_integration;
    }
    
    public function run_all_tests() {
        echo "=== YPRINT CANVAS-SYSTEM ARCHITEKTUR TEST ===\n";
        echo "Datum: " . date('Y-m-d H:i:s') . "\n";
        echo "Template ID: " . $this->test_template_id . "\n\n";
        
        // Test 1: Canvas-Kontextualisierung
        $this->test_canvas_contextualization();
        
        // Test 2: Koordinaten-Normalisierung
        $this->test_coordinate_normalization();
        
        // Test 3: Master-Measurement System
        $this->test_master_measurement_system();
        
        // Test 4: Zweistufige Skalierung
        $this->test_two_stage_scaling();
        
        // Test 5: Device-Responsiveness
        $this->test_device_responsiveness();
        
        // Test 6: Canvas-System Integration
        $this->test_canvas_system_integration();
        
        echo "\n=== TEST ABGESCHLOSSEN ===\n";
    }
    
    private function test_canvas_contextualization() {
        echo "📱 TEST 1: Canvas-Kontextualisierung\n";
        echo "=====================================\n";
        
        // Test verschiedene Canvas-Größen
        $test_canvases = array(
            array('width' => 1200, 'height' => 900, 'device' => 'Desktop'),
            array('width' => 768, 'height' => 576, 'device' => 'Tablet'),
            array('width' => 320, 'height' => 240, 'device' => 'Mobile')
        );
        
        foreach ($test_canvases as $canvas) {
            echo "🎯 Teste {$canvas['device']}-Canvas: {$canvas['width']}x{$canvas['height']}\n";
            
            if ($this->api_integration) {
                $result = $this->api_integration->store_design_canvas_context(
                    $this->test_template_id, 
                    $canvas['width'], 
                    $canvas['height']
                );
                
                echo "   Speicher-Ergebnis: " . ($result ? "✅ Erfolgreich" : "❌ Fehlgeschlagen") . "\n";
                
                // Validiere gespeicherten Kontext
                $validation = $this->api_integration->validate_canvas_context($this->test_template_id);
                echo "   Validation: " . ($validation['is_valid'] ? "✅ Valid" : "❌ Invalid") . "\n";
                echo "   Gespeicherte Dimensionen: " . 
                     ($validation['context_data']['design_canvas_width'] ?? 'N/A') . "x" . 
                     ($validation['context_data']['design_canvas_height'] ?? 'N/A') . "\n";
            } else {
                echo "   ❌ API-Integration nicht verfügbar\n";
            }
            echo "\n";
        }
    }
    
    private function test_coordinate_normalization() {
        echo "📐 TEST 2: Koordinaten-Normalisierung\n";
        echo "====================================\n";
        
        // Test-Koordinaten für verschiedene Canvas-Größen
        $test_coordinates = array(
            array('x' => 100, 'y' => 150),
            array('x' => 400, 'y' => 300),
            array('x' => 600, 'y' => 450)
        );
        
        $canvas_sizes = array(
            array('width' => 800, 'height' => 600, 'name' => 'Standard'),
            array('width' => 1200, 'height' => 900, 'name' => 'Desktop'),
            array('width' => 400, 'height' => 300, 'name' => 'Mobile')
        );
        
        foreach ($canvas_sizes as $canvas) {
            echo "🎯 Canvas: {$canvas['name']} ({$canvas['width']}x{$canvas['height']})\n";
            
            foreach ($test_coordinates as $coord) {
                if ($this->api_integration) {
                    $relative = $this->api_integration->normalize_coordinates_to_relative(
                        $coord['x'], $coord['y'], $canvas['width'], $canvas['height']
                    );
                    
                    // Teste Rück-Konvertierung
                    $back_to_pixel = $this->api_integration->denormalize_coordinates_to_pixels(
                        $relative['x'], $relative['y'], $canvas['width'], $canvas['height']
                    );
                    
                    echo "   Pixel: ({$coord['x']},{$coord['y']}) → Relativ: ({$relative['x']},{$relative['y']}) → Pixel: ({$back_to_pixel['x']},{$back_to_pixel['y']})\n";
                    
                    // Validiere Präzision
                    $precision_ok = (abs($coord['x'] - $back_to_pixel['x']) < 0.1) && 
                                   (abs($coord['y'] - $back_to_pixel['y']) < 0.1);
                    echo "   Präzision: " . ($precision_ok ? "✅ OK" : "❌ Verlust") . "\n";
                }
            }
            echo "\n";
        }
    }
    
    private function test_master_measurement_system() {
        echo "🎯 TEST 3: Master-Measurement System\n";
        echo "===================================\n";
        
        // Test Master-Measurement setzen
        if ($this->api_integration) {
            $test_measurement = array(
                'measurement_type' => 'chest',
                'relative_distance' => 0.25, // 25% der Canvas-Breite
                'physical_distance_cm' => 96 // 96cm für Größe M
            );
            
            echo "🎯 Setze Master-Measurement: {$test_measurement['measurement_type']}\n";
            echo "   Relative Distanz: {$test_measurement['relative_distance']}\n";
            echo "   Physische Distanz: {$test_measurement['physical_distance_cm']}cm\n";
            
            $result = $this->api_integration->set_master_measurement(
                $this->test_template_id,
                $test_measurement['measurement_type'],
                $test_measurement['relative_distance'],
                $test_measurement['physical_distance_cm']
            );
            
            echo "   Speicher-Ergebnis: " . ($result ? "✅ Erfolgreich" : "❌ Fehlgeschlagen") . "\n";
            
            // Validiere gespeicherte Master-Measurement
            $master_measurement = get_post_meta($this->test_template_id, '_master_measurement', true);
            if (!empty($master_measurement)) {
                echo "   ✅ Master-Measurement gespeichert:\n";
                echo "      Type: " . ($master_measurement['measurement_type'] ?? 'N/A') . "\n";
                echo "      Relative Distance: " . ($master_measurement['relative_distance'] ?? 'N/A') . "\n";
                echo "      Physical Distance: " . ($master_measurement['physical_distance_cm'] ?? 'N/A') . "cm\n";
                echo "      Pixels/CM Ratio: " . ($master_measurement['pixels_per_cm_ratio'] ?? 'N/A') . "\n";
            } else {
                echo "   ❌ Master-Measurement nicht gefunden\n";
            }
        } else {
            echo "❌ API-Integration nicht verfügbar\n";
        }
        echo "\n";
    }
    
    private function test_two_stage_scaling() {
        echo "⚖️ TEST 4: Zweistufige Skalierung\n";
        echo "================================\n";
        
        // Test-Messungsdaten
        $test_measurement = array(
            'measurement_type' => 'chest',
            'start_point' => array('x' => 100, 'y' => 150),
            'end_point' => array('x' => 300, 'y' => 150),
            'canvas_width' => 800,
            'canvas_height' => 600,
            'pixel_distance' => 200
        );
        
        $test_sizes = array('s', 'm', 'l', 'xl');
        
        echo "🎯 Test-Messung: chest, Pixel-Distanz: 200px auf 800x600 Canvas\n\n";
        
        foreach ($test_sizes as $size) {
            echo "🎯 Teste Größe: {$size}\n";
            
            if ($this->api_integration) {
                $scaled_measurement = $this->api_integration->convert_measurement_with_two_stage_scaling(
                    $test_measurement, 
                    $this->test_template_id, 
                    $size
                );
                
                echo "   Relative Start: (" . 
                     ($scaled_measurement['relative_start_point']['x'] ?? 'N/A') . "," . 
                     ($scaled_measurement['relative_start_point']['y'] ?? 'N/A') . ")\n";
                echo "   Relative End: (" . 
                     ($scaled_measurement['relative_end_point']['x'] ?? 'N/A') . "," . 
                     ($scaled_measurement['relative_end_point']['y'] ?? 'N/A') . ")\n";
                echo "   Relative Distance: " . ($scaled_measurement['relative_distance'] ?? 'N/A') . "\n";
                echo "   Physical Distance: " . ($scaled_measurement['physical_distance_cm'] ?? 'N/A') . "cm\n";
                echo "   Size Adjustment: " . ($scaled_measurement['size_adjustment_factor'] ?? 'N/A') . "\n";
            } else {
                echo "   ❌ API-Integration nicht verfügbar\n";
            }
            echo "\n";
        }
    }
    
    private function test_device_responsiveness() {
        echo "📱 TEST 5: Device-Responsiveness\n";
        echo "===============================\n";
        
        // Simuliere gleiche Messung auf verschiedenen Devices
        $base_measurement = array(
            'relative_start_point' => array('x' => 0.125, 'y' => 0.25), // 12.5%, 25%
            'relative_end_point' => array('x' => 0.375, 'y' => 0.25),   // 37.5%, 25%
            'relative_distance' => 0.25 // 25% der Canvas-Breite
        );
        
        $devices = array(
            array('name' => 'Desktop', 'width' => 1200, 'height' => 900),
            array('name' => 'Tablet', 'width' => 768, 'height' => 576),
            array('name' => 'Mobile', 'width' => 320, 'height' => 240)
        );
        
        echo "🎯 Basis-Messung (relativ): Start (0.125, 0.25), End (0.375, 0.25), Distance: 0.25\n\n";
        
        foreach ($devices as $device) {
            echo "🎯 {$device['name']}: {$device['width']}x{$device['height']}\n";
            
            if ($this->api_integration) {
                $start_pixel = $this->api_integration->denormalize_coordinates_to_pixels(
                    $base_measurement['relative_start_point']['x'],
                    $base_measurement['relative_start_point']['y'],
                    $device['width'],
                    $device['height']
                );
                
                $end_pixel = $this->api_integration->denormalize_coordinates_to_pixels(
                    $base_measurement['relative_end_point']['x'],
                    $base_measurement['relative_end_point']['y'],
                    $device['width'],
                    $device['height']
                );
                
                $pixel_distance = sqrt(
                    pow($end_pixel['x'] - $start_pixel['x'], 2) + 
                    pow($end_pixel['y'] - $start_pixel['y'], 2)
                );
                
                echo "   Pixel Start: ({$start_pixel['x']}, {$start_pixel['y']})\n";
                echo "   Pixel End: ({$end_pixel['x']}, {$end_pixel['y']})\n";
                echo "   Pixel Distance: " . round($pixel_distance, 2) . "px\n";
                echo "   Expected Distance: " . ($device['width'] * 0.25) . "px\n";
                
                $accuracy = abs($pixel_distance - ($device['width'] * 0.25)) < 1;
                echo "   Genauigkeit: " . ($accuracy ? "✅ OK" : "❌ Abweichung") . "\n";
            } else {
                echo "   ❌ API-Integration nicht verfügbar\n";
            }
            echo "\n";
        }
    }
    
    private function test_canvas_system_integration() {
        echo "🔗 TEST 6: Canvas-System Integration\n";
        echo "===================================\n";
        
        if ($this->api_integration) {
            // Test Canvas-System Debug
            $debug_info = $this->api_integration->debug_canvas_system($this->test_template_id, 800, 600);
            
            echo "🎯 Canvas-System Debug-Info:\n";
            echo "   Template ID: " . ($debug_info['template_id'] ?? 'N/A') . "\n";
            echo "   Canvas Context Valid: " . ($debug_info['canvas_context']['is_valid'] ? 'Ja' : 'Nein') . "\n";
            echo "   Master Measurement Exists: " . ($debug_info['master_measurement']['exists'] ? 'Ja' : 'Nein') . "\n";
            echo "   Total Views: " . ($debug_info['measurements']['total_views'] ?? 0) . "\n";
            
            if (isset($debug_info['canvas_scaling'])) {
                $scaling = $debug_info['canvas_scaling'];
                echo "   Canvas Scaling Ratio: {$scaling['width_ratio']}x{$scaling['height_ratio']}\n";
                echo "   Design Canvas: {$scaling['design_canvas']['width']}x{$scaling['design_canvas']['height']}\n";
                echo "   Current Canvas: {$scaling['current_canvas']['width']}x{$scaling['current_canvas']['height']}\n";
            }
            
            if (!empty($debug_info['measurements']['views'])) {
                echo "   View-Messungen:\n";
                foreach ($debug_info['measurements']['views'] as $view_id => $count) {
                    echo "      View {$view_id}: {$count} Messungen\n";
                }
            }
            
            // Test Messungen für Display laden
            echo "\n🎯 Teste Messungen für Display laden:\n";
            $display_measurements = $this->api_integration->load_measurements_for_display(
                $this->test_template_id, 800, 600
            );
            
            echo "   Display Measurements Views: " . count($display_measurements) . "\n";
            foreach ($display_measurements as $view_id => $view_data) {
                $count = count($view_data['measurements'] ?? array());
                echo "      View {$view_id}: {$count} Display-Messungen\n";
                
                // Prüfe erste Messung auf Display-Koordinaten
                if (!empty($view_data['measurements'][0])) {
                    $first_measurement = $view_data['measurements'][0];
                    if (isset($first_measurement['display_start_point'])) {
                        echo "         Display Start: ({$first_measurement['display_start_point']['x']}, {$first_measurement['display_start_point']['y']})\n";
                        echo "         Display End: ({$first_measurement['display_end_point']['x']}, {$first_measurement['display_end_point']['y']})\n";
                    }
                }
            }
            
        } else {
            echo "❌ API-Integration nicht verfügbar\n";
        }
        echo "\n";
    }
    
    private function test_coordinate_precision() {
        echo "🔍 ZUSATZTEST: Koordinaten-Präzision\n";
        echo "===================================\n";
        
        if (!$this->api_integration) {
            echo "❌ API-Integration nicht verfügbar\n";
            return;
        }
        
        // Test extreme Präzision
        $precision_tests = array(
            array('x' => 1.5, 'y' => 2.7),
            array('x' => 799.9, 'y' => 599.1),
            array('x' => 0.1, 'y' => 0.1)
        );
        
        foreach ($precision_tests as $test) {
            $relative = $this->api_integration->normalize_coordinates_to_relative(
                $test['x'], $test['y'], 800, 600
            );
            
            $back_to_pixel = $this->api_integration->denormalize_coordinates_to_pixels(
                $relative['x'], $relative['y'], 800, 600
            );
            
            $x_diff = abs($test['x'] - $back_to_pixel['x']);
            $y_diff = abs($test['y'] - $back_to_pixel['y']);
            
            echo "   Original: ({$test['x']}, {$test['y']}) → Zurück: ({$back_to_pixel['x']}, {$back_to_pixel['y']})\n";
            echo "   Abweichung: X={$x_diff}, Y={$y_diff} " . 
                 (($x_diff < 0.1 && $y_diff < 0.1) ? "✅ OK" : "❌ Zu hoch") . "\n\n";
        }
    }
    
    private function test_size_adjustment_factors() {
        echo "📏 ZUSATZTEST: Größen-Anpassungsfaktoren\n";
        echo "=======================================\n";
        
        if (!$this->api_integration) {
            echo "❌ API-Integration nicht verfügbar\n";
            return;
        }
        
        // Teste Größen-Anpassung für verschiedene Messungstypen
        $measurement_types = array('chest', 'height_from_shoulder');
        $sizes = array('s', 'm', 'l', 'xl');
        
        foreach ($measurement_types as $type) {
            echo "🎯 Messungstyp: {$type}\n";
            
            foreach ($sizes as $size) {
                // Verwende Reflection um private Methode zu testen
                $reflection = new ReflectionClass($this->api_integration);
                $method = $reflection->getMethod('get_size_adjustment_factor');
                $method->setAccessible(true);
                
                $adjustment_factor = $method->invoke(
                    $this->api_integration, 
                    $this->test_template_id, 
                    $size, 
                    $type
                );
                
                echo "   Größe {$size}: Faktor {$adjustment_factor}\n";
            }
            echo "\n";
        }
    }
    
    public function run_comprehensive_test() {
        $this->run_all_tests();
        $this->test_coordinate_precision();
        $this->test_size_adjustment_factors();
    }
}

// Test ausführen
try {
    $test = new YPrint_Canvas_System_Test();
    $test->run_comprehensive_test();
} catch (Exception $e) {
    echo "❌ TEST FEHLER: " . $e->getMessage() . "\n";
    echo "Stack Trace: " . $e->getTraceAsString() . "\n";
}
?>
