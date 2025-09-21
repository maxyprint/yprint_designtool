<?php

/**
 * WebSocket AI Testing Integration for Octo Print Designer
 *
 * Handles real-time AI testing integration with the design tool
 *
 * @since 1.0.9
 */

class Octo_Print_Designer_WebSocket_Integration {

    private static $instance = null;
    private $plugin_name;
    private $version;

    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        $this->plugin_name = 'octo-print-designer';
        $this->version = OCTO_PRINT_DESIGNER_VERSION;

        $this->define_hooks();
    }

    private function define_hooks() {
        // Admin hooks
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));
        add_action('admin_notices', array($this, 'websocket_server_notice'));

        // AJAX hooks for WebSocket integration
        add_action('wp_ajax_get_design_data_for_testing', array($this, 'get_design_data_for_testing'));
        add_action('wp_ajax_save_test_results', array($this, 'save_test_results'));
        add_action('wp_ajax_start_websocket_server', array($this, 'start_websocket_server'));
        add_action('wp_ajax_check_websocket_server_status', array($this, 'check_websocket_server_status'));

        // Settings page integration
        add_action('admin_menu', array($this, 'add_websocket_settings_page'));
    }

    public function enqueue_admin_scripts($hook) {
        // Only load on design template edit pages
        if (!$this->is_template_edit_page($hook)) {
            return;
        }

        // Enqueue WebSocket client
        wp_enqueue_script(
            'octo-websocket-client',
            OCTO_PRINT_DESIGNER_URL . 'public/js/websocket-client.js',
            array('jquery'),
            $this->version . '.1',
            true
        );

        // Enqueue integration script
        wp_enqueue_script(
            'octo-websocket-admin-integration',
            OCTO_PRINT_DESIGNER_URL . 'admin/js/websocket-admin-integration.js',
            array('jquery', 'octo-websocket-client'),
            $this->version . '.1',
            true
        );

        // Localize script with AJAX URL and settings
        wp_localize_script('octo-websocket-admin-integration', 'octo_websocket_ajax', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('octo_websocket_nonce'),
            'websocket_server_url' => $this->get_websocket_server_url(),
            'auto_start_server' => get_option('octo_websocket_auto_start', true),
            'server_port' => get_option('octo_websocket_server_port', 8080)
        ));

        // Add CSS for WebSocket UI
        wp_enqueue_style(
            'octo-websocket-admin-style',
            OCTO_PRINT_DESIGNER_URL . 'admin/css/websocket-integration.css',
            array(),
            $this->version . '.1'
        );
    }

    private function is_template_edit_page($hook) {
        global $post_type;
        return ($hook === 'post.php' || $hook === 'post-new.php') && $post_type === 'design_template';
    }

    public function websocket_server_notice() {
        if (!$this->is_template_edit_page(get_current_screen()->base ?? '')) {
            return;
        }

        $server_status = $this->check_websocket_server_running();

        if (!$server_status['running']) {
            echo '<div class="notice notice-warning is-dismissible">';
            echo '<p><strong>🤖 AI Testing Integration:</strong> ';
            echo 'WebSocket Server ist nicht aktiv. ';
            echo '<a href="#" onclick="startWebSocketServer()" class="button button-small">Server starten</a> ';
            echo 'oder <a href="' . admin_url('admin.php?page=octo-websocket-settings') . '">Einstellungen öffnen</a>';
            echo '</p>';
            echo '</div>';
        } else {
            echo '<div class="notice notice-success is-dismissible">';
            echo '<p><strong>🤖 AI Testing Integration:</strong> ';
            echo 'WebSocket Server aktiv auf Port ' . $server_status['port'] . ' ✅';
            echo '</p>';
            echo '</div>';
        }
    }

    public function get_design_data_for_testing() {
        check_ajax_referer('octo_websocket_nonce', 'nonce');

        $post_id = intval($_POST['post_id'] ?? 0);

        if (!$post_id) {
            wp_send_json_error('Invalid post ID');
            return;
        }

        // Get template meta data
        $template_data = get_post_meta($post_id, '_design_template_data', true);
        $reference_lines = get_post_meta($post_id, '_reference_line_data', true);
        $size_data = get_post_meta($post_id, '_size_data', true);

        // Prepare design data for AI testing
        $design_data = array(
            'post_id' => $post_id,
            'template_type' => get_post_meta($post_id, '_template_type', true),
            'dimensions' => array(
                'width' => get_post_meta($post_id, '_canvas_width', true),
                'height' => get_post_meta($post_id, '_canvas_height', true)
            ),
            'dpi' => get_post_meta($post_id, '_canvas_dpi', true) ?: 300,
            'color_profile' => get_post_meta($post_id, '_color_profile', true) ?: 'CMYK',
            'template_data' => $template_data,
            'reference_lines' => $reference_lines,
            'size_data' => $size_data,
            'elements' => $this->extract_canvas_elements($template_data),
            'print_specifications' => array(
                'bleed' => get_post_meta($post_id, '_bleed_area', true) ?: 3,
                'safe_area' => get_post_meta($post_id, '_safe_area', true) ?: 5,
                'cut_line' => get_post_meta($post_id, '_cut_line', true) ?: 1
            )
        );

        wp_send_json_success($design_data);
    }

    private function extract_canvas_elements($template_data) {
        if (!$template_data || !is_array($template_data)) {
            return array();
        }

        $elements = array();

        // Extract elements from fabric.js canvas data
        if (isset($template_data['objects'])) {
            foreach ($template_data['objects'] as $object) {
                $element = array(
                    'type' => $object['type'] ?? 'unknown',
                    'left' => $object['left'] ?? 0,
                    'top' => $object['top'] ?? 0,
                    'width' => $object['width'] ?? 0,
                    'height' => $object['height'] ?? 0
                );

                if ($object['type'] === 'i-text' || $object['type'] === 'text') {
                    $element['text'] = $object['text'] ?? '';
                    $element['fontSize'] = $object['fontSize'] ?? 12;
                    $element['fontFamily'] = $object['fontFamily'] ?? 'Arial';
                    $element['fill'] = $object['fill'] ?? '#000000';
                } elseif ($object['type'] === 'image') {
                    $element['src'] = $object['src'] ?? '';
                }

                $elements[] = $element;
            }
        }

        return $elements;
    }

    public function save_test_results() {
        check_ajax_referer('octo_websocket_nonce', 'nonce');

        $post_id = intval($_POST['post_id'] ?? 0);
        $test_results = $_POST['test_results'] ?? array();

        if (!$post_id || !$test_results) {
            wp_send_json_error('Invalid data');
            return;
        }

        // Save test results as post meta
        $existing_results = get_post_meta($post_id, '_ai_test_results', true) ?: array();

        $new_result = array(
            'timestamp' => current_time('mysql'),
            'session_id' => sanitize_text_field($_POST['session_id'] ?? ''),
            'task_id' => sanitize_text_field($_POST['task_id'] ?? ''),
            'test_type' => sanitize_text_field($_POST['test_type'] ?? ''),
            'results' => $test_results,
            'user_id' => get_current_user_id()
        );

        $existing_results[] = $new_result;

        // Keep only last 10 test results
        if (count($existing_results) > 10) {
            $existing_results = array_slice($existing_results, -10);
        }

        update_post_meta($post_id, '_ai_test_results', $existing_results);

        wp_send_json_success(array(
            'message' => 'Test results saved',
            'result_id' => count($existing_results) - 1
        ));
    }

    public function start_websocket_server() {
        check_ajax_referer('octo_websocket_nonce', 'nonce');

        $port = get_option('octo_websocket_server_port', 8080);
        $node_path = get_option('octo_websocket_node_path', 'node');
        $server_script = OCTO_PRINT_DESIGNER_PATH . 'websocket-server.js';

        if (!file_exists($server_script)) {
            wp_send_json_error('WebSocket server script not found');
            return;
        }

        // Check if server is already running
        $status = $this->check_websocket_server_running();
        if ($status['running']) {
            wp_send_json_success(array(
                'message' => 'Server is already running',
                'port' => $status['port']
            ));
            return;
        }

        // Start server in background (Unix/Linux/Mac)
        if (function_exists('exec')) {
            $command = "cd " . escapeshellarg(OCTO_PRINT_DESIGNER_PATH) . " && $node_path websocket-server.js > /dev/null 2>&1 &";
            exec($command, $output, $return_code);

            // Wait a moment and check if server started
            sleep(2);
            $status = $this->check_websocket_server_running();

            if ($status['running']) {
                wp_send_json_success(array(
                    'message' => 'WebSocket server started successfully',
                    'port' => $port
                ));
            } else {
                wp_send_json_error('Failed to start WebSocket server');
            }
        } else {
            wp_send_json_error('Cannot start server: exec function not available');
        }
    }

    public function check_websocket_server_status() {
        check_ajax_referer('octo_websocket_nonce', 'nonce');

        $status = $this->check_websocket_server_running();
        wp_send_json_success($status);
    }

    private function check_websocket_server_running() {
        $port = get_option('octo_websocket_server_port', 8080);

        // Try to connect to WebSocket server
        $socket = @fsockopen('localhost', $port, $errno, $errstr, 1);

        if ($socket) {
            fclose($socket);
            return array('running' => true, 'port' => $port);
        }

        return array('running' => false, 'port' => $port, 'error' => $errstr);
    }

    private function get_websocket_server_url() {
        $port = get_option('octo_websocket_server_port', 8080);
        return "ws://localhost:{$port}/ws";
    }

    public function add_websocket_settings_page() {
        add_submenu_page(
            'edit.php?post_type=design_template',
            'AI Testing Integration',
            'AI Testing',
            'manage_options',
            'octo-websocket-settings',
            array($this, 'websocket_settings_page')
        );
    }

    public function websocket_settings_page() {
        if (isset($_POST['submit'])) {
            update_option('octo_websocket_server_port', intval($_POST['server_port']));
            update_option('octo_websocket_auto_start', isset($_POST['auto_start']));
            update_option('octo_websocket_node_path', sanitize_text_field($_POST['node_path']));

            echo '<div class="notice notice-success"><p>Settings saved!</p></div>';
        }

        $server_port = get_option('octo_websocket_server_port', 8080);
        $auto_start = get_option('octo_websocket_auto_start', true);
        $node_path = get_option('octo_websocket_node_path', 'node');
        $server_status = $this->check_websocket_server_running();

        ?>
        <div class="wrap">
            <h1>🤖 AI Testing Integration Settings</h1>

            <div class="card">
                <h2>Server Status</h2>
                <p>
                    Status: <?php echo $server_status['running'] ?
                        '<span style="color: green;">✅ Running on port ' . $server_status['port'] . '</span>' :
                        '<span style="color: red;">❌ Not running</span>'; ?>
                </p>
                <?php if (!$server_status['running']): ?>
                    <button type="button" class="button button-primary" onclick="startWebSocketServerFromSettings()">
                        Start Server
                    </button>
                <?php endif; ?>
            </div>

            <form method="post" action="">
                <table class="form-table">
                    <tr>
                        <th scope="row">Server Port</th>
                        <td>
                            <input type="number" name="server_port" value="<?php echo esc_attr($server_port); ?>" min="1024" max="65535" />
                            <p class="description">Port for the WebSocket server (default: 8080)</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Node.js Path</th>
                        <td>
                            <input type="text" name="node_path" value="<?php echo esc_attr($node_path); ?>" class="regular-text" />
                            <p class="description">Path to Node.js executable (default: node)</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Auto-start Server</th>
                        <td>
                            <input type="checkbox" name="auto_start" <?php checked($auto_start); ?> />
                            <label>Automatically start WebSocket server when needed</label>
                        </td>
                    </tr>
                </table>

                <?php submit_button(); ?>
            </form>

            <div class="card">
                <h2>How to Use</h2>
                <ol>
                    <li>Make sure Node.js is installed on your server</li>
                    <li>Navigate to any Design Template edit page</li>
                    <li>The AI Testing panel will appear automatically</li>
                    <li>Click "Test Current Design" to run AI-powered tests</li>
                    <li>View results in real-time via WebSocket connection</li>
                </ol>
            </div>
        </div>

        <script>
        function startWebSocketServerFromSettings() {
            fetch(ajaxurl, {
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                body: new URLSearchParams({
                    action: 'start_websocket_server',
                    nonce: '<?php echo wp_create_nonce('octo_websocket_nonce'); ?>'
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Server started successfully!');
                    location.reload();
                } else {
                    alert('Failed to start server: ' + (data.data || 'Unknown error'));
                }
            });
        }
        </script>
        <?php
    }
}

// Initialize the WebSocket integration
Octo_Print_Designer_WebSocket_Integration::get_instance();