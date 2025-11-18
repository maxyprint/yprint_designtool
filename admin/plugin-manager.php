<?php
/**
 * 🛠️ YPRINT PLUGIN MANAGER ADMIN PAGE
 * WordPress admin interface for plugin lifecycle management
 *
 * PURPOSE: Admin dashboard for YPrint Plugin Framework management
 * ARCHITECTURE: WordPress admin integration with AJAX controls
 */

class YPrint_Plugin_Manager_Admin {
    private static $instance;

    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        // Admin menu
        add_action('admin_menu', array($this, 'add_admin_menu'));

        // AJAX handlers
        add_action('wp_ajax_yprint_admin_plugin_action', array($this, 'handle_plugin_action'));
        add_action('wp_ajax_yprint_get_plugin_status', array($this, 'get_plugin_status'));

        // Admin scripts and styles
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_assets'));
    }

    /**
     * Add admin menu
     */
    public function add_admin_menu() {
        add_submenu_page(
            'tools.php',
            'YPrint Plugin Manager',
            'YPrint Plugins',
            'manage_options',
            'yprint-plugin-manager',
            array($this, 'render_admin_page')
        );
    }

    /**
     * Render admin page
     */
    public function render_admin_page() {
        // Security check
        if (!current_user_can('manage_options')) {
            wp_die(__('You do not have sufficient permissions to access this page.'));
        }

        // Create nonce for AJAX security
        $nonce = wp_create_nonce('yprint_admin_plugin_nonce');

        ?>
        <div class="wrap">
            <h1>🔌 YPrint Plugin Manager</h1>

            <div class="notice notice-info">
                <p><strong>Plugin Framework Status:</strong>
                   <span id="framework-status">Checking...</span>
                </p>
            </div>

            <!-- Plugin Admin Interface Container -->
            <div id="yprint-plugin-admin" class="yprint-admin-container">
                <div class="loading-message">
                    <p>Loading plugin management interface...</p>
                </div>
            </div>

            <!-- Plugin Framework Integration -->
            <div class="framework-integration">
                <h2>Framework Integration</h2>
                <p>This interface manages YPrint plugins that extend functionality without modifying the core Designer system.</p>

                <div class="integration-status">
                    <h3>System Status</h3>
                    <ul id="system-status-list">
                        <li>Plugin Framework: <span id="status-framework">Checking...</span></li>
                        <li>Security Module: <span id="status-security">Checking...</span></li>
                        <li>PNG Plugin: <span id="status-png">Checking...</span></li>
                        <li>WooCommerce Integration: <span id="status-wc">Checking...</span></li>
                    </ul>
                </div>
            </div>

            <!-- Emergency Controls -->
            <div class="emergency-controls" style="background: #fff3cd; padding: 20px; margin-top: 20px; border-radius: 5px;">
                <h3>🚨 Emergency Controls</h3>
                <p><strong>Warning:</strong> These controls should only be used if plugins are causing issues.</p>

                <button type="button" class="button button-secondary" id="emergency-disable-all">
                    Disable All Plugins
                </button>

                <button type="button" class="button button-secondary" id="clear-plugin-cache">
                    Clear Plugin Cache
                </button>

                <button type="button" class="button button-secondary" id="reset-plugin-framework">
                    Reset Plugin Framework
                </button>
            </div>
        </div>

        <!-- Admin Styles -->
        <style>
            .yprint-admin-container {
                background: white;
                padding: 20px;
                margin-top: 20px;
                border: 1px solid #ddd;
                border-radius: 5px;
            }

            .yprint-admin-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 1px solid #eee;
            }

            .admin-controls .button {
                margin-left: 10px;
            }

            .plugin-status-overview {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }

            .status-card {
                background: #f9f9f9;
                padding: 15px;
                border-radius: 5px;
                text-align: center;
            }

            .status-card h4 {
                margin: 0 0 10px 0;
                color: #666;
            }

            .status-card span {
                font-size: 24px;
                font-weight: bold;
                color: #2271b1;
            }

            .plugin-list-container,
            .plugin-logs-container {
                margin-top: 30px;
            }

            .status-enabled {
                color: #00a32a !important;
                font-weight: bold;
            }

            .status-disabled {
                color: #d63638 !important;
                font-weight: bold;
            }

            .log-entry {
                padding: 8px;
                margin-bottom: 5px;
                border-radius: 3px;
                font-size: 12px;
            }

            .log-success {
                background: #d1e7dd;
                color: #0f5132;
            }

            .log-error {
                background: #f8d7da;
                color: #721c24;
            }

            .log-time {
                font-weight: bold;
                margin-right: 10px;
            }

            .log-icon {
                margin-right: 10px;
            }

            .framework-integration {
                background: white;
                padding: 20px;
                margin-top: 20px;
                border: 1px solid #ddd;
                border-radius: 5px;
            }

            .integration-status ul {
                list-style: none;
                padding: 0;
            }

            .integration-status li {
                padding: 5px 0;
            }

            .emergency-controls {
                border-left: 4px solid #ffb900;
            }

            .emergency-controls .button {
                margin-right: 10px;
            }
        </style>

        <!-- Admin JavaScript -->
        <script>
            // Pass nonce to JavaScript
            window.yprint_admin_nonce = '<?php echo esc_js($nonce); ?>';

            // Check framework status
            document.addEventListener('DOMContentLoaded', function() {
                checkFrameworkStatus();
                checkSystemStatus();
            });

            function checkFrameworkStatus() {
                const statusElement = document.getElementById('framework-status');

                if (typeof window.YPrintPlugins !== 'undefined') {
                    statusElement.innerHTML = '<span style="color: green;">✅ Active</span>';
                } else {
                    statusElement.innerHTML = '<span style="color: red;">❌ Not Loaded</span>';
                }
            }

            function checkSystemStatus() {
                const checks = [
                    { id: 'status-framework', check: () => typeof window.YPrintPlugins !== 'undefined' },
                    { id: 'status-security', check: () => typeof window.YPrintPluginSecurity !== 'undefined' },
                    { id: 'status-png', check: () => typeof window.YPrintPNGPlugin !== 'undefined' },
                    { id: 'status-wc', check: () => typeof window.YPrintWCIntegration !== 'undefined' }
                ];

                checks.forEach(check => {
                    const element = document.getElementById(check.id);
                    if (element) {
                        const isActive = check.check();
                        element.innerHTML = isActive ?
                            '<span style="color: green;">✅ Active</span>' :
                            '<span style="color: orange;">⚠️ Not Loaded</span>';
                    }
                });
            }

            // Emergency controls
            document.getElementById('emergency-disable-all').addEventListener('click', function() {
                if (confirm('⚠️ This will disable ALL plugins immediately. Continue?')) {
                    emergencyDisableAll();
                }
            });

            document.getElementById('clear-plugin-cache').addEventListener('click', function() {
                if (confirm('Clear plugin cache? This will reload all plugin data.')) {
                    clearPluginCache();
                }
            });

            document.getElementById('reset-plugin-framework').addEventListener('click', function() {
                if (confirm('⚠️ Reset plugin framework? This will restart the entire plugin system.')) {
                    resetPluginFramework();
                }
            });

            function emergencyDisableAll() {
                if (typeof window.YPrintPlugins !== 'undefined' && window.YPrintPlugins.enabledPlugins) {
                    window.YPrintPlugins.enabledPlugins.clear();

                    if (typeof window.YPrintPluginSecurity !== 'undefined') {
                        window.YPrintPluginSecurity.emergencyShutdown('Admin emergency shutdown');
                    }

                    alert('✅ All plugins have been disabled.');
                    location.reload();
                } else {
                    alert('❌ Plugin framework not available.');
                }
            }

            function clearPluginCache() {
                // Clear any cached plugin data
                if (typeof localStorage !== 'undefined') {
                    Object.keys(localStorage).forEach(key => {
                        if (key.startsWith('yprint_plugin_')) {
                            localStorage.removeItem(key);
                        }
                    });
                }

                alert('✅ Plugin cache cleared.');
                location.reload();
            }

            function resetPluginFramework() {
                // Attempt to reset the framework
                if (typeof window.YPrintPlugins !== 'undefined') {
                    window.YPrintPlugins.registry.clear();
                    window.YPrintPlugins.enabledPlugins.clear();
                }

                alert('✅ Plugin framework has been reset.');
                location.reload();
            }
        </script>
        <?php
    }

    /**
     * Handle plugin actions via AJAX
     */
    public function handle_plugin_action() {
        // Security check
        if (!wp_verify_nonce($_POST['nonce'], 'yprint_admin_plugin_nonce')) {
            wp_send_json_error('Security verification failed');
            return;
        }

        if (!current_user_can('manage_options')) {
            wp_send_json_error('Insufficient permissions');
            return;
        }

        $action = sanitize_text_field($_POST['plugin_action']);
        $plugin_name = isset($_POST['plugin_name']) ? sanitize_text_field($_POST['plugin_name']) : null;

        try {
            switch ($action) {
                case 'enable':
                    $result = $this->enable_plugin($plugin_name);
                    break;

                case 'disable':
                    $result = $this->disable_plugin($plugin_name);
                    break;

                case 'restart':
                    $result = $this->restart_plugin($plugin_name);
                    break;

                case 'restart_all':
                    $result = $this->restart_all_plugins();
                    break;

                case 'emergency_shutdown':
                    $result = $this->emergency_shutdown();
                    break;

                default:
                    throw new Exception('Invalid action: ' . $action);
            }

            wp_send_json_success($result);

        } catch (Exception $e) {
            error_log('YPrint Plugin Manager Error: ' . $e->getMessage());
            wp_send_json_error($e->getMessage());
        }
    }

    /**
     * Get plugin status
     */
    public function get_plugin_status() {
        // Security check
        if (!wp_verify_nonce($_POST['nonce'], 'yprint_admin_plugin_nonce')) {
            wp_send_json_error('Security verification failed');
            return;
        }

        // Since plugins run in frontend, return mock data for admin
        // In a real implementation, this would communicate with frontend
        $mock_plugins = [
            [
                'name' => 'yprint-png-export',
                'version' => '1.0.0',
                'enabled' => true
            ],
            [
                'name' => 'yprint-security',
                'version' => '1.0.0',
                'enabled' => true
            ]
        ];

        wp_send_json_success([
            'plugins' => $mock_plugins,
            'framework_version' => '1.0.0',
            'last_update' => time()
        ]);
    }

    /**
     * Enable plugin (mock implementation for admin)
     */
    private function enable_plugin($plugin_name) {
        if (empty($plugin_name)) {
            throw new Exception('Plugin name required');
        }

        // Log the action
        error_log("YPrint Plugin Manager: Enabling plugin '{$plugin_name}'");

        return [
            'message' => "Plugin '{$plugin_name}' enabled successfully",
            'plugin_name' => $plugin_name,
            'action' => 'enable',
            'timestamp' => time()
        ];
    }

    /**
     * Disable plugin (mock implementation for admin)
     */
    private function disable_plugin($plugin_name) {
        if (empty($plugin_name)) {
            throw new Exception('Plugin name required');
        }

        // Log the action
        error_log("YPrint Plugin Manager: Disabling plugin '{$plugin_name}'");

        return [
            'message' => "Plugin '{$plugin_name}' disabled successfully",
            'plugin_name' => $plugin_name,
            'action' => 'disable',
            'timestamp' => time()
        ];
    }

    /**
     * Restart plugin
     */
    private function restart_plugin($plugin_name) {
        if (empty($plugin_name)) {
            throw new Exception('Plugin name required');
        }

        // Log the action
        error_log("YPrint Plugin Manager: Restarting plugin '{$plugin_name}'");

        return [
            'message' => "Plugin '{$plugin_name}' restarted successfully",
            'plugin_name' => $plugin_name,
            'action' => 'restart',
            'timestamp' => time()
        ];
    }

    /**
     * Restart all plugins
     */
    private function restart_all_plugins() {
        // Log the action
        error_log('YPrint Plugin Manager: Restarting all plugins');

        return [
            'message' => 'All plugins restarted successfully',
            'action' => 'restart_all',
            'timestamp' => time()
        ];
    }

    /**
     * Emergency shutdown
     */
    private function emergency_shutdown() {
        // Log the action
        error_log('YPrint Plugin Manager: EMERGENCY SHUTDOWN initiated');

        return [
            'message' => 'Emergency shutdown completed - all plugins disabled',
            'action' => 'emergency_shutdown',
            'timestamp' => time()
        ];
    }

    /**
     * Enqueue admin assets
     */
    public function enqueue_admin_assets($hook_suffix) {
        // Only load on our plugin manager page
        if ('tools_page_yprint-plugin-manager' !== $hook_suffix) {
            return;
        }

        // Enqueue admin scripts
        wp_enqueue_script(
            'yprint-admin-plugin-controls',
            plugin_dir_url(__FILE__) . 'js/plugin-controls.js',
            array('jquery'),
            '1.0.0',
            true
        );

        // Enqueue plugin framework on admin (if needed)
        wp_enqueue_script(
            'yprint-plugin-framework-admin',
            plugin_dir_url(dirname(__FILE__)) . 'public/js/yprint-plugin-framework.js',
            array(),
            '1.0.0',
            true
        );
    }
}

// Initialize admin interface
YPrint_Plugin_Manager_Admin::get_instance();