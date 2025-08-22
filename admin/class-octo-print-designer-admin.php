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
        
        // Zusätzlich: Instanz-basierte Registrierung für Kompatibilität
        $this->template_manager->init_ajax_handlers();
        
        error_log("YPrint: AJAX handlers registered successfully");
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
        
        // Template Measurements JavaScript
        wp_enqueue_script('octo-template-measurements', plugins_url('js/template-measurements.js', __FILE__), array('jquery'), rand(), true);
        
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