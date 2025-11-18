<?php
/**
 * 🎯 DIRECT COORDINATE WORDPRESS INTEGRATION
 *
 * Optional PHP Integration for DirectCoordinate WordPress Form System
 *
 * PURPOSE: Provides WordPress-native integration without modifying core plugin files
 * - Can be used as standalone plugin or included in theme functions.php
 * - Handles script registration and enqueueing
 * - Provides WordPress admin interface
 * - Manages WordPress options and settings
 * - Non-invasive integration with existing OctoPrint Designer plugin
 *
 * USAGE:
 * Method 1: As Plugin - Upload to /wp-content/plugins/ and activate
 * Method 2: In Theme - Include in functions.php with: include 'path/to/this/file.php';
 * Method 3: As MU Plugin - Place in /wp-content/mu-plugins/
 *
 * @version 1.0.0
 * @author ULTRA-THINK WordPress Integration
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * DirectCoordinate WordPress Integration Class
 */
class DirectCoordinate_WordPress_Integration {

    /**
     * Plugin/Integration information
     */
    const VERSION = '1.0.0';
    const OPTION_NAME = 'direct_coordinate_settings';
    const SCRIPT_HANDLE = 'direct-coordinate-wordpress';
    const REG_SCRIPT_HANDLE = 'direct-coordinate-registration';

    /**
     * Instance holder
     */
    private static $instance = null;

    /**
     * Integration settings
     */
    private $settings = [];

    /**
     * Get singleton instance
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Constructor - Initialize the integration
     */
    private function __construct() {
        $this->load_settings();
        $this->init_hooks();

        // Log initialization
        if ($this->get_setting('debug_mode', false)) {
            error_log('🎯 DirectCoordinate WordPress Integration initialized');
        }
    }

    /**
     * Initialize WordPress hooks
     */
    private function init_hooks() {
        // Frontend hooks
        add_action('wp_enqueue_scripts', [$this, 'enqueue_frontend_scripts']);
        add_action('wp_head', [$this, 'add_inline_config']);

        // Admin hooks
        add_action('admin_menu', [$this, 'add_admin_menu']);
        add_action('admin_init', [$this, 'register_settings']);
        add_action('admin_enqueue_scripts', [$this, 'enqueue_admin_scripts']);

        // AJAX hooks for settings
        add_action('wp_ajax_direct_coordinate_update_settings', [$this, 'ajax_update_settings']);
        add_action('wp_ajax_direct_coordinate_get_status', [$this, 'ajax_get_status']);

        // Plugin action links (if used as plugin)
        add_filter('plugin_action_links_' . plugin_basename(__FILE__), [$this, 'add_plugin_action_links']);

        // Add shortcode for testing
        add_shortcode('direct_coordinate_test', [$this, 'shortcode_test_form']);
    }

    /**
     * Load settings from WordPress options
     */
    private function load_settings() {
        $defaults = [
            'enabled' => false,
            'debug_mode' => false,
            'auto_enable_conditions' => [
                'url_parameter' => true,
                'localstorage' => true,
                'admin_setting' => true
            ],
            'form_field_selectors' => [
                'design_data' => 'input[name="direct_design_data"], #direct_design_data, textarea[name="direct_design_data"]',
                'coordinate_json' => 'input[name="direct_coordinate_json"], #direct_coordinate_json, textarea[name="direct_coordinate_json"]'
            ],
            'population_interval' => 2000,
            'script_loading' => [
                'conditional' => true,
                'async' => true,
                'in_footer' => true
            ]
        ];

        $saved_settings = get_option(self::OPTION_NAME, []);
        $this->settings = array_merge($defaults, $saved_settings);
    }

    /**
     * Get setting value
     */
    private function get_setting($key, $default = null) {
        return $this->settings[$key] ?? $default;
    }

    /**
     * Update setting value
     */
    private function update_setting($key, $value) {
        $this->settings[$key] = $value;
        update_option(self::OPTION_NAME, $this->settings);
    }

    /**
     * Check if DirectCoordinate should be loaded
     */
    private function should_load_scripts() {
        // Always load if explicitly enabled in admin
        if ($this->get_setting('enabled', false)) {
            return true;
        }

        // Check URL parameter
        if (isset($_GET['direct_coordinates']) && $_GET['direct_coordinates'] === '1') {
            return true;
        }

        // Check for OctoPrint Designer plugin presence
        if (class_exists('Octo_Print_Designer_Public')) {
            // Load conditionally when OctoPrint Designer is active
            return $this->is_designer_page();
        }

        return false;
    }

    /**
     * Check if current page is a designer page
     */
    private function is_designer_page() {
        // Check for designer shortcodes in content
        global $post;
        if ($post && has_shortcode($post->post_content, 'ops-designer')) {
            return true;
        }

        // Check for canvas elements (basic detection)
        if (is_page() || is_product()) {
            return true;
        }

        return false;
    }

    /**
     * Enqueue frontend scripts
     */
    public function enqueue_frontend_scripts() {
        if (!$this->should_load_scripts()) {
            return;
        }

        $script_path = $this->get_script_path();
        $script_url = $this->get_script_url();

        // Enqueue registration script first
        wp_enqueue_script(
            self::REG_SCRIPT_HANDLE,
            $script_url . 'direct-coordinate-registration.js',
            ['jquery'],
            self::VERSION,
            $this->get_setting('script_loading.in_footer', true)
        );

        // Enqueue main DirectCoordinate script
        wp_enqueue_script(
            self::SCRIPT_HANDLE,
            $script_url . 'direct-coordinate-wordpress.js',
            [self::REG_SCRIPT_HANDLE],
            self::VERSION,
            $this->get_setting('script_loading.in_footer', true)
        );

        // Make scripts async if configured
        if ($this->get_setting('script_loading.async', true)) {
            add_filter('script_loader_tag', [$this, 'add_async_attribute'], 10, 2);
        }

        $this->debug_log('DirectCoordinate scripts enqueued');
    }

    /**
     * Add async attribute to scripts
     */
    public function add_async_attribute($tag, $handle) {
        if (in_array($handle, [self::SCRIPT_HANDLE, self::REG_SCRIPT_HANDLE])) {
            return str_replace(' src', ' async src', $tag);
        }
        return $tag;
    }

    /**
     * Get script file path
     */
    private function get_script_path() {
        // Method 1: Same directory as this PHP file
        $local_path = dirname(__FILE__) . '/public/js/';
        if (file_exists($local_path . 'direct-coordinate-wordpress.js')) {
            return $local_path;
        }

        // Method 2: Relative to OctoPrint Designer plugin
        if (defined('OCTO_PRINT_DESIGNER_PATH')) {
            $plugin_path = OCTO_PRINT_DESIGNER_PATH . 'public/js/';
            if (file_exists($plugin_path . 'direct-coordinate-wordpress.js')) {
                return $plugin_path;
            }
        }

        // Method 3: WordPress plugins directory
        $plugins_path = WP_PLUGIN_DIR . '/octo-print-designer/public/js/';
        if (file_exists($plugins_path . 'direct-coordinate-wordpress.js')) {
            return $plugins_path;
        }

        // Default fallback
        return dirname(__FILE__) . '/';
    }

    /**
     * Get script URL
     */
    private function get_script_url() {
        // Method 1: Same directory as this PHP file (convert path to URL)
        $local_path = dirname(__FILE__) . '/public/js/';
        if (file_exists($local_path . 'direct-coordinate-wordpress.js')) {
            return plugin_dir_url(__FILE__) . 'public/js/';
        }

        // Method 2: OctoPrint Designer plugin URL
        if (defined('OCTO_PRINT_DESIGNER_URL')) {
            return OCTO_PRINT_DESIGNER_URL . 'public/js/';
        }

        // Method 3: WordPress plugins URL
        return plugins_url('octo-print-designer/public/js/');
    }

    /**
     * Add inline configuration
     */
    public function add_inline_config() {
        if (!$this->should_load_scripts()) {
            return;
        }

        $config = [
            'enabled' => $this->get_setting('enabled', false),
            'debug' => $this->get_setting('debug_mode', false),
            'populationInterval' => $this->get_setting('population_interval', 2000),
            'formFields' => $this->get_setting('form_field_selectors', []),
            'autoEnable' => $this->get_setting('auto_enable_conditions', []),
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('direct_coordinate_nonce')
        ];

        echo '<script type="text/javascript">';
        echo 'window.directCoordinateConfig = ' . json_encode($config) . ';';
        echo '</script>' . "\n";

        $this->debug_log('Inline configuration added');
    }

    /**
     * Add admin menu
     */
    public function add_admin_menu() {
        add_options_page(
            'DirectCoordinate Settings',
            'DirectCoordinate',
            'manage_options',
            'direct-coordinate-settings',
            [$this, 'render_admin_page']
        );
    }

    /**
     * Register settings
     */
    public function register_settings() {
        register_setting('direct_coordinate_settings_group', self::OPTION_NAME);

        add_settings_section(
            'direct_coordinate_main_section',
            'DirectCoordinate WordPress Integration',
            [$this, 'render_section_description'],
            'direct-coordinate-settings'
        );

        add_settings_field(
            'enabled',
            'Enable DirectCoordinate',
            [$this, 'render_enabled_field'],
            'direct-coordinate-settings',
            'direct_coordinate_main_section'
        );

        add_settings_field(
            'debug_mode',
            'Debug Mode',
            [$this, 'render_debug_field'],
            'direct-coordinate-settings',
            'direct_coordinate_main_section'
        );

        add_settings_field(
            'population_interval',
            'Population Interval (ms)',
            [$this, 'render_interval_field'],
            'direct-coordinate-settings',
            'direct_coordinate_main_section'
        );
    }

    /**
     * Render admin page
     */
    public function render_admin_page() {
        if (!current_user_can('manage_options')) {
            return;
        }

        // Handle form submission
        if (isset($_POST['submit'])) {
            $this->handle_settings_update();
        }

        ?>
        <div class="wrap">
            <h1>🎯 DirectCoordinate WordPress Integration</h1>

            <?php $this->render_status_section(); ?>

            <form method="post" action="">
                <?php
                settings_fields('direct_coordinate_settings_group');
                do_settings_sections('direct-coordinate-settings');
                submit_button();
                ?>
            </form>

            <?php $this->render_testing_section(); ?>
            <?php $this->render_documentation_section(); ?>
        </div>

        <style>
            .direct-coordinate-status {
                background: #f0f0f1;
                border: 1px solid #c3c4c7;
                border-left: 4px solid #72aee6;
                padding: 12px;
                margin: 20px 0;
            }
            .direct-coordinate-success {
                border-left-color: #00a32a;
            }
            .direct-coordinate-warning {
                border-left-color: #dba617;
            }
            .direct-coordinate-error {
                border-left-color: #d63638;
            }
            .direct-coordinate-test-section {
                background: white;
                border: 1px solid #c3c4c7;
                padding: 20px;
                margin: 20px 0;
            }
            .direct-coordinate-code {
                background: #f6f7f7;
                border: 1px solid #c3c4c7;
                padding: 10px;
                font-family: monospace;
                margin: 10px 0;
            }
        </style>
        <?php
    }

    /**
     * Render status section
     */
    private function render_status_section() {
        $status_class = 'direct-coordinate-status';
        $status_message = 'System Status: ';

        if ($this->get_setting('enabled', false)) {
            $status_class .= ' direct-coordinate-success';
            $status_message .= '✅ Enabled';
        } else {
            $status_class .= ' direct-coordinate-warning';
            $status_message .= '⚠️ Disabled';
        }

        echo '<div class="' . $status_class . '">';
        echo '<p><strong>' . $status_message . '</strong></p>';

        // Check for OctoPrint Designer
        if (class_exists('Octo_Print_Designer_Public')) {
            echo '<p>✅ OctoPrint Designer Plugin: Detected</p>';
        } else {
            echo '<p>⚠️ OctoPrint Designer Plugin: Not Found (will work standalone)</p>';
        }

        // Check script files
        $script_path = $this->get_script_path();
        if (file_exists($script_path . 'direct-coordinate-wordpress.js')) {
            echo '<p>✅ Script Files: Found</p>';
        } else {
            echo '<p>❌ Script Files: Missing from ' . esc_html($script_path) . '</p>';
        }

        echo '</div>';
    }

    /**
     * Render testing section
     */
    private function render_testing_section() {
        ?>
        <div class="direct-coordinate-test-section">
            <h2>🧪 Testing & Integration</h2>

            <h3>Test Form Fields</h3>
            <p>Use this form to test DirectCoordinate form population:</p>

            <form id="direct-coordinate-test-form" style="margin: 20px 0; padding: 20px; background: #f9f9f9; border: 1px solid #ddd;">
                <div style="margin-bottom: 15px;">
                    <label for="test_direct_design_data"><strong>Direct Design Data:</strong></label><br>
                    <textarea name="direct_design_data" id="test_direct_design_data" rows="4" cols="80" placeholder="Will be populated automatically when DirectCoordinate is active..."></textarea>
                </div>

                <div style="margin-bottom: 15px;">
                    <label for="test_direct_coordinate_json"><strong>Direct Coordinate JSON:</strong></label><br>
                    <textarea name="direct_coordinate_json" id="test_direct_coordinate_json" rows="4" cols="80" placeholder="Will be populated automatically when DirectCoordinate is active..."></textarea>
                </div>

                <div>
                    <button type="button" class="button" onclick="testDirectCoordinatePopulation()">🔄 Test Population</button>
                    <button type="button" class="button" onclick="enableDirectCoordinates()">✅ Enable DirectCoordinate</button>
                    <button type="button" class="button" onclick="showDirectCoordinateStatus()">📊 Show Status</button>
                </div>
            </form>

            <h3>JavaScript Console Commands</h3>
            <div class="direct-coordinate-code">
// Enable/Disable DirectCoordinate
enableDirectCoordinates()
disableDirectCoordinates()

// Check status
directCoordinateStatus()

// Test population
testDirectCoordinatePopulation()

// Run A/B test
DirectCoordinateABTest.compareCoordinateSystems()
            </div>

            <h3>URL Parameters</h3>
            <p>Add <code>?direct_coordinates=1</code> to any URL to enable DirectCoordinate:</p>
            <div class="direct-coordinate-code">
<?php echo home_url('/?direct_coordinates=1'); ?>
            </div>

            <h3>Shortcode Testing</h3>
            <p>Use <code>[direct_coordinate_test]</code> shortcode to embed test form on any page.</p>
        </div>

        <script>
            function testDirectCoordinatePopulation() {
                if (typeof window.testDirectCoordinatePopulation === 'function') {
                    const result = window.testDirectCoordinatePopulation();
                    alert('Test Result: ' + result);
                } else {
                    alert('DirectCoordinate system not loaded. Make sure it is enabled.');
                }
            }

            function enableDirectCoordinates() {
                if (typeof window.enableDirectCoordinates === 'function') {
                    const result = window.enableDirectCoordinates();
                    alert('Enable Result: ' + result);
                    location.reload();
                } else {
                    alert('DirectCoordinate system not loaded. Check script loading.');
                }
            }

            function showDirectCoordinateStatus() {
                if (typeof window.directCoordinateStatus === 'function') {
                    const status = window.directCoordinateStatus();
                    alert('DirectCoordinate Status:\n\n' + JSON.stringify(status, null, 2));
                } else {
                    alert('DirectCoordinate system not loaded.');
                }
            }
        </script>
        <?php
    }

    /**
     * Render documentation section
     */
    private function render_documentation_section() {
        ?>
        <div class="direct-coordinate-test-section">
            <h2>📚 Documentation</h2>

            <h3>What is DirectCoordinate?</h3>
            <p>DirectCoordinate WordPress Integration provides automatic form population with design coordinates from canvas elements. It works alongside existing OctoPrint Designer systems without interfering.</p>

            <h3>How It Works</h3>
            <ol>
                <li><strong>Detection:</strong> Automatically detects canvas elements and design data</li>
                <li><strong>Extraction:</strong> Extracts coordinates using multiple fallback methods</li>
                <li><strong>Population:</strong> Automatically populates specified form fields</li>
                <li><strong>Validation:</strong> Validates and formats data for WordPress processing</li>
            </ol>

            <h3>Form Fields</h3>
            <p>DirectCoordinate automatically populates these form field types:</p>
            <ul>
                <li><code>input[name="direct_design_data"]</code> - Complete design data as JSON</li>
                <li><code>#direct_design_data</code> - By ID selector</li>
                <li><code>textarea[name="direct_coordinate_json"]</code> - Coordinate-only JSON</li>
                <li><code>#direct_coordinate_json</code> - By ID selector</li>
            </ul>

            <h3>Integration Methods</h3>
            <h4>Method 1: WordPress Plugin</h4>
            <p>Upload this file as a WordPress plugin and activate it.</p>

            <h4>Method 2: Theme Functions</h4>
            <p>Add to your theme's functions.php:</p>
            <div class="direct-coordinate-code">
&lt;?php
include get_template_directory() . '/direct-coordinate-wordpress-integration.php';
?&gt;
            </div>

            <h4>Method 3: Must-Use Plugin</h4>
            <p>Place in <code>/wp-content/mu-plugins/</code> for automatic activation.</p>

            <h3>Configuration</h3>
            <p>All settings can be configured through this admin interface or programmatically:</p>
            <div class="direct-coordinate-code">
// Get current settings
$settings = get_option('direct_coordinate_settings');

// Update settings
update_option('direct_coordinate_settings', $new_settings);
            </div>
        </div>
        <?php
    }

    /**
     * Render settings fields
     */
    public function render_section_description() {
        echo '<p>Configure DirectCoordinate WordPress Integration settings below.</p>';
    }

    public function render_enabled_field() {
        $enabled = $this->get_setting('enabled', false);
        echo '<input type="checkbox" name="' . self::OPTION_NAME . '[enabled]" value="1" ' . checked(1, $enabled, false) . '>';
        echo '<label for="enabled">Enable DirectCoordinate system globally</label>';
    }

    public function render_debug_field() {
        $debug = $this->get_setting('debug_mode', false);
        echo '<input type="checkbox" name="' . self::OPTION_NAME . '[debug_mode]" value="1" ' . checked(1, $debug, false) . '>';
        echo '<label for="debug_mode">Enable debug logging and verbose output</label>';
    }

    public function render_interval_field() {
        $interval = $this->get_setting('population_interval', 2000);
        echo '<input type="number" name="' . self::OPTION_NAME . '[population_interval]" value="' . esc_attr($interval) . '" min="500" max="10000" step="500">';
        echo '<p class="description">How often to check and populate form fields (in milliseconds)</p>';
    }

    /**
     * Handle settings update
     */
    private function handle_settings_update() {
        if (!current_user_can('manage_options') || !wp_verify_nonce($_POST['_wpnonce'], 'direct_coordinate_settings_group-options')) {
            return;
        }

        if (isset($_POST[self::OPTION_NAME])) {
            $new_settings = $_POST[self::OPTION_NAME];

            // Sanitize settings
            $new_settings['enabled'] = isset($new_settings['enabled']);
            $new_settings['debug_mode'] = isset($new_settings['debug_mode']);
            $new_settings['population_interval'] = max(500, intval($new_settings['population_interval']));

            // Update settings
            update_option(self::OPTION_NAME, array_merge($this->settings, $new_settings));
            $this->load_settings();

            add_settings_error(
                'direct_coordinate_settings',
                'settings_updated',
                'DirectCoordinate settings updated successfully!',
                'success'
            );

            $this->debug_log('Settings updated: ' . json_encode($new_settings));
        }
    }

    /**
     * AJAX: Update settings
     */
    public function ajax_update_settings() {
        if (!wp_verify_nonce($_POST['nonce'], 'direct_coordinate_nonce')) {
            wp_die('Invalid nonce');
        }

        if (!current_user_can('manage_options')) {
            wp_die('Insufficient permissions');
        }

        $setting = sanitize_text_field($_POST['setting']);
        $value = sanitize_text_field($_POST['value']);

        $this->update_setting($setting, $value);

        wp_send_json_success([
            'message' => 'Setting updated successfully',
            'setting' => $setting,
            'value' => $value
        ]);
    }

    /**
     * AJAX: Get status
     */
    public function ajax_get_status() {
        wp_send_json_success([
            'enabled' => $this->get_setting('enabled', false),
            'debug_mode' => $this->get_setting('debug_mode', false),
            'should_load' => $this->should_load_scripts(),
            'octo_designer_active' => class_exists('Octo_Print_Designer_Public'),
            'script_path' => $this->get_script_path(),
            'script_url' => $this->get_script_url(),
            'settings' => $this->settings
        ]);
    }

    /**
     * Enqueue admin scripts
     */
    public function enqueue_admin_scripts($hook) {
        if ($hook !== 'settings_page_direct-coordinate-settings') {
            return;
        }

        // Enqueue DirectCoordinate scripts in admin for testing
        wp_enqueue_script(
            self::SCRIPT_HANDLE . '-admin',
            $this->get_script_url() . 'direct-coordinate-wordpress.js',
            ['jquery'],
            self::VERSION,
            true
        );
    }

    /**
     * Add plugin action links
     */
    public function add_plugin_action_links($links) {
        $settings_link = '<a href="' . admin_url('options-general.php?page=direct-coordinate-settings') . '">Settings</a>';
        array_unshift($links, $settings_link);
        return $links;
    }

    /**
     * Shortcode: Test form
     */
    public function shortcode_test_form($atts) {
        $atts = shortcode_atts([
            'title' => 'DirectCoordinate Test Form',
            'show_buttons' => true
        ], $atts);

        ob_start();
        ?>
        <div class="direct-coordinate-test-form">
            <h3><?php echo esc_html($atts['title']); ?></h3>
            <form method="post">
                <div style="margin-bottom: 15px;">
                    <label for="shortcode_direct_design_data"><strong>Direct Design Data:</strong></label><br>
                    <textarea name="direct_design_data" id="shortcode_direct_design_data" rows="4" style="width: 100%;" placeholder="Will be populated automatically..."></textarea>
                </div>

                <div style="margin-bottom: 15px;">
                    <label for="shortcode_direct_coordinate_json"><strong>Direct Coordinate JSON:</strong></label><br>
                    <textarea name="direct_coordinate_json" id="shortcode_direct_coordinate_json" rows="4" style="width: 100%;" placeholder="Will be populated automatically..."></textarea>
                </div>

                <?php if ($atts['show_buttons']): ?>
                <div>
                    <button type="button" onclick="enableDirectCoordinates && enableDirectCoordinates()">Enable DirectCoordinate</button>
                    <button type="button" onclick="testDirectCoordinatePopulation && testDirectCoordinatePopulation()">Test Population</button>
                </div>
                <?php endif; ?>
            </form>
        </div>
        <?php
        return ob_get_clean();
    }

    /**
     * Debug logging
     */
    private function debug_log($message) {
        if ($this->get_setting('debug_mode', false)) {
            error_log('[DirectCoordinate WP Integration] ' . $message);
        }
    }

    /**
     * Plugin activation hook
     */
    public static function activate() {
        $instance = self::get_instance();
        $instance->debug_log('Plugin activated');

        // Set default settings if they don't exist
        if (!get_option(self::OPTION_NAME)) {
            update_option(self::OPTION_NAME, [
                'enabled' => false,
                'debug_mode' => false,
                'population_interval' => 2000
            ]);
        }
    }

    /**
     * Plugin deactivation hook
     */
    public static function deactivate() {
        // Clean up if needed
        error_log('[DirectCoordinate WP Integration] Plugin deactivated');
    }

    /**
     * Plugin uninstall hook
     */
    public static function uninstall() {
        // Remove settings
        delete_option(self::OPTION_NAME);
        error_log('[DirectCoordinate WP Integration] Plugin uninstalled');
    }
}

// Initialize the integration
DirectCoordinate_WordPress_Integration::get_instance();

// Plugin hooks (only if used as a plugin)
if (!function_exists('is_plugin_active')) {
    include_once ABSPATH . 'wp-admin/includes/plugin.php';
}

// Only register plugin hooks if this file is being used as a plugin
if (strpos(__FILE__, WP_PLUGIN_DIR) !== false) {
    register_activation_hook(__FILE__, ['DirectCoordinate_WordPress_Integration', 'activate']);
    register_deactivation_hook(__FILE__, ['DirectCoordinate_WordPress_Integration', 'deactivate']);
    register_uninstall_hook(__FILE__, ['DirectCoordinate_WordPress_Integration', 'uninstall']);

    // Plugin header for WordPress recognition
    if (!function_exists('get_plugin_data')) {
        /*
        Plugin Name: DirectCoordinate WordPress Integration
        Plugin URI: https://github.com/your-repo/direct-coordinate-wordpress
        Description: Non-invasive WordPress form integration for DirectCoordinate design data capture. Works alongside OctoPrint Designer without conflicts.
        Version: 1.0.0
        Author: ULTRA-THINK Integration System
        License: GPL v2 or later
        License URI: https://www.gnu.org/licenses/gpl-2.0.html
        Text Domain: direct-coordinate-wp
        Requires at least: 5.0
        Tested up to: 6.4
        Requires PHP: 7.4
        Network: false
        */
    }
}

?>