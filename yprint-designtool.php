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
        // Core files
        // require_once YPRINT_DESIGNTOOL_PLUGIN_DIR . 'includes/class-yprint-vectorizer.php';
        // require_once YPRINT_DESIGNTOOL_PLUGIN_DIR . 'includes/class-yprint-svg-handler.php';
        // require_once YPRINT_DESIGNTOOL_PLUGIN_DIR . 'includes/class-yprint-exporter.php';
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
        // In future phases, we'll initialize modules here
        // $this->vectorizer = new YPrint_Vectorizer();
        // $this->svg_handler = new YPrint_SVG_Handler();
        // $this->exporter = new YPrint_Exporter();
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
        // We'll only enqueue these when needed
        // This will be expanded in future phases
    }

    /**
     * Plugin activation
     */
    public function activate() {
        // Activation tasks go here
        flush_rewrite_rules();
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