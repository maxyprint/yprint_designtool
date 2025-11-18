<?php
/**
 * Simple API Connection Test Script
 * 
 * This script helps diagnose API connection issues by testing different aspects
 * of the connection to the AllesKlarDruck API.
 */

// Load WordPress (adjust path as needed)
require_once('wp-load.php');

// Check if we're in WordPress context
if (!function_exists('wp_remote_request')) {
    die("WordPress not loaded. Please run this from your WordPress root directory.\n");
}

echo "=== AllesKlarDruck API Connection Test ===\n\n";

// Test 1: Basic server connectivity
echo "1. Testing basic server connectivity...\n";
$url = 'https://api.allesklardruck.de';
$args = array(
    'method' => 'GET',
    'timeout' => 10,
    'sslverify' => true,
    'redirection' => 0,
    'httpversion' => '1.1'
);

$response = wp_remote_request($url, $args);

if (is_wp_error($response)) {
    echo "❌ Server connectivity failed: " . $response->get_error_message() . "\n";
    echo "   This indicates a network connectivity issue.\n\n";
} else {
    $status_code = wp_remote_retrieve_response_code($response);
    echo "✅ Server is reachable (Status: {$status_code})\n\n";
}

// Test 2: Check if credentials are configured
echo "2. Checking API credentials...\n";
$app_id = get_option('octo_allesklardruck_app_id', '');
$api_key = get_option('octo_allesklardruck_api_key', '');

if (empty($app_id) || empty($api_key)) {
    echo "❌ API credentials not configured\n";
    echo "   Please configure your App ID and API Key in the WordPress admin.\n\n";
} else {
    echo "✅ API credentials are configured\n";
    echo "   App ID: " . substr($app_id, 0, 8) . "...\n";
    echo "   API Key: " . substr($api_key, 0, 8) . "...\n\n";
}

// Test 3: Test authenticated request
if (!empty($app_id) && !empty($api_key)) {
    echo "3. Testing authenticated API request...\n";
    
    $headers = array(
        'X-App-Id' => $app_id,
        'X-Api-Key' => $api_key,
        'Accept' => 'application/json',
        'User-Agent' => 'YPrint-Test/1.0'
    );
    
    $args = array(
        'method' => 'GET',
        'headers' => $headers,
        'timeout' => 15,
        'sslverify' => true,
        'redirection' => 0,
        'httpversion' => '1.1'
    );
    
    $response = wp_remote_request($url, $args);
    
    if (is_wp_error($response)) {
        echo "❌ Authenticated request failed: " . $response->get_error_message() . "\n\n";
    } else {
        $status_code = wp_remote_retrieve_response_code($response);
        $body = wp_remote_retrieve_body($response);
        
        echo "✅ Authenticated request successful (Status: {$status_code})\n";
        
        if ($status_code >= 200 && $status_code < 300) {
            echo "   API is responding correctly\n";
        } elseif ($status_code === 401) {
            echo "   ❌ Authentication failed - check your API credentials\n";
        } elseif ($status_code === 404) {
            echo "   ⚠️  Endpoint not found - this might be normal for the root endpoint\n";
        } elseif ($status_code >= 500) {
            echo "   ❌ Server error - API server is having issues\n";
        } else {
            echo "   ⚠️  Unexpected status code\n";
        }
        
        if (!empty($body)) {
            echo "   Response preview: " . substr($body, 0, 200) . "...\n";
        }
        echo "\n";
    }
}

// Test 4: Test specific endpoints
echo "4. Testing specific API endpoints...\n";
$endpoints = array('/api/v1/health', '/api/health', '/health', '/status', '/');

foreach ($endpoints as $endpoint) {
    $test_url = $url . $endpoint;
    $args = array(
        'method' => 'GET',
        'headers' => $headers,
        'timeout' => 10,
        'sslverify' => true,
        'redirection' => 0,
        'httpversion' => '1.1'
    );
    
    $response = wp_remote_request($test_url, $args);
    
    if (is_wp_error($response)) {
        echo "   {$endpoint}: ❌ " . $response->get_error_message() . "\n";
    } else {
        $status_code = wp_remote_retrieve_response_code($response);
        if ($status_code >= 200 && $status_code < 300) {
            echo "   {$endpoint}: ✅ OK (Status: {$status_code})\n";
        } else {
            echo "   {$endpoint}: ⚠️  Status {$status_code}\n";
        }
    }
}

echo "\n=== Test Complete ===\n";
echo "If you're still having issues:\n";
echo "1. Check your internet connection\n";
echo "2. Verify your API credentials are correct\n";
echo "3. Contact AllesKlarDruck support if the server is unreachable\n";
echo "4. Check your WordPress debug log for more details\n"; 