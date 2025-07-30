<?php
/**
 * AllesKlarDruck API Integration Class
 * 
 * Handles communication with the AllesKlarDruck API for print order processing.
 * 
 * @since 1.0.9
 */
class Octo_Print_API_Integration {
    
    /**
     * Single instance of the class
     */
    private static $instance;
    
    /**
     * API Base URL
     */
    private $api_base_url = 'https://api.allesklardruck.de';
    
    /**
     * API Configuration
     */
    private $app_id;
    private $api_key;
    
    /**
     * Get single instance
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Constructor
     */
    private function __construct() {
        $this->init();
    }
    
    /**
     * Initialize the integration
     */
    private function init() {
        // Load API credentials from WordPress options
        $this->app_id = get_option('octo_allesklardruck_app_id', '');
        $this->api_key = get_option('octo_allesklardruck_api_key', '');
        
        // Add admin hooks for settings
        add_action('admin_init', array($this, 'register_settings'));
        
        // Add AJAX handlers
        add_action('wp_ajax_octo_test_api_connection', array($this, 'ajax_test_api_connection'));
        add_action('wp_ajax_octo_send_order_to_api', array($this, 'ajax_send_order_to_api'));
    }
    
    /**
     * Register API settings in WordPress admin
     */
    public function register_settings() {
        // Register settings for API credentials
        register_setting('octo_print_api_settings', 'octo_allesklardruck_app_id', array(
            'type' => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'default' => ''
        ));
        
        register_setting('octo_print_api_settings', 'octo_allesklardruck_api_key', array(
            'type' => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'default' => ''
        ));
    }
    
    /**
     * Test API connection
     * 
     * @return array|WP_Error Response array or WP_Error on failure
     */
    public function test_connection() {
        if (empty($this->app_id) || empty($this->api_key)) {
            return new WP_Error('missing_credentials', __('API credentials are not configured', 'octo-print-designer'));
        }
        
        $response = $this->make_request('GET', '/');
        
        if (is_wp_error($response)) {
            return $response;
        }
        
        // Check if response indicates successful connection
        $status_code = wp_remote_retrieve_response_code($response);
        if ($status_code === 200) {
            return array(
                'success' => true,
                'message' => __('API connection successful', 'octo-print-designer'),
                'status_code' => $status_code
            );
        } else {
            return new WP_Error('api_error', sprintf(
                __('API connection failed with status code: %d', 'octo-print-designer'),
                $status_code
            ));
        }
    }
    
    /**
     * Send order to AllesKlarDruck API
     * 
     * @param array $order_data Formatted order data for API
     * @return array|WP_Error Response array or WP_Error on failure
     */
    public function send_order($order_data) {
        if (empty($this->app_id) || empty($this->api_key)) {
            return new WP_Error('missing_credentials', __('API credentials are not configured', 'octo-print-designer'));
        }
        
        if (empty($order_data)) {
            return new WP_Error('invalid_data', __('Order data is empty', 'octo-print-designer'));
        }
        
        $response = $this->make_request('POST', '/order', $order_data);
        
        if (is_wp_error($response)) {
            return $response;
        }
        
        $status_code = wp_remote_retrieve_response_code($response);
        $body = wp_remote_retrieve_body($response);
        
        // Decode JSON response
        $response_data = json_decode($body, true);
        
        if ($status_code === 200 || $status_code === 201) {
            return array(
                'success' => true,
                'message' => __('Order successfully sent to print provider', 'octo-print-designer'),
                'status_code' => $status_code,
                'response_data' => $response_data
            );
        } else {
            return new WP_Error('api_error', sprintf(
                __('API request failed with status code: %d. Response: %s', 'octo-print-designer'),
                $status_code,
                $body
            ));
        }
    }
    
    /**
     * Make HTTP request to API
     * 
     * @param string $method HTTP method (GET, POST, etc.)
     * @param string $endpoint API endpoint (e.g., '/order')
     * @param array $data Request data for POST requests
     * @return array|WP_Error HTTP response or WP_Error on failure
     */
    private function make_request($method, $endpoint, $data = array()) {
        $url = $this->api_base_url . $endpoint;
        
        // Prepare headers with authentication
        $headers = array(
            'X-App-Id' => $this->app_id,
            'X-Api-Key' => $this->api_key,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
            'User-Agent' => 'YPrint-WordPress-Plugin/' . OCTO_PRINT_DESIGNER_VERSION
        );
        
        // Prepare request arguments
        $args = array(
            'method' => $method,
            'headers' => $headers,
            'timeout' => 30, // 30 seconds timeout
            'sslverify' => true, // Always verify SSL in production
            'user-agent' => 'YPrint-WordPress-Plugin/' . OCTO_PRINT_DESIGNER_VERSION
        );
        
        // Add body data for POST requests
        if ($method === 'POST' && !empty($data)) {
            $args['body'] = wp_json_encode($data);
        }
        
        // Log the request for debugging (in development)
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('AllesKlarDruck API Request: ' . $method . ' ' . $url);
            if (!empty($data)) {
                error_log('Request Data: ' . wp_json_encode($data));
            }
        }
        
        // Make the request
        $response = wp_remote_request($url, $args);
        
        // Log the response for debugging (in development)
        if (defined('WP_DEBUG') && WP_DEBUG) {
            if (is_wp_error($response)) {
                error_log('AllesKlarDruck API Error: ' . $response->get_error_message());
            } else {
                error_log('AllesKlarDruck API Response Code: ' . wp_remote_retrieve_response_code($response));
                error_log('AllesKlarDruck API Response Body: ' . wp_remote_retrieve_body($response));
            }
        }
        
        return $response;
    }
    
    /**
     * AJAX handler for testing API connection
     */
    public function ajax_test_api_connection() {
        // Security check
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'octo_print_api_test')) {
            wp_send_json_error(array('message' => __('Security check failed', 'octo-print-designer')));
        }
        
        // Permission check
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => __('Insufficient permissions', 'octo-print-designer')));
        }
        
        // Test the connection
        $result = $this->test_connection();
        
        if (is_wp_error($result)) {
            wp_send_json_error(array(
                'message' => $result->get_error_message(),
                'code' => $result->get_error_code()
            ));
        }
        
        wp_send_json_success($result);
    }
    
    /**
     * AJAX handler for sending order to API (placeholder for Phase 4)
     */
    public function ajax_send_order_to_api() {
        // Security check
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'octo_send_to_print_provider')) {
            wp_send_json_error(array('message' => __('Security check failed', 'octo-print-designer')));
        }
        
        // Permission check
        if (!current_user_can('edit_shop_orders')) {
            wp_send_json_error(array('message' => __('Insufficient permissions', 'octo-print-designer')));
        }
        
        // Get order ID
        $order_id = isset($_POST['order_id']) ? absint($_POST['order_id']) : 0;
        if (!$order_id) {
            wp_send_json_error(array('message' => __('Invalid order ID', 'octo-print-designer')));
        }
        
        // TODO: Phase 2 - Implement order data transformation
        // TODO: Phase 4 - Implement actual API sending
        
        wp_send_json_error(array(
            'message' => __('API order sending not yet implemented. This will be completed in Phase 4.', 'octo-print-designer')
        ));
    }
    
    /**
     * Check if API credentials are configured
     * 
     * @return bool True if credentials are set
     */
    public function has_credentials() {
        return !empty($this->app_id) && !empty($this->api_key);
    }
    
    /**
     * Get API status for admin display
     * 
     * @return array Status information
     */
    public function get_api_status() {
        if (!$this->has_credentials()) {
            return array(
                'status' => 'not_configured',
                'message' => __('API credentials not configured', 'octo-print-designer'),
                'color' => '#dc3545'
            );
        }
        
        // Test connection (cached for 5 minutes to avoid too many requests)
        $cache_key = 'octo_api_status_cache';
        $cached_status = get_transient($cache_key);
        
        if ($cached_status !== false) {
            return $cached_status;
        }
        
        $test_result = $this->test_connection();
        
        if (is_wp_error($test_result)) {
            $status = array(
                'status' => 'error',
                'message' => sprintf(__('API Error: %s', 'octo-print-designer'), $test_result->get_error_message()),
                'color' => '#dc3545'
            );
        } else {
            $status = array(
                'status' => 'connected',
                'message' => __('API connection OK', 'octo-print-designer'),
                'color' => '#28a745'
            );
        }
        
        // Cache for 5 minutes
        set_transient($cache_key, $status, 5 * MINUTE_IN_SECONDS);
        
        return $status;
    }
}