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
     * Vectorizer instance
     */
    public $vectorizer = null;

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
        // Load Vectorizer class
        require_once YPRINT_DESIGNTOOL_PLUGIN_DIR . 'includes/class-yprint-vectorizer.php';
        
        // Load SVG Handler class
        require_once YPRINT_DESIGNTOOL_PLUGIN_DIR . 'includes/class-yprint-svg-handler.php';
        
        // Load helper functions
        require_once YPRINT_DESIGNTOOL_PLUGIN_DIR . 'includes/helpers.php';
        
        // Load shortcodes
        require_once YPRINT_DESIGNTOOL_PLUGIN_DIR . 'includes/shortcodes.php';
        
        // Load SVG shortcodes
        require_once YPRINT_DESIGNTOOL_PLUGIN_DIR . 'includes/svg-shortcodes';
        
        // Load export functions
        require_once YPRINT_DESIGNTOOL_PLUGIN_DIR . 'includes/export.php';
        
        // Load SVG AJAX handlers
        require_once YPRINT_DESIGNTOOL_PLUGIN_DIR . 'includes/svg-ajax.php';
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
        // Initialize Vectorizer
        $this->vectorizer = YPrint_Vectorizer::get_instance();
        
        // Initialize SVG Handler
        $this->svg_handler = YPrint_SVG_Handler::get_instance();
        
        // Prepare a container for modules
        $this->modules = new stdClass();
        
        // Hook for third-party extensions
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
        
        // Add Vectorizer submenu page
        add_submenu_page(
            'yprint-designtool',
            __('Bild Vektorisieren', 'yprint-designtool'),
            __('Vektorisierer', 'yprint-designtool'),
            'manage_options',
            'yprint-designtool-vectorizer',
            array($this, 'vectorizer_page')
        );
        
        // Add SVG Editor submenu page
        add_submenu_page(
            'yprint-designtool',
            __('SVG Editor', 'yprint-designtool'),
            __('SVG Editor', 'yprint-designtool'),
            'manage_options',
            'yprint-designtool-svg-editor',
            array($this, 'svg_editor_page')
        );
    }

    /**
     * Admin page callback
     */
    public function admin_page() {
        ?>
        <div class="wrap">
            <h1><?php echo esc_html__('YPrint DesignTool', 'yprint-designtool'); ?></h1>
            <p><?php echo esc_html__('Willkommen beim YPrint DesignTool! Hier werden bald die Einstellungen und Features angezeigt.', 'yprint-designtool'); ?></p>
            
            <div class="card">
                <h2><?php echo esc_html__('Verfügbare Tools', 'yprint-designtool'); ?></h2>
                <ul>
                    <li>
                        <a href="<?php echo admin_url('admin.php?page=yprint-designtool-vectorizer'); ?>">
                            <?php echo esc_html__('Bild Vektorisieren', 'yprint-designtool'); ?>
                        </a> - 
                        <?php echo esc_html__('Konvertiere Rasterbilder (JPEG, PNG) in Vektorgrafiken (SVG)', 'yprint-designtool'); ?>
                    </li>
                </ul>
            </div>
        </div>
        <?php
    }
    
    /**
     * Vectorizer page callback
     */
    public function vectorizer_page() {
        // Enqueue required scripts for the vectorizer page
        wp_enqueue_script(
            'yprint-designtool-admin',
            YPRINT_DESIGNTOOL_PLUGIN_URL . 'assets/js/admin.js',
            array('jquery'),
            YPRINT_DESIGNTOOL_VERSION,
            true
        );
        
        // Localize the script with basic data
        wp_localize_script(
            'yprint-designtool-admin',
            'yprintDesignTool',
            array(
                'ajaxUrl' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('yprint-designtool-nonce'),
                'pluginUrl' => YPRINT_DESIGNTOOL_PLUGIN_URL
            )
        );
        
        // Include vectorizer test template
        include YPRINT_DESIGNTOOL_PLUGIN_DIR . 'templates/vectorizer-test.php';
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
        
        // Vectorizer CSS and JS (only on vectorizer page)
        if (strpos($hook, 'yprint-designtool-vectorizer') !== false) {
            wp_enqueue_style(
                'yprint-vectorizer',
                YPRINT_DESIGNTOOL_PLUGIN_URL . 'assets/css/vectorizer.css',
                array(),
                YPRINT_DESIGNTOOL_VERSION
            );
            
            wp_enqueue_script(
                'yprint-vectorizer',
                YPRINT_DESIGNTOOL_PLUGIN_URL . 'assets/js/vectorizer.js',
                array('jquery'),
                YPRINT_DESIGNTOOL_VERSION,
                true
            );
        }
    }

    /**
     * Enqueue frontend scripts and styles
     */
    public function enqueue_frontend_scripts() {
        // Only load when the DesignTool is active
        if (!$this->is_designtool_active()) {
            return;
        }
        
        // Basic styles for the DesignTool
        wp_enqueue_style(
            'yprint-designtool-frontend',
            YPRINT_DESIGNTOOL_PLUGIN_URL . 'assets/css/frontend.css',
            array(),
            YPRINT_DESIGNTOOL_VERSION
        );
        
        // Basic JavaScript for the DesignTool
        wp_enqueue_script(
            'yprint-designtool-frontend',
            YPRINT_DESIGNTOOL_PLUGIN_URL . 'assets/js/frontend.js',
            array('jquery'),
            YPRINT_DESIGNTOOL_VERSION,
            true
        );
        
        // Localize the script with basic data
        wp_localize_script(
            'yprint-designtool-frontend',
            'yprintDesignTool',
            array(
                'ajaxUrl' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('yprint-designtool-nonce'),
                'pluginUrl' => YPRINT_DESIGNTOOL_PLUGIN_URL
            )
        );
        
        // Check if SVG preview shortcode is used
        global $post;
        if (is_a($post, 'WP_Post') && (
            has_shortcode($post->post_content, 'yprint_svg_preview') || 
            has_shortcode($post->post_content, 'yprint_svg_display')
        )) {
            // Enqueue SVG preview styles and scripts
            wp_enqueue_style('dashicons');
            wp_enqueue_style(
                'yprint-svg-preview',
                YPRINT_DESIGNTOOL_PLUGIN_URL . 'assets/css/svg-preview.css',
                array(),
                YPRINT_DESIGNTOOL_VERSION
            );
            
            wp_enqueue_script(
                'yprint-svg-preview',
                YPRINT_DESIGNTOOL_PLUGIN_URL . 'assets/js/svg-preview.js',
                array('jquery'),
                YPRINT_DESIGNTOOL_VERSION,
                true
            );
            
            // Localize the script
            wp_localize_script(
                'yprint-svg-preview',
                'yprintSVGPreview',
                array(
                    'ajaxUrl' => admin_url('admin-ajax.php'),
                    'nonce' => wp_create_nonce('yprint-designtool-nonce'),
                    'isLoggedIn' => is_user_logged_in(),
                    'texts' => array(
                        'saveSuccess' => __('SVG erfolgreich gespeichert!', 'yprint-designtool'),
                        'saveError' => __('Fehler beim Speichern.', 'yprint-designtool'),
                        'downloadPreparing' => __('Download wird vorbereitet...', 'yprint-designtool'),
                        'downloadReady' => __('SVG steht zum Download bereit!', 'yprint-designtool'),
                        'downloadError' => __('Fehler beim Vorbereiten des Downloads.', 'yprint-designtool'),
                        'noSVG' => __('Kein SVG vorhanden.', 'yprint-designtool')
                    )
                )
            );
        }
    }

    /**
     * Check if the DesignTool is active on the current page
     * 
     * @return bool True if the DesignTool is active
     */
    private function is_designtool_active() {
        global $post;
        
        // Default to not active
        $is_active = false;
        
        // Check for shortcode [yprint_designtool]
        if (is_a($post, 'WP_Post') && has_shortcode($post->post_content, 'yprint_designtool')) {
            $is_active = true;
        }
        
        // Check for SVG-related shortcodes
        if (is_a($post, 'WP_Post') && (
            has_shortcode($post->post_content, 'yprint_svg_preview') || 
            has_shortcode($post->post_content, 'yprint_svg_display')
        )) {
            $is_active = true;
        }
        
        // Check for plugin admin pages
        if (isset($_GET['page']) && (
            $_GET['page'] === 'yprint-designtool-vectorizer' ||
            $_GET['page'] === 'yprint-designtool-svg-editor'
        )) {
            $is_active = true;
        }
        
        // Allow filtering by other functions
        return apply_filters('yprint_designtool_is_active', $is_active);
    }

    /**
     * Plugin activation
     */
    public function activate() {
        // Create necessary directories
        $this->create_plugin_directories();
        
        // Update rewrite rules
        flush_rewrite_rules();
    }

    /**
     * Create necessary directories for the plugin
     */
    private function create_plugin_directories() {
        // Base upload directory
        $upload_dir = wp_upload_dir();
        $base_dir = $upload_dir['basedir'] . '/yprint-designtool';
        
        // Create directories
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
        
        // Create .htaccess file for temporary files
        $htaccess_content = "# Deny direct access to files
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
        // Deactivation tasks
        flush_rewrite_rules();
    }

    /**
     * SVG Editor page callback
     */
    public function svg_editor_page() {
        // Enqueue required scripts for the SVG editor page
        wp_enqueue_style(
            'dashicons'
        );
        
        wp_enqueue_style(
            'yprint-svg-preview',
            YPRINT_DESIGNTOOL_PLUGIN_URL . 'assets/css/svg-preview.css',
            array(),
            YPRINT_DESIGNTOOL_VERSION
        );
        
        wp_enqueue_script(
            'yprint-svg-preview',
            YPRINT_DESIGNTOOL_PLUGIN_URL . 'assets/js/svg-preview.js',
            array('jquery'),
            YPRINT_DESIGNTOOL_VERSION,
            true
        );
        
        // Localize the script with basic data
        wp_localize_script(
            'yprint-svg-preview',
            'yprintSVGPreview',
            array(
                'ajaxUrl' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('yprint-designtool-nonce'),
                'isLoggedIn' => is_user_logged_in(),
                'texts' => array(
                    'saveSuccess' => __('SVG erfolgreich gespeichert!', 'yprint-designtool'),
                    'saveError' => __('Fehler beim Speichern.', 'yprint-designtool'),
                    'downloadPreparing' => __('Download wird vorbereitet...', 'yprint-designtool'),
                    'downloadReady' => __('SVG steht zum Download bereit!', 'yprint-designtool'),
                    'downloadError' => __('Fehler beim Vorbereiten des Downloads.', 'yprint-designtool'),
                    'noSVG' => __('Kein SVG vorhanden.', 'yprint-designtool')
                )
            )
        );
        
        // Include SVG preview template
        include YPRINT_DESIGNTOOL_PLUGIN_DIR . 'templates/svg-preview-demo.php';
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