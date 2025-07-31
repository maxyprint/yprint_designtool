<?php
/**
 * Test API Response
 * 
 * This script tests the actual API response from AllesKlarDruck
 * to understand what's causing the 500 error.
 */

echo "=== AllesKlarDruck API Response Test ===\n\n";

// Test different endpoints
$endpoints = array(
    '/' => 'Root endpoint',
    '/health' => 'Health endpoint',
    '/status' => 'Status endpoint',
    '/api/health' => 'API health endpoint',
    '/api/v1/health' => 'API v1 health endpoint'
);

foreach ($endpoints as $endpoint => $description) {
    echo "Testing {$description} ({$endpoint})...\n";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'https://api.allesklardruck.de' . $endpoint);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false);
    curl_setopt($ch, CURLOPT_USERAGENT, 'YPrint-Test/1.0');
    curl_setopt($ch, CURLOPT_HEADER, true);
    
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    $info = curl_getinfo($ch);
    
    curl_close($ch);
    
    if ($error) {
        echo "  ❌ cURL Error: {$error}\n";
    } else {
        echo "  ✅ HTTP Code: {$http_code}\n";
        echo "  📊 Response Time: " . round($info['total_time'] * 1000, 2) . " ms\n";
        
        // Split response into headers and body
        $header_size = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
        $headers = substr($response, 0, $header_size);
        $body = substr($response, $header_size);
        
        echo "  📄 Response Headers:\n";
        $header_lines = explode("\n", trim($headers));
        foreach ($header_lines as $line) {
            if (!empty(trim($line))) {
                echo "    " . trim($line) . "\n";
            }
        }
        
        echo "  📄 Response Body (first 500 chars):\n";
        echo "    " . substr($body, 0, 500) . "\n";
        
        if (strlen($body) > 500) {
            echo "    ... (truncated)\n";
        }
    }
    
    echo "\n";
}

echo "=== Test Complete ===\n";
echo "This will help identify which endpoints are working and what responses they return.\n"; 