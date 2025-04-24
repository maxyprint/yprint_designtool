<?php
/**
 * Plugin Name: YPrint DesignTool
 * Plugin URI: https://yprint.de/designtool
 * Description: Ein modulares Design-Tool für WordPress mit Vektorisierungs- und SVG-Bearbeitungsfunktionen
 * Version: 1.0.0
 * Author: YPrint
 * Author URI: https://yprint.de
 * Text Domain: yprint-designtool
 * Domain Path: /languages
 * Requires at least: 5.6
 * Requires PHP: 7.4
 */

// Sicherheitscheck: Direkten Zugriff auf diese Datei verhindern
if (!defined('ABSPATH')) {
    exit;
}

// Plugin-Konstanten definieren
define('YPRINT_DESIGNTOOL_VERSION', '1.0.0');
define('YPRINT_DESIGNTOOL_PATH', plugin_dir_path(__FILE__));
define('YPRINT_DESIGNTOOL_URL', plugin_dir_url(__FILE__));
define('YPRINT_DESIGNTOOL_BASENAME', plugin_basename(__FILE__));

// Erforderliche Dateien einbinden
require_once YPRINT_DESIGNTOOL_PATH . 'core/ModuleLoader.php';

// Hauptklasse des Plugins
class YPrint_DesignTool {
    // Singleton-Instanz
    private static $instance = null;
    
    // Module
    public $vectorizer = null;
    public $svg_handler = null;
    public $exporter = null;
    public $importer = null;
    public $transform = null;
    
    // AJAX-Handler
    private $vectorizer_ajax = null;
    private $svg_handler_ajax = null;
    private $exporter_ajax = null;
    private $importer_ajax = null;
    private $transform_ajax = null;
    
    // Konstruktor
    private function __construct() {
        // Hooks und Filter beim Plugin-Start registrieren
        $this->init_hooks();
        
        // Module initialisieren
        $this->init_modules();
    }

    // Singleton-Instanz abrufen
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    // Module initialisieren
    private function init_modules() {
        // Alle Module laden
        YPrint_ModuleLoader::load_modules();
        
        // Module initialisieren
        $this->vectorizer = YPrint_Vectorizer::get_instance();
        $this->svg_handler = YPrint_SVGHandler::get_instance();
        $this->exporter = YPrint_Exporter::get_instance();
        
        // Optional: Import-Modul initialisieren
        if (class_exists('YPrint_Importer')) {
            $this->importer = YPrint_Importer::get_instance();
        }
        
        // Optional: Transform-Modul initialisieren
        if (class_exists('YPrint_Transform')) {
            $this->transform = YPrint_Transform::get_instance();
        }
        
        // AJAX-Handler initialisieren
        $this->init_ajax_handlers();
    }
    
    // AJAX-Handler initialisieren
    private function init_ajax_handlers() {
        // Core AJAX-Handler
        if (class_exists('YPrint_VectorizerAjax')) {
            $this->vectorizer_ajax = new YPrint_VectorizerAjax();
        }
        
        if (class_exists('YPrint_SVGHandlerAjax')) {
            $this->svg_handler_ajax = new YPrint_SVGHandlerAjax();
        }
        
        if (class_exists('YPrint_ExporterAjax')) {
            $this->exporter_ajax = new YPrint_ExporterAjax();
        }
        
        // Optional: Import AJAX-Handler
        if (class_exists('YPrint_ImporterAjax')) {
            $this->importer_ajax = new YPrint_ImporterAjax();
        }
        
        // Optional: Transform AJAX-Handler
        if (class_exists('YPrint_TransformAjax')) {
            $this->transform_ajax = new YPrint_TransformAjax();
        }
    }

    // Initialisierung der Hooks
    private function init_hooks() {
        // Plugin aktivieren/deaktivieren Hooks
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));

        // Admin-Menü und Assets laden
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_frontend_scripts'));
        
        // Shortcodes
        add_shortcode('yprint_designtool', array($this, 'render_designtool_shortcode'));
    }

    // Plugin-Aktivierungsfunktion
    public function activate() {
        // Verzeichnisse für temporäre Dateien erstellen
        $upload_dir = wp_upload_dir();
        $designtool_dir = $upload_dir['basedir'] . '/yprint-designtool';
        
        if (!file_exists($designtool_dir)) {
            wp_mkdir_p($designtool_dir);
        }
        
        if (!file_exists($designtool_dir . '/temp')) {
            wp_mkdir_p($designtool_dir . '/temp');
        }
        
        // Standardoptionen speichern
        $default_options = array(
            'vectorization_engine' => 'potrace',
            'max_upload_size' => 5, // MB
            'default_output_format' => 'svg',
        );
        
        update_option('yprint_designtool_options', $default_options);
        
        // Rewrite-Regeln zurücksetzen
        flush_rewrite_rules();
    }

    // Plugin-Deaktivierungsfunktion
    public function deactivate() {
        // Temporäre Dateien aufräumen
        $upload_dir = wp_upload_dir();
        $temp_dir = $upload_dir['basedir'] . '/yprint-designtool/temp';
        
        if (file_exists($temp_dir)) {
            $files = glob($temp_dir . '/*');
            foreach ($files as $file) {
                if (is_file($file)) {
                    @unlink($file);
                }
            }
        }
        
        // Rewrite-Regeln zurücksetzen
        flush_rewrite_rules();
    }

    // Admin-Menü hinzufügen
    public function add_admin_menu() {
        add_menu_page(
            __('YPrint DesignTool', 'yprint-designtool'),
            __('DesignTool', 'yprint-designtool'),
            'manage_options',
            'yprint-designtool',
            array($this, 'render_admin_page'),
            'dashicons-art',
            30
        );
        
        // Untermenü für Einstellungen
        add_submenu_page(
            'yprint-designtool',
            __('Einstellungen', 'yprint-designtool'),
            __('Einstellungen', 'yprint-designtool'),
            'manage_options',
            'yprint-designtool-settings',
            array($this, 'render_settings_page')
        );
    }

    // Admin-Skripte und Styles laden
    public function enqueue_admin_scripts($hook) {
        $admin_pages = array(
            'toplevel_page_yprint-designtool',
            'designtool_page_yprint-designtool-settings'
        );
        
        if (!in_array($hook, $admin_pages)) {
            return;
        }
        
        // CSS laden
        wp_enqueue_style(
            'yprint-designtool-admin',
            YPRINT_DESIGNTOOL_URL . 'assets/css/admin.css',
            array(),
            YPRINT_DESIGNTOOL_VERSION
        );
        
        // JavaScript laden
        wp_enqueue_script(
            'yprint-designtool-admin',
            YPRINT_DESIGNTOOL_URL . 'assets/js/admin.js',
            array('jquery'),
            YPRINT_DESIGNTOOL_VERSION,
            true
        );

        // Admin-AJAX-URL für JavaScript verfügbar machen
        wp_localize_script(
            'yprint-designtool-admin',
            'yprintDesigntool',
            array(
                'ajaxUrl' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('yprint-designtool-nonce'),
                'maxUploadSize' => $this->get_max_upload_size(),
            )
        );
    }
    
    // Frontend-Skripte und Styles laden
    public function enqueue_frontend_scripts() {
        // CSS registrieren
        wp_register_style(
            'yprint-designtool',
            YPRINT_DESIGNTOOL_URL . 'assets/css/designtool.css',
            array(),
            YPRINT_DESIGNTOOL_VERSION
        );
        
        // JavaScript registrieren
        wp_register_script(
            'yprint-designtool',
            YPRINT_DESIGNTOOL_URL . 'assets/js/designtool.js',
            array('jquery'),
            YPRINT_DESIGNTOOL_VERSION,
            true
        );
    }

    // Hauptadminseite rendern
    public function render_admin_page() {
        // Admin-Template einbinden
        include YPRINT_DESIGNTOOL_PATH . 'ui/templates/admin-page.php';
    }

    // Einstellungsseite rendern
    public function render_settings_page() {
        // Einstellungstemplate einbinden
        include YPRINT_DESIGNTOOL_PATH . 'ui/templates/settings-page.php';
    }
    
    // DesignTool-Shortcode rendern
    public function render_designtool_shortcode($atts) {
        // Standardwerte für Attribute
        $atts = shortcode_atts(array(
            'width' => '100%',
            'height' => '600px',
            'mode' => 'embedded',
        ), $atts);
        
        // Scripts und Styles einbinden
        wp_enqueue_style('yprint-designtool');
        wp_enqueue_script('yprint-designtool');
        
        // AJAX-URL und Nonce für JavaScript verfügbar machen
        wp_localize_script(
            'yprint-designtool',
            'yprintDesigntool',
            array(
                'ajaxUrl' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('yprint-designtool-nonce'),
                'maxUploadSize' => $this->get_max_upload_size(),
                'pluginUrl' => YPRINT_DESIGNTOOL_URL,
            )
        );
        
        // Template für das Design-Tool laden
        ob_start();
        include YPRINT_DESIGNTOOL_PATH . 'ui/templates/designtool.php';
        return ob_get_clean();
    }
    
    // Maximale Upload-Größe abrufen (in Bytes)
    private function get_max_upload_size() {
        $options = get_option('yprint_designtool_options', array());
        $max_size_mb = isset($options['max_upload_size']) ? (int) $options['max_upload_size'] : 5;
        
        // Sicherstellen, dass die Größe zwischen 1 und 20 MB liegt
        $max_size_mb = max(1, min(20, $max_size_mb));
        
        // In Bytes umrechnen
        return $max_size_mb * 1024 * 1024;
    }
}

// Plugin-Instanz initialisieren
function yprint_designtool() {
    return YPrint_DesignTool::get_instance();
}

// Plugin starten
add_action('plugins_loaded', 'yprint_designtool');