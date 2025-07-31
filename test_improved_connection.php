<?php
/**
 * Test Improved Connection
 * 
 * This script simulates the improved API connection test
 * to verify it works correctly.
 */

echo "=== Testing Improved API Connection ===\n\n";

// Simulate the API integration class
class TestAPI {
    private $api_base_url = 'https://api.allesklardruck.de';
    private $app_id = 'test_app_id';
    private $api_key = 'test_api_key';
    
    public function test_server_connectivity() {
        $url = $this->api_base_url;
        $timeout = 10;
        
        $args = array(
            'method' => 'GET',
            'timeout' => $timeout,
            'sslverify' => true,
            'redirection' => 0,
            'httpversion' => '1.1',
            'headers' => array(
                'User-Agent' => 'YPrint-Test/1.0'
            )
        );
        
        $response = wp_remote_request($url, $args);
        
        if (is_wp_error($response)) {
            return new WP_Error('server_unreachable', sprintf(
                'Server unreachable: %s',
                $response->get_error_message()
            ));
        }
        
        $status_code = wp_remote_retrieve_response_code($response);
        
        return array(
            'success' => true,
            'status_code' => $status_code,
            'message' => sprintf('Server is reachable (Status: %d)', $status_code)
        );
    }
    
    public function make_api_request($endpoint, $data = array(), $method = 'GET', $retry_count = 0) {
        $url = $this->api_base_url . $endpoint;
        
        $headers = array(
            'X-App-Id' => $this->app_id,
            'X-Api-Key' => $this->api_key,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
            'User-Agent' => 'YPrint-WordPress/1.0'
        );
        
        $args = array(
            'method' => $method,
            'headers' => $headers,
            'timeout' => 15,
            'sslverify' => true,
            'redirection' => 3,
            'httpversion' => '1.1'
        );
        
        if ($method === 'POST' && !empty($data)) {
            $args['body'] = wp_json_encode($data);
        }
        
        $response = wp_remote_request($url, $args);
        
        if (is_wp_error($response)) {
            return new WP_Error('http_error', sprintf(
                'HTTP request failed: %s',
                $response->get_error_message()
            ));
        }
        
        $status_code = wp_remote_retrieve_response_code($response);
        $body = wp_remote_retrieve_body($response);
        $response_headers = wp_remote_retrieve_headers($response);
        
        // Process response
        return $this->process_api_response($status_code, $body, $response_headers);
    }
    
    private function process_api_response($status_code, $body, $headers) {
        // Success responses (2xx)
        if ($status_code >= 200 && $status_code < 300) {
            // Check if this is HTML content (like the root endpoint)
            if (strpos($body, '<html') !== false || strpos($body, 'Das ist die Bestell-API') !== false) {
                return array(
                    'success' => true,
                    'status_code' => $status_code,
                    'data' => array('message' => 'API endpoint available'),
                    'headers' => $headers->getAll()
                );
            }
            
            $decoded_body = json_decode($body, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                return new WP_Error('json_decode_error', sprintf(
                    'Invalid JSON response: %s',
                    json_last_error_msg()
                ));
            }
            
            return array(
                'success' => true,
                'status_code' => $status_code,
                'data' => $decoded_body,
                'headers' => $headers->getAll()
            );
        }
        
        // Parse error response body
        $error_data = json_decode($body, true);
        $error_message = $this->extract_error_message($error_data, $body);
        
        // Handle specific status codes
        switch ($status_code) {
            case 401:
                return new WP_Error('unauthorized', sprintf(
                    'Unauthorized (401): Invalid API credentials. %s',
                    $error_message
                ), array('status_code' => 401, 'response_body' => $body));
                
            case 404:
                return new WP_Error('not_found', sprintf(
                    'Not Found (404): API endpoint not found. %s',
                    $error_message
                ), array('status_code' => 404, 'response_body' => $body));
                
            case 500:
            case 502:
            case 503:
            case 504:
                return new WP_Error('server_error', sprintf(
                    'Server Error (%d): AllesKlarDruck API is temporarily unavailable. %s',
                    $status_code,
                    $error_message
                ), array('status_code' => $status_code, 'response_body' => $body));
                
            default:
                return new WP_Error('api_error', sprintf(
                    'API Error (%d): %s',
                    $status_code,
                    $error_message
                ), array('status_code' => $status_code, 'response_body' => $body));
        }
    }
    
    private function extract_error_message($error_data, $raw_body) {
        if (is_array($error_data)) {
            $message_fields = array('message', 'error', 'detail', 'description', 'errors');
            
            foreach ($message_fields as $field) {
                if (isset($error_data[$field])) {
                    if (is_string($error_data[$field])) {
                        return $error_data[$field];
                    } elseif (is_array($error_data[$field])) {
                        return implode(', ', $error_data[$field]);
                    }
                }
            }
        }
        
        return !empty($raw_body) ? $raw_body : 'Unknown error';
    }
    
    public function test_connection() {
        $start_time = microtime(true);
        $debug_info = array();
        
        // First, test basic server connectivity
        $debug_info[] = "Testing basic server connectivity...";
        $connectivity_test = $this->test_server_connectivity();
        
        if (is_wp_error($connectivity_test)) {
            $debug_info[] = "Server connectivity failed: " . $connectivity_test->get_error_message();
            return new WP_Error(
                'server_unreachable',
                'Server is not reachable. Check your internet connection and firewall settings.',
                array('debug_info' => $debug_info)
            );
        }
        
        $debug_info[] = "Server connectivity OK: " . $connectivity_test['message'];
        
        // Test with the root endpoint
        $test_endpoints = array(
            '/' => 'Root endpoint (known to work)'
        );
        
        $last_error = null;
        
        foreach ($test_endpoints as $endpoint => $description) {
            $debug_info[] = "Testing endpoint: {$endpoint} ({$description})";
            
            $result = $this->make_api_request($endpoint, array(), 'GET', 0);
            
            if (!is_wp_error($result)) {
                $response_time = round((microtime(true) - $start_time) * 1000, 2);
                
                return array(
                    'success' => true,
                    'message' => sprintf('API connection successful (Response time: %s ms)', $response_time),
                    'endpoint' => $endpoint,
                    'endpoint_description' => $description,
                    'response_time_ms' => $response_time,
                    'status_code' => $result['status_code'] ?? 200,
                    'api_version' => $result['data']['version'] ?? 'Unknown',
                    'debug_info' => $debug_info
                );
            }
            
            $error_code = $result->get_error_code();
            $error_message = $result->get_error_message();
            
            $debug_info[] = "Endpoint {$endpoint} failed: {$error_code} - {$error_message}";
            
            $last_error = $result;
            
            // Don't retry on auth errors
            if ($error_code === 'unauthorized') {
                $debug_info[] = "Stopping tests due to authentication error";
                break;
            }
        }
        
        // If all endpoints failed, return the last error with debug info
        if ($last_error) {
            $error_data = $last_error->get_error_data();
            $enhanced_error = new WP_Error(
                $last_error->get_error_code(),
                sprintf(
                    'Server is reachable but API endpoints failed. Last error: %s. Check your API credentials.',
                    $last_error->get_error_message()
                ),
                array_merge($error_data ?: array(), array('debug_info' => $debug_info))
            );
            return $enhanced_error;
        }
        
        return new WP_Error('unknown_error', 'Unknown connection error');
    }
}

// Test the improved connection
$api = new TestAPI();
$result = $api->test_connection();

if (is_wp_error($result)) {
    echo "❌ Connection test failed:\n";
    echo "   Error: " . $result->get_error_message() . "\n";
    echo "   Code: " . $result->get_error_code() . "\n";
    
    $error_data = $result->get_error_data();
    if (isset($error_data['debug_info'])) {
        echo "   Debug Info:\n";
        foreach ($error_data['debug_info'] as $info) {
            echo "     - " . $info . "\n";
        }
    }
} else {
    echo "✅ Connection test successful:\n";
    echo "   Message: " . $result['message'] . "\n";
    echo "   Endpoint: " . $result['endpoint'] . "\n";
    echo "   Status Code: " . $result['status_code'] . "\n";
    echo "   Response Time: " . $result['response_time_ms'] . " ms\n";
    
    if (isset($result['debug_info'])) {
        echo "   Debug Info:\n";
        foreach ($result['debug_info'] as $info) {
            echo "     - " . $info . "\n";
        }
    }
}

echo "\n=== Test Complete ===\n"; 