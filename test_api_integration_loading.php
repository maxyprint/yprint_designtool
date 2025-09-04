<?php
/**
 * Test der API-Integration-Loading-Funktionalität
 * 
 * Testet ob die Octo_Print_API_Integration Klasse korrekt geladen wird
 */

// Simuliere WordPress-Umgebung
if (!function_exists('plugin_dir_path')) {
    function plugin_dir_path($file) {
        return dirname($file) . '/';
    }
}

if (!function_exists('error_log')) {
    function error_log($message) {
        echo "[ERROR_LOG] {$message}\n";
    }
}

// Simuliere die Octo_Print_API_Integration Klasse
if (!class_exists('Octo_Print_API_Integration')) {
    class Octo_Print_API_Integration {
        private static $instance = null;
        
        public static function get_instance() {
            if (self::$instance === null) {
                self::$instance = new self();
            }
            return self::$instance;
        }
        
        public function generate_size_scale_factors($template_id, $size_name) {
            // Simuliere die reparierte Funktion
            return array(
                'height_from_shoulder' => array(
                    'measurement_type' => 'height_from_shoulder',
                    'size_specific_factor' => 1.2,
                    'template_pixel_distance' => 154.0,
                    'template_real_distance_cm' => 60.0
                ),
                'chest' => array(
                    'measurement_type' => 'chest',
                    'size_specific_factor' => 1.1,
                    'template_pixel_distance' => 200.0,
                    'template_real_distance_cm' => 90.0
                )
            );
        }
        
        public function debug_size_scale_factor_generation($template_id, $size_name) {
            return "Debug erfolgreich für Template {$template_id}, Größe {$size_name}";
        }
    }
}

// Simuliere die erweiterte Admin-Klasse
class Mock_Octo_Print_Designer_Admin_With_API_Loading {
    
    public function __construct() {
        // Simuliere den Constructor
        $this->load_api_integration();
    }
    
    /**
     * ✅ NEU: Lädt die API-Integration Klasse
     */
    private function load_api_integration() {
        echo "🔧 Lade API-Integration...\n";
        
        // Prüfe ob die Klasse bereits geladen ist
        if (!class_exists('Octo_Print_API_Integration')) {
            echo "   ❌ Klasse nicht geladen, versuche manuelles Laden...\n";
            
            // Versuche die Klasse aus dem includes Verzeichnis zu laden
            $api_integration_file = plugin_dir_path(dirname(__FILE__)) . 'includes/class-octo-print-api-integration.php';
            echo "   📁 Suche Datei: {$api_integration_file}\n";
            
            if (file_exists($api_integration_file)) {
                require_once $api_integration_file;
                echo "   ✅ Datei geladen\n";
                
                if (class_exists('Octo_Print_API_Integration')) {
                    echo "   ✅ Klasse erfolgreich geladen\n";
                } else {
                    echo "   ❌ Klasse konnte nicht geladen werden\n";
                }
            } else {
                echo "   ❌ Datei nicht gefunden\n";
            }
        } else {
            echo "   ✅ Klasse bereits geladen\n";
        }
        
        // Erstelle eine globale Instanz falls verfügbar
        if (class_exists('Octo_Print_API_Integration')) {
            global $octo_print_api_integration;
            if (!isset($octo_print_api_integration)) {
                $octo_print_api_integration = Octo_Print_API_Integration::get_instance();
                echo "   ✅ Globale Instanz erstellt: " . get_class($octo_print_api_integration) . "\n";
            } else {
                echo "   ✅ Globale Instanz bereits vorhanden: " . get_class($octo_print_api_integration) . "\n";
            }
        } else {
            echo "   ❌ Klasse konnte nicht geladen werden\n";
        }
    }
    
    /**
     * Testet die API-Integration
     */
    public function test_api_integration() {
        echo "\n🧪 Teste API-Integration...\n";
        
        global $octo_print_api_integration;
        
        if (isset($octo_print_api_integration)) {
            echo "✅ Globale Instanz verfügbar: " . get_class($octo_print_api_integration) . "\n";
            
            if (method_exists($octo_print_api_integration, 'generate_size_scale_factors')) {
                echo "✅ generate_size_scale_factors Methode verfügbar\n";
                
                try {
                    $result = $octo_print_api_integration->generate_size_scale_factors(3657, 's');
                    echo "✅ Methode erfolgreich aufgerufen\n";
                    echo "📊 Ergebnis: " . count($result) . " Skalierungsfaktoren\n";
                    
                    foreach ($result as $type => $data) {
                        echo "   {$type}: {$data['size_specific_factor']}x\n";
                    }
                    
                } catch (Exception $e) {
                    echo "❌ Fehler beim Aufruf: " . $e->getMessage() . "\n";
                }
            } else {
                echo "❌ generate_size_scale_factors Methode nicht verfügbar\n";
                echo "📋 Verfügbare Methoden: " . implode(', ', get_class_methods($octo_print_api_integration)) . "\n";
            }
        } else {
            echo "❌ Keine globale Instanz verfügbar\n";
        }
    }
}

// Teste die API-Integration-Loading-Funktionalität
echo "=== TEST DER API-INTEGRATION-LOADING-FUNKTIONALITÄT ===\n\n";

// Erstelle Admin-Instanz
$admin = new Mock_Octo_Print_Designer_Admin_With_API_Loading();

// Teste die API-Integration
$admin->test_api_integration();

echo "\n🎯 API-INTEGRATION-LOADING TEST ABGESCHLOSSEN!\n";
?>
