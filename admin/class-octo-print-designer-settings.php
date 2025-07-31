<?php
class Octo_Print_Designer_Settings {
    private static $instance;
    private $options;
    private $option_name = 'octo_print_designer_settings';

    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        $this->options = get_option($this->option_name, array());
        
        add_action('admin_menu', array($this, 'add_plugin_page'));
        add_action('admin_menu', array($this, 'add_api_admin_menu'));
        add_action('admin_init', array($this, 'page_init'));
        add_action('wp_ajax_octo_test_api_connection', array($this, 'test_api_connection'));
    }

    public function add_plugin_page() {
        add_menu_page(
            'Print Designer Settings',
            'Print Designer',
            'manage_options',
            'octo-print-designer',
            array($this, 'create_admin_page'),
            'dashicons-art',
            20
        );
    }

    /**
     * Add admin menu item for API settings
     */
    public function add_api_admin_menu() {
        add_submenu_page(
            'octo-print-designer', // Parent menu (Print Designer)
            __('AllesKlarDruck API', 'octo-print-designer'),
            __('Print Provider API', 'octo-print-designer'),
            'manage_options',
            'octo-api-settings',
            array($this, 'render_api_settings_page')
        );
    }

    /**
     * AJAX handler for testing API connection
     */
    public function test_api_connection() {
        // Verify nonce
        if (!wp_verify_nonce($_POST['nonce'], 'octo_print_api_test')) {
            wp_die('Security check failed');
        }

        // Check permissions
        if (!current_user_can('manage_options')) {
            wp_die('Insufficient permissions');
        }

        try {
            $api_integration = Octo_Print_API_Integration::get_instance();
            $result = $api_integration->test_connection();
            
            if (is_wp_error($result)) {
                $error_data = $result->get_error_data();
                $debug_info = isset($error_data['debug_info']) ? $error_data['debug_info'] : array();
                
                wp_send_json_error(array(
                    'message' => $result->get_error_message(),
                    'code' => $result->get_error_code(),
                    'debug_info' => $debug_info,
                    'status_code' => isset($error_data['status_code']) ? $error_data['status_code'] : 'unknown'
                ));
            } else {
                wp_send_json_success(array(
                    'message' => $result['message'] ?? 'API connection successful!',
                    'status_code' => $result['status_code'] ?? '200',
                    'endpoint' => $result['endpoint'] ?? 'unknown',
                    'response_time_ms' => $result['response_time_ms'] ?? 0,
                    'debug_info' => $result['debug_info'] ?? array()
                ));
            }
        } catch (Exception $e) {
            wp_send_json_error(array(
                'message' => 'Exception occurred: ' . $e->getMessage(),
                'code' => 'exception',
                'debug_info' => array('Exception: ' . $e->getMessage())
            ));
        }
    }

    /**
     * Render API settings page
     */
    public function render_api_settings_page() {
        // Handle form submission
        if (isset($_POST['submit']) && wp_verify_nonce($_POST['_wpnonce'], 'octo_api_settings')) {
            update_option('octo_allesklardruck_app_id', sanitize_text_field($_POST['app_id']));
            update_option('octo_allesklardruck_api_key', sanitize_text_field($_POST['api_key']));
            
            echo '<div class="notice notice-success"><p>' . __('Settings saved!', 'octo-print-designer') . '</p></div>';
        }
        
        // Get current values
        $app_id = get_option('octo_allesklardruck_app_id', '');
        $api_key = get_option('octo_allesklardruck_api_key', '');
        
        // Get API status
        $api_integration = Octo_Print_API_Integration::get_instance();
        $api_status = $api_integration->get_api_status();
        
        ?>
        <div class="wrap">
            <h1><?php _e('AllesKlarDruck API Settings', 'octo-print-designer'); ?></h1>
            
            <!-- API Status Card -->
            <div class="card" style="max-width: 600px; margin-bottom: 20px;">
                <h2 class="title"><?php _e('API Connection Status', 'octo-print-designer'); ?></h2>
                <div style="padding: 15px;">
                    <div style="display: flex; align-items: center; margin-bottom: 10px;">
                        <span style="width: 12px; height: 12px; border-radius: 50%; background-color: <?php echo esc_attr($api_status['color']); ?>; margin-right: 8px;"></span>
                        <strong><?php echo esc_html($api_status['message']); ?></strong>
                    </div>
                    
                    <button type="button" id="test-api-connection" class="button button-secondary">
                        <?php _e('🔄 Test Connection', 'octo-print-designer'); ?>
                    </button>
                    <span class="test-spinner spinner" style="float: none; margin-left: 5px;"></span>
                    
                    <div id="test-result" style="margin-top: 10px;"></div>
                </div>
            </div>
            
            <!-- Settings Form -->
            <form method="post" action="">
                <?php wp_nonce_field('octo_api_settings'); ?>
                
                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label for="app_id"><?php _e('App ID', 'octo-print-designer'); ?></label>
                        </th>
                        <td>
                            <input type="text" id="app_id" name="app_id" value="<?php echo esc_attr($app_id); ?>" class="regular-text" />
                            <p class="description"><?php _e('Your AllesKlarDruck App ID (X-App-Id header)', 'octo-print-designer'); ?></p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            <label for="api_key"><?php _e('API Key', 'octo-print-designer'); ?></label>
                        </th>
                        <td>
                            <input type="password" id="api_key" name="api_key" value="<?php echo esc_attr($api_key); ?>" class="regular-text" />
                            <p class="description"><?php _e('Your AllesKlarDruck API Key (X-Api-Key header)', 'octo-print-designer'); ?></p>
                        </td>
                    </tr>
                </table>
                
                <?php submit_button(__('Save Settings', 'octo-print-designer')); ?>
            </form>
            
            <!-- Development Info -->
            <?php if (defined('WP_DEBUG') && WP_DEBUG) : ?>
                <div class="card" style="max-width: 600px; margin-top: 20px; background-color: #fff3cd;">
                    <h3><?php _e('Development Info', 'octo-print-designer'); ?></h3>
                    <div style="padding: 15px;">
                        <p><strong><?php _e('API Base URL:', 'octo-print-designer'); ?></strong> https://api.allesklardruck.de</p>
                        <p><strong><?php _e('Plugin Version:', 'octo-print-designer'); ?></strong> <?php echo OCTO_PRINT_DESIGNER_VERSION; ?></p>
                        <p><strong><?php _e('Has Credentials:', 'octo-print-designer'); ?></strong> <?php echo $api_integration->has_credentials() ? '✅ Yes' : '❌ No'; ?></p>
                        <p style="font-size: 11px; color: #666;">
                            <em><?php _e('Debug information is only shown when WP_DEBUG is enabled.', 'octo-print-designer'); ?></em>
                        </p>
                    </div>
                </div>
            <?php endif; ?>
        </div>
        
        <script>
            jQuery(document).ready(function($) {
                function createStatusMessage(type, title, message, details = null) {
                    var className = type === 'success' ? 'notice-success' : type === 'error' ? 'notice-error' : 'notice-info';
                    var icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
                    
                    var html = '<div class="notice ' + className + '" style="margin: 10px 0; padding: 10px;">';
                    html += '<p style="margin: 0 0 5px 0; font-weight: bold;">' + icon + ' ' + title + '</p>';
                    if (message) {
                        html += '<p style="margin: 0; font-size: 13px;">' + message + '</p>';
                    }
                    
                    if (details && details.length > 0) {
                        html += '<details style="margin-top: 8px; font-size: 11px; color: #666;">';
                        html += '<summary style="cursor: pointer; font-weight: bold;">🔍 Technical Details</summary>';
                        html += '<ul style="margin: 5px 0 0 15px; padding: 0;">';
                        for (var i = 0; i < details.length; i++) {
                            html += '<li>' + details[i] + '</li>';
                        }
                        html += '</ul></details>';
                    }
                    
                    html += '</div>';
                    return $(html);
                }
                
                $('#test-api-connection').on('click', function() {
                    var button = $(this);
                    var spinner = $('.test-spinner');
                    var resultDiv = $('#test-result');
                    
                    // Clear previous results
                    resultDiv.empty();
                    
                    // Show loading state
                    button.prop('disabled', true).text('🔄 Testing...');
                    spinner.css('visibility', 'visible');
                    
                    $.ajax({
                        url: ajaxurl,
                        type: 'POST',
                        data: {
                            action: 'octo_test_api_connection',
                            nonce: '<?php echo wp_create_nonce('octo_print_api_test'); ?>'
                        },
                        success: function(response) {
                            if (response.success) {
                                var title = 'API Connection Successful!';
                                var message = response.data.message || 'Connection test passed.';
                                var details = [
                                    'Status Code: ' + (response.data.status_code || 'Unknown'),
                                    'Endpoint: ' + (response.data.endpoint || 'Unknown'),
                                    'Response Time: ' + (response.data.response_time_ms || 'Unknown') + ' ms',
                                    'Test completed at: ' + new Date().toLocaleString()
                                ];
                                
                                // Add debug info if available
                                if (response.data.debug_info && response.data.debug_info.length > 0) {
                                    details.push('Debug Info:');
                                    for (var i = 0; i < response.data.debug_info.length; i++) {
                                        details.push('  • ' + response.data.debug_info[i]);
                                    }
                                }
                                
                                createStatusMessage('success', title, message, details)
                                    .appendTo(resultDiv);
                                    
                                button.text('✅ Connection OK!').css('background-color', '#46b450');
                                
                                // Reset button after 3 seconds
                                setTimeout(function() {
                                    button.prop('disabled', false).text('🔄 Test Connection').css('background-color', '');
                                }, 3000);
                                
                            } else {
                                var title = 'API Connection Failed';
                                var message = response.data && response.data.message ? response.data.message : 'Unknown error occurred.';
                                var details = [
                                    'Error Code: ' + (response.data && response.data.code ? response.data.code : 'unknown'),
                                    'Status Code: ' + (response.data && response.data.status_code ? response.data.status_code : 'unknown'),
                                    'Test completed at: ' + new Date().toLocaleString()
                                ];
                                
                                // Add debug info if available
                                if (response.data && response.data.debug_info && response.data.debug_info.length > 0) {
                                    details.push('Debug Info:');
                                    for (var i = 0; i < response.data.debug_info.length; i++) {
                                        details.push('  • ' + response.data.debug_info[i]);
                                    }
                                }
                                
                                createStatusMessage('error', title, message, details)
                                    .appendTo(resultDiv);
                                    
                                button.prop('disabled', false).text('❌ Test Failed').css('background-color', '#dc3545');
                                
                                // Reset button after 5 seconds
                                setTimeout(function() {
                                    button.text('🔄 Test Connection').css('background-color', '');
                                }, 5000);
                            }
                        },
                        error: function(xhr, status, error) {
                            var title = 'Network Error';
                            var message = 'Could not connect to server.';
                            var details = [
                                'HTTP Status: ' + (xhr.status || 'Unknown'),
                                'Error: ' + (error || 'Unknown'),
                                'Status: ' + (status || 'Unknown')
                            ];
                            
                            createStatusMessage('error', title, message, details)
                                .appendTo(resultDiv);
                                
                            button.prop('disabled', false).text('❌ Network Error').css('background-color', '#dc3545');
                            
                            // Reset button after 5 seconds
                            setTimeout(function() {
                                button.text('🔄 Test Connection').css('background-color', '');
                            }, 5000);
                        },
                        complete: function() {
                            spinner.css('visibility', 'hidden');
                        }
                    });
                });
            });
        </script>
        <?php
    }

    public function create_admin_page() {
        ?>
        <div class="wrap">
            <h2>Print Designer Settings</h2>
            <form method="post" action="options.php">
                <?php
                settings_fields('octo_print_designer_group');
                do_settings_sections('octo-print-designer-settings');
                submit_button();
                ?>
            </form>
        </div>
        <?php
    }

    public function page_init() {
        register_setting(
            'octo_print_designer_group',
            $this->option_name,
            array($this, 'sanitize')
        );

        add_settings_section(
            'octo_print_designer_general_section',
            'General Settings',
            array($this, 'print_section_info'),
            'octo-print-designer-settings'
        );

        add_settings_field(
            'redirect_slug',
            'Redirect Slug',
            array($this, 'redirect_slug_callback'),
            'octo-print-designer-settings',
            'octo_print_designer_general_section'
        );

        add_settings_field(
            'login_url',
            'Login URL',
            array($this, 'login_url_callback'),
            'octo-print-designer-settings',
            'octo_print_designer_general_section'
        );

        add_settings_field(
            'dpi',
            'Default DPI',
            array($this, 'dpi_callback'),
            'octo-print-designer-settings',
            'octo_print_designer_general_section'
        );

        add_settings_section(
            'octo_print_designer_wc_section',
            'WooCommerce Integration',
            array($this, 'print_wc_section_info'),
            'octo-print-designer-settings'
        );

        // Add base product setting
        add_settings_field(
            'base_product_id',
            'Base Product ID',
            array($this, 'base_product_id_callback'),
            'octo-print-designer-settings',
            'octo_print_designer_wc_section'
        );
    }

    public function sanitize($input) {
        $new_input = array();

        if (isset($input['redirect_slug'])) {
            $new_input['redirect_slug'] = sanitize_text_field($input['redirect_slug']);
        }

        if (isset($input['login_url'])) {
            $new_input['login_url'] = esc_url_raw($input['login_url']);
        }

        if (isset($input['dpi'])) {
            $new_input['dpi'] = absint($input['dpi']);
            if ($new_input['dpi'] < 72) { // Minimum standard screen DPI
                $new_input['dpi'] = 72;
            }
        }

        if (isset($input['base_product_id'])) {
            $product_id = absint($input['base_product_id']);
            
            // Verify product exists and is valid
            if ($product_id) {
                $product = wc_get_product($product_id);
                if (!$product) {
                    add_settings_error(
                        'base_product_id',
                        'invalid_product',
                        __('The specified product ID does not exist.', 'octo-print-designer')
                    );
                } else {
                    $new_input['base_product_id'] = $product_id;
                }
            }
        }

        return $new_input;
    }

    public function print_section_info() {
        print 'Enter your settings below:';
    }

    public function print_wc_section_info() {
        echo '<p>' . esc_html__('Configure WooCommerce integration settings for Print Designer.', 'octo-print-designer') . '</p>';
    }

    public function redirect_slug_callback() {
        $value = isset($this->options['redirect_slug']) ? esc_attr($this->options['redirect_slug']) : 'my-account';
        printf(
            '<input type="text" id="redirect_slug" name="%s[redirect_slug]" value="%s" /><p class="description">The slug to redirect to after saving a design (e.g., my-account)</p>',
            esc_attr($this->option_name),
            $value
        );
    }

    public function login_url_callback() {
        $value = isset($this->options['login_url']) ? esc_attr($this->options['login_url']) : wp_login_url();
        printf(
            '<input type="text" id="login_url" name="%s[login_url]" value="%s" class="regular-text" /><p class="description">%s</p>',
            esc_attr($this->option_name),
            $value,
            esc_html__('The URL where users will be redirected to login (e.g., /wp-login.php)', 'octo-print-designer')
        );
    }

    public function dpi_callback() {
        $value = isset($this->options['dpi']) ? absint($this->options['dpi']) : 300;
        printf(
            '<input type="number" id="dpi" name="%s[dpi]" value="%s" min="72" step="1" class="small-text" /><p class="description">%s</p>',
            esc_attr($this->option_name),
            $value,
            esc_html__('The DPI (Dots Per Inch) used for pixel to centimeter conversion. Standard print quality is 300 DPI.', 'octo-print-designer')
        );
    }

    public function base_product_id_callback() {
        $value = isset($this->options['base_product_id']) ? absint($this->options['base_product_id']) : '';
        
        // Get product title if ID exists
        $product_title = '';
        if ($value) {
            $product = wc_get_product($value);
            if ($product) {
                $product_title = $product->get_title();
            }
        }

        printf(
            '<input type="number" id="base_product_id" name="%s[base_product_id]" value="%s" class="regular-text" />',
            esc_attr($this->option_name),
            esc_attr($value)
        );

        if ($product_title) {
            printf(
                '<p class="description">%s: %s</p>',
                esc_html__('Current product', 'octo-print-designer'),
                esc_html($product_title)
            );
        }

        printf(
            '<p class="description">%s</p>',
            esc_html__('Enter the ID of the WooCommerce product to use as the base for print designs.', 'octo-print-designer')
        );
    }

    public static function get_redirect_slug() {
        $instance = self::get_instance();
        return isset($instance->options['redirect_slug']) ? $instance->options['redirect_slug'] : 'my-account';
    }

    public static function get_login_url() {
        $instance = self::get_instance();
        return isset($instance->options['login_url']) ? $instance->options['login_url'] : wp_login_url();
    }

    public static function get_dpi() {
        $instance = self::get_instance();
        return isset($instance->options['dpi']) ? absint($instance->options['dpi']) : 300;
    }

    public static function get_base_product_id() {
        $instance = self::get_instance();
        return isset($instance->options['base_product_id']) ? absint($instance->options['base_product_id']) : 0;
    }
}