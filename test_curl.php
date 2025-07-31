<?php
/**
 * Simple cURL Test for AllesKlarDruck API
 * 
 * This script uses cURL to test connectivity to the AllesKlarDruck API
 * without requiring WordPress to be loaded.
 */

echo "=== AllesKlarDruck API cURL Test ===\n\n";

// Test 1: Basic connectivity test
echo "1. Testing basic connectivity to api.allesklardruck.de...\n";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://api.allesklardruck.de');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false);
curl_setopt($ch, CURLOPT_USERAGENT, 'YPrint-Test/1.0');

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
$info = curl_getinfo($ch);

curl_close($ch);

if ($error) {
    echo "❌ cURL Error: {$error}\n";
    echo "   This indicates a network connectivity issue.\n\n";
} else {
    echo "✅ Server is reachable (HTTP Code: {$http_code})\n";
    echo "   Response Time: " . round($info['total_time'] * 1000, 2) . " ms\n";
    echo "   SSL Info: " . $info['ssl_verify_result'] === 0 ? "OK" : "Failed" . "\n\n";
}

// Test 2: DNS resolution
echo "2. Testing DNS resolution...\n";
$host = 'api.allesklardruck.de';
$ip = gethostbyname($host);

if ($ip === $host) {
    echo "❌ DNS resolution failed for {$host}\n\n";
} else {
    echo "✅ DNS resolution successful: {$host} -> {$ip}\n\n";
}

// Test 3: SSL certificate
echo "3. Testing SSL certificate...\n";
$context = stream_context_create([
    'ssl' => [
        'verify_peer' => true,
        'verify_peer_name' => true,
    ]
]);

$result = @file_get_contents('https://api.allesklardruck.de', false, $context);

if ($result === false) {
    echo "❌ SSL connection failed\n";
    $ssl_error = error_get_last();
    if ($ssl_error) {
        echo "   Error: " . $ssl_error['message'] . "\n";
    }
    echo "\n";
} else {
    echo "✅ SSL certificate is valid\n\n";
}

// Test 4: Port connectivity
echo "4. Testing port 443 connectivity...\n";
$connection = @fsockopen('api.allesklardruck.de', 443, $errno, $errstr, 5);

if (!$connection) {
    echo "❌ Cannot connect to port 443: {$errstr} ({$errno})\n\n";
} else {
    echo "✅ Port 443 is accessible\n";
    fclose($connection);
    echo "\n";
}

echo "=== Network Test Summary ===\n";
echo "If all tests pass but the WordPress plugin still fails:\n";
echo "1. Check your WordPress configuration\n";
echo "2. Verify your API credentials\n";
echo "3. Check if your server has any firewall restrictions\n";
echo "4. Contact your hosting provider if network tests fail\n"; 