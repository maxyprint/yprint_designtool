<?php
class Octo_Print_Designer_Admin {
    private $plugin_name;
    private $version;
    private $template_manager;

    public function __construct($plugin_name, $version) {
        $this->plugin_name = $plugin_name;
        $this->version = $version;
        
        $this->template_manager = new Octo_Print_Designer_Template();

        $this->define_hooks();
    }

    private function define_hooks() {
        
        Octo_Print_Designer_Loader::$instance->add_action('admin_enqueue_scripts', $this, 'enqueue_styles');
        Octo_Print_Designer_Loader::$instance->add_action('admin_enqueue_scripts', $this, 'enqueue_scripts');
        Octo_Print_Designer_Loader::$instance->add_action('init', $this->template_manager, 'register_post_type');
        Octo_Print_Designer_Loader::$instance->add_action('add_meta_boxes', $this->template_manager, 'add_meta_boxes');
        Octo_Print_Designer_Loader::$instance->add_action('save_post_design_template', $this->template_manager, 'save_post');
        Octo_Print_Designer_Loader::$instance->add_action('wp_ajax_get_template_variations', $this->template_manager, 'get_variations');
        Octo_Print_Designer_Loader::$instance->add_action('wp_ajax_get_template_sizes', $this->template_manager, 'get_sizes');
        
        // ✅ AJAX handlers for measurement types - frühe Registrierung über init Hook
        Octo_Print_Designer_Loader::$instance->add_action('init', $this, 'register_measurement_ajax_handlers');
    
    }
    
    /**
     * Registriert AJAX handlers für Messungstypen
     */
    public function register_measurement_ajax_handlers() {
        // Debug: Bestätige dass Handler registriert wird
        error_log("YPrint: Registering AJAX handlers for measurement types");
        
        add_action('wp_ajax_get_available_measurement_types', array('Octo_Print_Designer_Template', 'ajax_get_available_measurement_types_static'));
        add_action('wp_ajax_nopriv_get_available_measurement_types', array('Octo_Print_Designer_Template', 'ajax_get_available_measurement_types_static'));
        
        // ✅ NEU: AJAX handler für das Speichern von Messungen in der Datenbank
        add_action('wp_ajax_save_measurement_to_database', array('Octo_Print_Designer_Template', 'ajax_save_measurement_to_database_static'));
        add_action('wp_ajax_nopriv_save_measurement_to_database', array('Octo_Print_Designer_Template', 'ajax_save_measurement_to_database_static'));
        
        // ✅ NEU: AJAX handler für das Laden von gespeicherten Messungen
        add_action('wp_ajax_load_saved_measurements', array('Octo_Print_Designer_Template', 'ajax_load_saved_measurements_static'));
        add_action('wp_ajax_nopriv_load_saved_measurements', array('Octo_Print_Designer_Template', 'ajax_load_saved_measurements_static'));
        
        // ✅ NEU: AJAX handler für das Löschen von Messungen aus der Datenbank
        add_action('wp_ajax_delete_measurement_from_database', array('Octo_Print_Designer_Template', 'ajax_delete_measurement_from_database_static'));
        add_action('wp_ajax_nopriv_delete_measurement_from_database', array('Octo_Print_Designer_Template', 'ajax_delete_measurement_from_database_static'));
        
        // ✅ NEU: AJAX handler für Design-Größenberechnung Test
        add_action('wp_ajax_test_design_size_calculation', array($this, 'ajax_test_design_size_calculation'));
        add_action('wp_ajax_nopriv_test_design_size_calculation', array($this, 'ajax_test_design_size_calculation'));
        
        // Zusätzlich: Instanz-basierte Registrierung für Kompatibilität
        $this->template_manager->init_ajax_handlers();
        
        error_log("YPrint: AJAX handlers registered successfully");
    }
    
    /**
     * ✅ NEU: AJAX Handler für Design-Größenberechnung Test
     */
    public function ajax_test_design_size_calculation() {
        // Security check
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'template_measurements_nonce')) {
            wp_send_json_error(array('message' => 'Security check failed'));
        }
        
        $template_id = isset($_POST['template_id']) ? intval($_POST['template_id']) : 0;
        $test_size = isset($_POST['test_size']) ? sanitize_text_field($_POST['test_size']) : 'm';
        $test_position = isset($_POST['test_position']) ? sanitize_text_field($_POST['test_position']) : 'front';
        
        if (!$template_id) {
            wp_send_json_error(array('message' => 'Invalid template ID'));
        }
        
        try {
            // Erstelle Test-Daten für die Berechnung
            $test_result = $this->perform_design_size_calculation_test($template_id, $test_size, $test_position);
            
            wp_send_json_success(array(
                'message' => 'Design size calculation test completed',
                'test_result' => $test_result
            ));
            
        } catch (Exception $e) {
            wp_send_json_error(array('message' => 'Test failed: ' . $e->getMessage()));
        }
    }
    
    /**
     * ✅ NEU: Führt den Design-Größenberechnung Test durch
     */
    private function perform_design_size_calculation_test($template_id, $test_size, $test_position) {
        $result = array();
        $result[] = "=== YPRINT DESIGN-GRÖSSENBERECHNUNG TEST ===";
        $result[] = "Template ID: {$template_id}";
        $result[] = "Test Größe: {$test_size}";
        $result[] = "Test Position: {$test_position}";
        $result[] = "";
        
        // **SCHRITT 1: Template-Daten abrufen**
        $result[] = "📋 SCHRITT 1: Template-Daten abrufen";
        $result[] = "----------------------------------------";
        
        $template_post = get_post($template_id);
        if (!$template_post) {
            $result[] = "❌ Template nicht gefunden!";
            return implode("\n", $result);
        }
        
        $result[] = "✅ Template gefunden: " . $template_post->post_title;
        
        // **SCHRITT 2: Produktdimensionen abrufen**
        $result[] = "";
        $result[] = "📏 SCHRITT 2: Produktdimensionen abrufen";
        $result[] = "----------------------------------------";
        
        $product_dimensions = get_post_meta($template_id, '_template_product_dimensions', true);
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
        
        // **SCHRITT 3: Template-Messungen abrufen**
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
                        $result[] = "     Messung {$index}: " . $measurement['measurement_type'];
                        if (isset($measurement['size_scale_factors'])) {
                            $result[] = "       Skalierungsfaktoren: " . json_encode($measurement['size_scale_factors']);
                        }
                    }
                }
            }
        }
        
        // **SCHRITT 4: Größenspezifische Messungen berechnen**
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
            $result[] = "   Verwende erste verfügbare Größe...";
            $size_measurements = reset($product_dimensions) ?: array();
        }
        
        // **SCHRITT 5: Skalierungsfaktor berechnen**
        $result[] = "";
        $result[] = "⚖️ SCHRITT 5: Skalierungsfaktor berechnen";
        $result[] = "----------------------------------------";
        
        $scale_factor = 1.0; // Fallback
        if (!empty($template_measurements)) {
            foreach ($template_measurements as $view_id => $view_data) {
                if (isset($view_data['measurements'])) {
                    foreach ($view_data['measurements'] as $measurement) {
                        if (isset($measurement['size_scale_factors']) && isset($measurement['size_scale_factors'][$test_size])) {
                            $scale_factor = floatval($measurement['size_scale_factors'][$test_size]);
                            $result[] = "✅ Skalierungsfaktor gefunden: {$scale_factor}";
                            $result[] = "   Quelle: Messung '{$measurement['measurement_type']}' in View '{$view_id}'";
                            break 2;
                        }
                    }
                }
            }
        }
        
        if ($scale_factor == 1.0) {
            $result[] = "⚠️ Kein spezifischer Skalierungsfaktor gefunden, verwende Fallback: {$scale_factor}";
        }
        
        // **SCHRITT 6: Physische Dimensionen berechnen**
        $result[] = "";
        $result[] = "📐 SCHRITT 6: Physische Dimensionen berechnen";
        $result[] = "----------------------------------------";
        
        $physical_width_cm = $size_measurements['chest'] ?? 30;
        $physical_height_cm = $size_measurements['height_from_shoulder'] ?? 40;
        
        $result[] = "✅ Physische Dimensionen:";
        $result[] = "   Breite: {$physical_width_cm} cm";
        $result[] = "   Höhe: {$physical_height_cm} cm";
        
        // **SCHRITT 7: Test-Koordinaten umrechnen**
        $result[] = "";
        $result[] = "🎨 SCHRITT 7: Test-Koordinaten umrechnen";
        $result[] = "----------------------------------------";
        
        // Test-Koordinaten (Pixel)
        $test_canvas_x = 100;
        $test_canvas_y = 150;
        
        // Canvas-Konfiguration
        $canvas_config = array(
            'width' => 800,
            'height' => 600,
            'print_area_width_mm' => 200,
            'print_area_height_mm' => 250
        );
        
        // Basis-Umrechnung
        $pixel_to_mm_x = $canvas_config['print_area_width_mm'] / $canvas_config['width'];
        $pixel_to_mm_y = $canvas_config['print_area_height_mm'] / $canvas_config['height'];
        
        // Mit Skalierungsfaktor
        $offset_x_mm = round($test_canvas_x * $pixel_to_mm_x * $scale_factor, 1);
        $offset_y_mm = round($test_canvas_y * $pixel_to_mm_y * $scale_factor, 1);
        
        $result[] = "✅ Koordinaten-Umrechnung:";
        $result[] = "   Canvas: ({$test_canvas_x}, {$test_canvas_y}) px";
        $result[] = "   Print: ({$offset_x_mm}, {$offset_y_mm}) mm";
        $result[] = "   Skalierungsfaktor: {$scale_factor}";
        
        // **SCHRITT 8: Endergebnis**
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

    public function enqueue_scripts($hook) {

        if (!$this->is_template_edit_page($hook)) return;

        wp_enqueue_media();
        
        wp_enqueue_script(
            'octo-print-designer-vendor',
            OCTO_PRINT_DESIGNER_URL . 'admin/js/dist/vendor.bundle.js',
            [], // no dependencies for vendor
            rand(),
            true
        );
        
        wp_enqueue_script(
            'octo-print-designer-admin',
            OCTO_PRINT_DESIGNER_URL . 'admin/js/dist/admin.bundle.js',
            ['octo-print-designer-vendor'], // vendor bundle must load first
            rand(),
            true
        );
        
        // Template Measurements JavaScript - Cache Busting
        wp_enqueue_script('octo-template-measurements', plugins_url('js/template-measurements.js', __FILE__), array('jquery'), time(), true);
        
        // AJAX Localization für Template Measurements
        wp_localize_script('octo-template-measurements', 'templateMeasurementsAjax', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('template_measurements_nonce')
        ));
        
        wp_localize_script('octo-print-designer-admin', 'octoPrintDesigner', [
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('octo_print_designer_nonce'),
            'postId' => get_the_ID()
        ]);

        // Debug-Info für Template Measurements
        wp_add_inline_script('octo-template-measurements', '
            console.log("🎯 YPrint Template Measurements Script loaded");
            console.log("DOM ready state:", document.readyState);
            console.log("templateMeasurementsAjax available:", typeof templateMeasurementsAjax !== "undefined");
            
            // Debug-Info über verfügbare Variablen
            if (typeof templateMeasurementsAjax !== "undefined") {
                console.log("✅ AJAX variables loaded:", templateMeasurementsAjax);
            } else {
                console.error("❌ templateMeasurementsAjax not available");
            }
            
            // Verbessertes DOM-Ready-Handling
            function checkAndInitializeMeasurements() {
                console.log("🔍 Checking measurement system availability...");
                
                if (typeof YPrintTemplateMeasurements !== "undefined") {
                    console.log("✅ YPrintTemplateMeasurements class available");
                    
                    // Versuche Initialisierung
                    if (!window.templateMeasurements) {
                        try {
                            window.templateMeasurements = new YPrintTemplateMeasurements();
                            console.log("✅ Template Measurements successfully initialized");
                        } catch(error) {
                            console.error("❌ Error initializing template measurements:", error);
                        }
                    }
                } else {
                    console.error("❌ YPrintTemplateMeasurements class not available");
                }
            }
            
            if (document.readyState === "loading") {
                document.addEventListener("DOMContentLoaded", function() {
                    console.log("🎯 DOM Content Loaded - checking measurements");
                    setTimeout(checkAndInitializeMeasurements, 300);
                });
            } else {
                console.log("🎯 DOM already ready - checking measurements immediately");
                setTimeout(checkAndInitializeMeasurements, 100);
            }
            
            // Additional fallback check after page fully loaded
            window.addEventListener("load", function() {
                console.log("🎯 Window fully loaded - final measurement check");
                setTimeout(function() {
                    if (!window.templateMeasurements) {
                        console.log("🔄 Attempting final initialization...");
                        checkAndInitializeMeasurements();
                    }
                }, 500);
            });
        ', 'after');

        // AJAX handlers werden jetzt im Konstruktor registriert
    }

    public function enqueue_styles($hook) {
        if (!$this->is_template_edit_page($hook)) return;

        wp_enqueue_style(
            'octo-print-designer-admin',
            plugin_dir_url(__FILE__) . 'css/octo-print-designer-admin.css',
            [],
            $this->version
        );
    }

    private function is_template_edit_page($hook) {
        if (!in_array($hook, ['post.php', 'post-new.php'])) return false;
        
        $screen = get_current_screen();
        return $screen && $screen->post_type === 'design_template';
    }
}