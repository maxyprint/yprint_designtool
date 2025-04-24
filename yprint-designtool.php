<?php
/**
 * Plugin Name: YPrint DesignTool
 * Description: Ein Design-Tool für Print-on-Demand-Streetwear mit Vektorisierungs- und SVG-Bearbeitungsfunktionen.
 * Version: 1.0.0
 * Author: YPrint
 * Text Domain: yprint-designtool
 * Domain Path: /languages
 * 
 * @package YPrint_DesignTool
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('YPRINT_DESIGNTOOL_VERSION', '1.0.0');
define('YPRINT_DESIGNTOOL_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('YPRINT_DESIGNTOOL_PLUGIN_URL', plugin_dir_url(__FILE__));
define('YPRINT_DESIGNTOOL_PLUGIN_BASENAME', plugin_basename(__FILE__));

/**
 * Main Plugin Class
 */
final class YPrint_DesignTool {
    /**
     * Singleton instance
     */
    private static $instance = null;

    /**
     * Get singleton instance
     */
    public static function instance() {
        if (is_null(self::$instance)) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Constructor
     */
    private function __construct() {
        $this->includes();
        $this->init_hooks();
        $this->init_modules();
    }

 /**
 * Include required files
 */
private function includes() {
    // Lade Hilfsfunktionen
    require_once YPRINT_DESIGNTOOL_PLUGIN_DIR . 'includes/helpers.php';
    
    // Lade Shortcodes
    require_once YPRINT_DESIGNTOOL_PLUGIN_DIR . 'includes/shortcodes.php';
    
    // Lade Export-Funktionen
    require_once YPRINT_DESIGNTOOL_PLUGIN_DIR . 'includes/export.php';
}

    /**
     * Initialize hooks
     */
    private function init_hooks() {
        // Admin hooks
        add_action('admin_menu', array($this, 'register_admin_menu'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));
        
        // Frontend hooks
        add_action('wp_enqueue_scripts', array($this, 'enqueue_frontend_scripts'));
        
        // Plugin activation and deactivation
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
    }

    /**
 * Initialize modules
 */
private function init_modules() {
    // Module werden später hinzugefügt, wenn sie implementiert sind
    // Dies dient als Vorbereitung für zukünftige Module
    
    // Bereite einen Speicherort für Modulreferenzen vor
    $this->modules = new stdClass();
    
    // Hook für Drittanbieter-Erweiterungen
    do_action('yprint_designtool_init_modules', $this);
}

    /**
     * Register admin menu
     */
    public function register_admin_menu() {
        add_menu_page(
            __('YPrint DesignTool', 'yprint-designtool'),
            __('DesignTool', 'yprint-designtool'),
            'manage_options',
            'yprint-designtool',
            array($this, 'admin_page'),
            'dashicons-art',
            30
        );
    }

    /**
     * Admin page callback
     */
    public function admin_page() {
        // Simple admin page for now
        ?>
        <div class="wrap">
            <h1><?php echo esc_html__('YPrint DesignTool', 'yprint-designtool'); ?></h1>
            <p><?php echo esc_html__('Willkommen beim YPrint DesignTool! Hier werden bald die Einstellungen und Features angezeigt.', 'yprint-designtool'); ?></p>
        </div>
        <?php
    }

    /**
     * Enqueue admin scripts and styles
     */
    public function enqueue_admin_scripts($hook) {
        // Only load on plugin pages
        if (strpos($hook, 'yprint-designtool') === false) {
            return;
        }
        
        // Admin CSS
        wp_enqueue_style(
            'yprint-designtool-admin',
            YPRINT_DESIGNTOOL_PLUGIN_URL . 'assets/css/admin.css',
            array(),
            YPRINT_DESIGNTOOL_VERSION
        );
        
        // Admin JS
        wp_enqueue_script(
            'yprint-designtool-admin',
            YPRINT_DESIGNTOOL_PLUGIN_URL . 'assets/js/admin.js',
            array('jquery'),
            YPRINT_DESIGNTOOL_VERSION,
            true
        );
    }

    /**
 * Enqueue frontend scripts and styles
 */
public function enqueue_frontend_scripts() {
    // Nur laden, wenn das DesignTool aktiv ist (über Shortcode oder Template)
    if (!$this->is_designtool_active()) {
        return;
    }
    
    // Grundlegende Styles für das DesignTool
    wp_enqueue_style(
        'yprint-designtool-frontend',
        YPRINT_DESIGNTOOL_PLUGIN_URL . 'assets/css/frontend.css',
        array(),
        YPRINT_DESIGNTOOL_VERSION
    );
    
    // Grundlegendes JavaScript für das DesignTool
    wp_enqueue_script(
        'yprint-designtool-frontend',
        YPRINT_DESIGNTOOL_PLUGIN_URL . 'assets/js/frontend.js',
        array('jquery'),
        YPRINT_DESIGNTOOL_VERSION,
        true
    );
    
    // Lokalisiere das Script mit Basis-Daten
    wp_localize_script(
        'yprint-designtool-frontend',
        'yprintDesignTool',
        array(
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('yprint-designtool-nonce'),
            'pluginUrl' => YPRINT_DESIGNTOOL_PLUGIN_URL
        )
    );
}

/**
 * Prüft, ob das DesignTool auf der aktuellen Seite aktiv ist
 * 
 * @return bool True wenn das DesignTool aktiv ist
 */
private function is_designtool_active() {
    global $post;
    
    // Standardmäßig nicht aktiv
    $is_active = false;
    
    // Prüfe auf Shortcode [yprint_designtool]
    if (is_a($post, 'WP_Post') && has_shortcode($post->post_content, 'yprint_designtool')) {
        $is_active = true;
    }
    
    // Erlaube Filterung durch andere Funktionen
    return apply_filters('yprint_designtool_is_active', $is_active);
}

    /**
 * Plugin activation
 */
public function activate() {
    // Erstelle notwendige Verzeichnisse
    $this->create_plugin_directories();
    
    // Aktualisiere Rewrite-Regeln
    flush_rewrite_rules();
}

/**
 * Erstellt die notwendigen Verzeichnisse für das Plugin
 */
private function create_plugin_directories() {
    // Basisverzeichnis für Uploads
    $upload_dir = wp_upload_dir();
    $base_dir = $upload_dir['basedir'] . '/yprint-designtool';
    
    // Verzeichnisse erstellen
    $directories = array(
        $base_dir,
        $base_dir . '/temp',
        $base_dir . '/exports',
        $base_dir . '/designs',
        $base_dir . '/templates'
    );
    
    foreach ($directories as $dir) {
        if (!file_exists($dir)) {
            wp_mkdir_p($dir);
        }
    }
    
    // .htaccess-Datei für temporäre Dateien erstellen
    $htaccess_content = "# Verweigere direkten Zugriff auf Dateien
<FilesMatch \".*\">
    Order Allow,Deny
    Deny from all
</FilesMatch>";
    
    file_put_contents($base_dir . '/temp/.htaccess', $htaccess_content);
}

    /**
     * Plugin deactivation
     */
    public function deactivate() {
        // Deactivation tasks go here
        flush_rewrite_rules();
    }
}

/**
 * Returns the main instance of YPrint_DesignTool
 */
function YPrint_DesignTool() {
    return YPrint_DesignTool::instance();
}

// Initialize the plugin
YPrint_DesignTool();