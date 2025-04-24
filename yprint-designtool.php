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
     *
     * @var YPrint_DesignTool
     */
    private static $instance = null;
    
    /**
     * Vectorizer instance
     *
     * @var YPrint_Vectorizer
     */
    public $vectorizer = null;
    
    /**
     * SVG Handler instance
     *
     * @var YPrint_SVG_Handler
     */
    public $svg_handler = null;
    
    /**
     * Exporter instance
     *
     * @var YPrint_Exporter
     */
    public $exporter = null;
    
    /**
     * Designer instance
     *
     * @var YPrint_Designer
     */
    public $designer = null;

    /**
     * Get singleton instance
     *
     * @return YPrint_DesignTool
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
        $this->define_constants();
        $this->includes();
        $this->init_hooks();
        $this->init_modules();
    }
    
    /**
     * Define additional constants
     */
    private function define_constants() {
        // Define upload directories
        $upload_dir = wp_upload_dir();
        define('YPRINT_DESIGNTOOL_UPLOAD_DIR', $upload_dir['basedir'] . '/yprint-designtool');
        define('YPRINT_DESIGNTOOL_UPLOAD_URL', $upload_dir['baseurl'] . '/yprint-designtool');
        
        // Define temp directories
        define('YPRINT_DESIGNTOOL_TEMP_DIR', YPRINT_DESIGNTOOL_UPLOAD_DIR . '/temp');
    }

    /**
     * Include required files
     */
    private function includes() {
        // Core files
        require_once YPRINT_DESIGNTOOL_PLUGIN_DIR . 'includes/class-yprint-utilities.php';
        
        // Add feature classes as they're developed
        if (file_exists(YPRINT_DESIGNTOOL_PLUGIN_DIR . 'includes/class-yprint-vectorizer.php')) {
            require_once YPRINT_DESIGNTOOL_PLUGIN_DIR . 'includes/class-yprint-vectorizer.php';
        }
        
        if (file_exists(YPRINT_DESIGNTOOL_PLUGIN_DIR . 'includes/class-yprint-svg-handler.php')) {
            require_once YPRINT_DESIGNTOOL_PLUGIN_DIR . 'includes/class-yprint-svg-handler.php';
        }
        
        if (file_exists(YPRINT_DESIGNTOOL_PLUGIN_DIR . 'includes/class-yprint-exporter.php')) {
            require_once YPRINT_DESIGNTOOL_PLUGIN_DIR . 'includes/class-yprint-exporter.php';
        }
        
        if (file_exists(YPRINT_DESIGNTOOL_PLUGIN_DIR . 'includes/class-yprint-designer.php')) {
            require_once YPRINT_DESIGNTOOL_PLUGIN_DIR . 'includes/class-yprint-designer.php';
        }
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
        
        // AJAX hooks
        add_action('wp_ajax_yprint_designtool_vectorize', array($this, 'ajax_vectorize_image'));
        add_action('wp_ajax_yprint_designtool_save_svg', array($this, 'ajax_save_svg'));
        add_action('wp_ajax_yprint_designtool_export', array($this, 'ajax_export_design'));
        
        // Shortcode registration
        add_shortcode('yprint_designtool', array($this, 'designtool_shortcode'));
        
        // Plugin activation and deactivation
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
    }

    /**
     * Initialize modules
     */
    private function init_modules() {
        // Create upload directories if they don't exist
        $this->create_upload_directories();
        
        // Initialize modules if their classes exist
        if (class_exists('YPrint_Vectorizer')) {
            $this->vectorizer = new YPrint_Vectorizer();
        }
        
        if (class_exists('YPrint_SVG_Handler')) {
            $this->svg_handler = new YPrint_SVG_Handler();
        }
        
        if (class_exists('YPrint_Exporter')) {
            $this->exporter = new YPrint_Exporter();
        }
        
        if (class_exists('YPrint_Designer')) {
            $this->designer = new YPrint_Designer();
        }
    }
    
    /**
     * Create upload directories
     */
    private function create_upload_directories() {
        // Create main upload directory
        if (!file_exists(YPRINT_DESIGNTOOL_UPLOAD_DIR)) {
            wp_mkdir_p(YPRINT_DESIGNTOOL_UPLOAD_DIR);
            // Create .htaccess to protect files
            file_put_contents(YPRINT_DESIGNTOOL_UPLOAD_DIR . '/.htaccess', 'Options -Indexes');
        }
        
        // Create temp directory
        if (!file_exists(YPRINT_DESIGNTOOL_TEMP_DIR)) {
            wp_mkdir_p(YPRINT_DESIGNTOOL_TEMP_DIR);
            // Deny direct access to temp files
            file_put_contents(YPRINT_DESIGNTOOL_TEMP_DIR . '/.htaccess', 'deny from all');
        }
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
        
        // Add submenu pages
        add_submenu_page(
            'yprint-designtool',
            __('Einstellungen', 'yprint-designtool'),
            __('Einstellungen', 'yprint-designtool'),
            'manage_options',
            'yprint-designtool-settings',
            array($this, 'settings_page')
        );
    }

    /**
     * Admin page callback
     */
    public function admin_page() {
        // Include admin page template
        include YPRINT_DESIGNTOOL_PLUGIN_DIR . 'templates/admin-page.php';
    }
    
    /**
     * Settings page callback
     */
    public function settings_page() {
        // Include settings page template
        include YPRINT_DESIGNTOOL_PLUGIN_DIR . 'templates/settings-page.php';
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
        
        // Localize script for JavaScript access to PHP variables
        wp_localize_script(
            'yprint-designtool-admin',
            'yprintDesigntool',
            array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('yprint_designtool_nonce'),
                'plugin_url' => YPRINT_DESIGNTOOL_PLUGIN_URL,
                'upload_url' => YPRINT_DESIGNTOOL_UPLOAD_URL,
                'max_upload_size' => wp_max_upload_size(),
                'i18n' => array(
                    'error' => __('Fehler', 'yprint-designtool'),
                    'success' => __('Erfolg', 'yprint-designtool'),
                    'uploading' => __('Wird hochgeladen...', 'yprint-designtool'),
                    'processing' => __('Wird verarbeitet...', 'yprint-designtool'),
                ),
            )
        );
    }

    /**
     * Enqueue frontend scripts and styles
     */
    public function enqueue_frontend_scripts() {
        // Only enqueue scripts when the shortcode is used
        // We'll use a flag set by the shortcode
        global $yprint_designtool_shortcode_used;
        
        if (isset($yprint_designtool_shortcode_used) && $yprint_designtool_shortcode_used) {
            // Frontend CSS
            wp_enqueue_style(
                'yprint-designtool-frontend',
                YPRINT_DESIGNTOOL_PLUGIN_URL . 'assets/css/frontend.css',
                array(),
                YPRINT_DESIGNTOOL_VERSION
            );
            
            // Frontend JS
            wp_enqueue_script(
                'yprint-designtool-frontend',
                YPRINT_DESIGNTOOL_PLUGIN_URL . 'assets/js/frontend.js',
                array('jquery'),
                YPRINT_DESIGNTOOL_VERSION,
                true
            );
            
            // Localize script for JavaScript access to PHP variables
            wp_localize_script(
                'yprint-designtool-frontend',
                'yprintDesigntool',
                array(
                    'ajax_url' => admin_url('admin-ajax.php'),
                    'nonce' => wp_create_nonce('yprint_designtool_nonce'),
                    'plugin_url' => YPRINT_DESIGNTOOL_PLUGIN_URL,
                    'max_upload_size' => wp_max_upload_size(),
                )
            );
        }
    }
    
    /**
     * AJAX handler for vectorizing images
     */
    public function ajax_vectorize_image() {
        // Verify nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'yprint_designtool_nonce')) {
            wp_send_json_error(__('Sicherheitsüberprüfung fehlgeschlagen.', 'yprint-designtool'));
        }
        
        // Check if vectorizer is available
        if (!$this->vectorizer) {
            wp_send_json_error(__('Vektorisierer ist nicht verfügbar.', 'yprint-designtool'));
        }
        
        // Check if a file was uploaded
        if (empty($_FILES['image'])) {
            wp_send_json_error(__('Keine Datei hochgeladen.', 'yprint-designtool'));
        }
        
        // Process vectorization (placeholder - will be implemented when vectorizer module is added)
        $result = array(
            'success' => true,
            'message' => __('Vektorisierung erfolgreich (Platzhalter)', 'yprint-designtool'),
            'svg' => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#007bff"/></svg>',
        );
        
        wp_send_json_success($result);
    }
    
    /**
     * AJAX handler for saving SVG
     */
    public function ajax_save_svg() {
        // Verify nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'yprint_designtool_nonce')) {
            wp_send_json_error(__('Sicherheitsüberprüfung fehlgeschlagen.', 'yprint-designtool'));
        }
        
        // Check if SVG handler is available
        if (!$this->svg_handler) {
            wp_send_json_error(__('SVG-Handler ist nicht verfügbar.', 'yprint-designtool'));
        }
        
        // Check if SVG content was provided
        if (empty($_POST['svg_content'])) {
            wp_send_json_error(__('Kein SVG-Inhalt angegeben.', 'yprint-designtool'));
        }
        
        // Process SVG saving (placeholder - will be implemented when SVG handler module is added)
        $result = array(
            'success' => true,
            'message' => __('SVG erfolgreich gespeichert (Platzhalter)', 'yprint-designtool'),
            'url' => YPRINT_DESIGNTOOL_UPLOAD_URL . '/example.svg',
        );
        
        wp_send_json_success($result);
    }
    
    /**
     * AJAX handler for exporting design
     */
    public function ajax_export_design() {
        // Verify nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'yprint_designtool_nonce')) {
            wp_send_json_error(__('Sicherheitsüberprüfung fehlgeschlagen.', 'yprint-designtool'));
        }
        
        // Check if exporter is available
        if (!$this->exporter) {
            wp_send_json_error(__('Exporter ist nicht verfügbar.', 'yprint-designtool'));
        }
        
        // Process export (placeholder - will be implemented when exporter module is added)
        $result = array(
            'success' => true,
            'message' => __('Design erfolgreich exportiert (Platzhalter)', 'yprint-designtool'),
            'url' => YPRINT_DESIGNTOOL_UPLOAD_URL . '/example.pdf',
        );
        
        wp_send_json_success($result);
    }
    
    /**
     * Shortcode for embedding the design tool
     *
     * @param array $atts Shortcode attributes
     * @return string Shortcode HTML output
     */
    public function designtool_shortcode($atts) {
        // Set flag to enqueue scripts
        global $yprint_designtool_shortcode_used;
        $yprint_designtool_shortcode_used = true;
        
        // Parse attributes
        $atts = shortcode_atts(
            array(
                'width' => '100%',
                'height' => '600px',
                'mode' => 'standard', // standard, vectorize, svg-edit
            ),
            $atts,
            'yprint_designtool'
        );
        
        // Start output buffer
        ob_start();
        
        // Include shortcode template
        include YPRINT_DESIGNTOOL_PLUGIN_DIR . 'templates/shortcode-designtool.php';
        
        // Return the buffered content
        return ob_get_clean();
    }

    /**
     * Plugin activation
     */
    public function activate() {
        // Create necessary directories
        $this->create_upload_directories();
        
        // Create default options
        $default_options = array(
            'vectorize_engine' => 'potrace',
            'max_colors' => 8,
            'svg_editor' => 'internal',
            'default_format' => 'svg',
        );
        
        // Save default options if they don't exist yet
        if (!get_option('yprint_designtool_options')) {
            update_option('yprint_designtool_options', $default_options);
        }
        
        // Flush rewrite rules
        flush_rewrite_rules();
    }

    /**
     * Plugin deactivation
     */
    public function deactivate() {
        // Clean up temp directory
        $this->cleanup_temp_directory();
        
        // Flush rewrite rules
        flush_rewrite_rules();
    }
    
    /**
     * Clean up temporary files
     */
    private function cleanup_temp_directory() {
        if (file_exists(YPRINT_DESIGNTOOL_TEMP_DIR)) {
            $files = glob(YPRINT_DESIGNTOOL_TEMP_DIR . '/*');
            
            foreach ($files as $file) {
                if (is_file($file) && basename($file) !== '.htaccess') {
                    @unlink($file);
                }
            }
        }
    }
}

/**
 * Returns the main instance of YPrint_DesignTool
 *
 * @return YPrint_DesignTool
 */
function YPrint_DesignTool() {
    return YPrint_DesignTool::instance();
}

// Initialize the plugin
YPrint_DesignTool();